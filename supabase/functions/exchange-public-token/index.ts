
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Initialize Plaid client with API key
const plaidClientId = Deno.env.get("PLAID_CLIENT_ID")
const plaidSecret = Deno.env.get("PLAID_SECRET")
const plaidBaseUrl = "https://sandbox.plaid.com" // Change to production URL for live app

// Initialize Supabase client
const supabaseUrl = "https://aqqxoahqxnxsmtjcgwax.supabase.co"
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabase = createClient(supabaseUrl, serviceRoleKey)

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!plaidClientId || !plaidSecret) {
      return new Response(
        JSON.stringify({ error: "Plaid API keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Parse request body
    const { public_token, institution, accounts } = await req.json()

    if (!public_token) {
      return new Response(
        JSON.stringify({ error: "Missing public token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${plaidBaseUrl}/item/public_token/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        public_token: public_token,
      }),
    })

    const exchangeData = await exchangeResponse.json()

    if (!exchangeResponse.ok) {
      console.error("Plaid API error:", exchangeData)
      return new Response(
        JSON.stringify({ error: "Failed to exchange public token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const accessToken = exchangeData.access_token
    const itemId = exchangeData.item_id

    // Store Plaid credentials in the user_plaid_credentials table
    const { error: credentialsError } = await supabase
      .from("user_plaid_credentials")
      .insert([
        {
          user_id: user.id,
          plaid_item_id: itemId,
          plaid_access_token: accessToken,
          institution_id: institution?.institution_id || null,
          institution_name: institution?.name || null,
        },
      ])

    if (credentialsError) {
      console.error("Error storing credentials:", credentialsError)
      return new Response(
        JSON.stringify({ error: "Failed to store bank credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get accounts data from Plaid
    const accountsResponse = await fetch(`${plaidBaseUrl}/accounts/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        access_token: accessToken,
      }),
    })

    const accountsData = await accountsResponse.json()

    if (!accountsResponse.ok) {
      console.error("Plaid API error:", accountsData)
      return new Response(
        JSON.stringify({ error: "Failed to retrieve accounts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create or update accounts in our database
    for (const plaidAccount of accountsData.accounts) {
      // Generate a deterministic color based on account type
      const accountColors = {
        depository: "#4f46e5", // Indigo
        credit: "#ef4444",     // Red
        loan: "#f59e0b",       // Amber
        investment: "#10b981", // Emerald
        other: "#6b7280",      // Gray
      }
      
      const type = plaidAccount.type || "other"
      const color = accountColors[type] || accountColors.other
      
      // Map Plaid account types to our types
      const typeMapping = {
        depository: plaidAccount.subtype === "savings" ? "savings" : "checking",
        credit: "credit",
        investment: "investment",
        loan: "other",
        other: "other",
      }
      
      // Check if we already have an account with this Plaid ID
      const { data: existingAccounts } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("plaid_account_id", plaidAccount.account_id)

      if (existingAccounts && existingAccounts.length > 0) {
        // Update existing account
        await supabase
          .from("accounts")
          .update({
            balance: plaidAccount.balances.current || 0,
            last_updated: new Date().toISOString(),
          })
          .eq("id", existingAccounts[0].id)
      } else {
        // Create new account
        await supabase
          .from("accounts")
          .insert([
            {
              user_id: user.id,
              name: plaidAccount.name || "Bank Account",
              type: typeMapping[type] || "other",
              balance: plaidAccount.balances.current || 0,
              currency: plaidAccount.balances.iso_currency_code || "USD",
              color: color,
              plaid_account_id: plaidAccount.account_id,
              plaid_item_id: itemId,
              last_updated: new Date().toISOString(),
            },
          ])
      }
    }

    // Now fetch transactions
    const transactionsResponse = await fetch(`${plaidBaseUrl}/transactions/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        access_token: accessToken,
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
        end_date: new Date().toISOString().split("T")[0], // Today
      }),
    })

    const transactionsData = await transactionsResponse.json()
    
    if (!transactionsResponse.ok) {
      console.error("Plaid API error:", transactionsData)
      // We'll continue even if we can't get transactions
    } else {
      // Store transactions
      for (const transaction of transactionsData.transactions || []) {
        // Get the corresponding account in our database
        const { data: accounts } = await supabase
          .from("accounts")
          .select("id")
          .eq("user_id", user.id)
          .eq("plaid_account_id", transaction.account_id)

        if (accounts && accounts.length > 0) {
          const accountId = accounts[0].id
          
          // Check if we already have this transaction
          const { data: existingTx } = await supabase
            .from("transactions")
            .select("id")
            .eq("user_id", user.id)
            .eq("plaid_transaction_id", transaction.transaction_id)
          
          if (!existingTx || existingTx.length === 0) {
            // Insert new transaction
            await supabase
              .from("transactions")
              .insert([
                {
                  user_id: user.id,
                  account_id: accountId,
                  plaid_transaction_id: transaction.transaction_id,
                  plaid_account_id: transaction.account_id,
                  date: transaction.date,
                  description: transaction.name,
                  amount: transaction.amount * -1, // Plaid reports expenses as positive, we want them negative
                  category: transaction.category ? transaction.category[0] : "Other",
                  currency: transaction.iso_currency_code || "USD",
                },
              ])
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

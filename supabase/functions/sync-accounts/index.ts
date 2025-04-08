
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Initialize Plaid client with API key
const plaidClientId = Deno.env.get("PLAID_CLIENT_ID")
const plaidSecret = Deno.env.get("PLAID_SECRET")
const plaidBaseUrl = "https://sandbox.plaid.com"

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

    // Get user's Plaid credentials
    const { data: credentials, error: credentialsError } = await supabase
      .from("user_plaid_credentials")
      .select("*")
      .eq("user_id", user.id)

    if (credentialsError) {
      console.error("Error fetching credentials:", credentialsError)
      return new Response(
        JSON.stringify({ error: "Failed to fetch bank credentials" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ error: "No linked bank accounts found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Process each linked account
    const results = []
    for (const cred of credentials) {
      const accessToken = cred.plaid_access_token

      // Get latest account balances
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
        results.push({
          item_id: cred.plaid_item_id,
          success: false,
          error: "Failed to retrieve accounts",
        })
        continue
      }

      // Update account balances
      for (const plaidAccount of accountsData.accounts) {
        const { data: accounts } = await supabase
          .from("accounts")
          .select("id")
          .eq("user_id", user.id)
          .eq("plaid_account_id", plaidAccount.account_id)

        if (accounts && accounts.length > 0) {
          await supabase
            .from("accounts")
            .update({
              balance: plaidAccount.balances.current || 0,
              last_updated: new Date().toISOString(),
            })
            .eq("id", accounts[0].id)
        }
      }

      // Get recent transactions
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7) // Get transactions from the last 7 days
      
      const transactionsResponse = await fetch(`${plaidBaseUrl}/transactions/get`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: plaidClientId,
          secret: plaidSecret,
          access_token: accessToken,
          start_date: startDate.toISOString().split("T")[0],
          end_date: new Date().toISOString().split("T")[0],
        }),
      })

      const transactionsData = await transactionsResponse.json()

      if (!transactionsResponse.ok) {
        console.error("Plaid API error:", transactionsData)
        results.push({
          item_id: cred.plaid_item_id,
          success: true,
          accounts_updated: true,
          transactions_updated: false,
        })
        continue
      }

      // Process new transactions
      let newTransactions = 0
      for (const transaction of transactionsData.transactions || []) {
        // Get the corresponding account
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
            
            newTransactions++
          }
        }
      }

      results.push({
        item_id: cred.plaid_item_id,
        success: true,
        accounts_updated: true,
        transactions_updated: true,
        new_transactions: newTransactions,
      })
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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

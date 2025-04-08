
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

    // Call Plaid API to create a link token
    const response = await fetch(`${plaidBaseUrl}/link/token/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: plaidClientId,
        secret: plaidSecret,
        user: {
          client_user_id: user.id,
        },
        client_name: "FinanceTracker",
        products: ["transactions"],
        country_codes: ["US"],
        language: "en",
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Plaid API error:", data)
      return new Response(
        JSON.stringify({ error: "Failed to create link token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify(data),
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

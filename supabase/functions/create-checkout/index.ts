import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Price IDs by currency
const PRICE_IDS: Record<string, string> = {
  BRL: "price_1T9WeR9zRtkcqMkVKnAW1QG6",
  USD: "price_1T9oAK9zRtkcqMkVcx6cT2rq",
  EUR: "price_1T9oAL9zRtkcqMkVZrJECKPt",
  GBP: "price_1T9oAM9zRtkcqMkVXqLPQrC6",
};

// Countries that CAN pay in BRL (Brazil only)
const BRL_ALLOWED_COUNTRIES = new Set(["BR"]);

function getClientCountry(req: Request): string | null {
  // Cloudflare / Supabase edge headers
  return (
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-country-code") ||
    req.headers.get("x-vercel-ip-country") ||
    null
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Parse body for currency preference
    let requestedCurrency = "BRL";
    try {
      const body = await req.json();
      if (body?.currency && typeof body.currency === "string") {
        requestedCurrency = body.currency.toUpperCase();
      }
    } catch {
      // No body or invalid JSON — default to BRL
    }

    // Geo-restriction: BRL only allowed from Brazil
    const country = getClientCountry(req);
    console.log(`[create-checkout] User country: ${country}, requested currency: ${requestedCurrency}`);

    if (requestedCurrency === "BRL" && country && !BRL_ALLOWED_COUNTRIES.has(country)) {
      // User outside Brazil trying to pay in BRL — force USD
      console.log(`[create-checkout] BRL blocked for country ${country}, switching to USD`);
      requestedCurrency = "USD";
    }

    // Validate currency
    const priceId = PRICE_IDS[requestedCurrency] || PRICE_IDS.USD;
    console.log(`[create-checkout] Using price: ${priceId} (${requestedCurrency})`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/upgrade?checkout=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

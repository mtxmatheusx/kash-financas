const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    return new Response(
      JSON.stringify({ error: "Evolution API not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get users in trial (premium with trial_end in the future)
  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("user_id, display_name, referral_code, trial_end, created_at")
    .eq("subscription_tier", "premium")
    .gt("trial_end", new Date().toISOString());

  if (profilesErr) {
    console.error("Error fetching profiles:", profilesErr);
    return new Response(JSON.stringify({ error: "DB error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!profiles || profiles.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: "no_trial_users" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const results: Array<{ user_id: string; status: string; error?: string }> = [];

  for (const profile of profiles) {
    // Check if it's been 5 days since account creation or a multiple of 5
    const createdAt = new Date(profile.created_at);
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Send on day 0 (first day) and every 5 days after
    if (daysSinceCreation > 0 && daysSinceCreation % 5 !== 0) {
      results.push({ user_id: profile.user_id, status: "skipped_not_5day" });
      continue;
    }

    // Get user phone from settings
    const { data: settings } = await supabase
      .from("user_settings")
      .select("phone, full_name, notify_whatsapp")
      .eq("user_id", profile.user_id)
      .single();

    if (!settings?.phone || !settings.notify_whatsapp) {
      results.push({ user_id: profile.user_id, status: "skipped_no_phone_or_disabled" });
      continue;
    }

    const nome = settings.full_name?.split(" ")[0] || profile.display_name?.split(" ")[0] || "Olá";
    const code = profile.referral_code || "—";
    const trialEnd = profile.trial_end ? new Date(profile.trial_end) : null;
    const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

    const mensagem = [
      `🎁 *Faciliten — Indique e Ganhe!*`,
      ``,
      `${nome}, você sabia que pode ganhar *+30 dias grátis* de Premium?`,
      ``,
      `📋 É simples:`,
      `1️⃣ Compartilhe seu código: *${code}*`,
      `2️⃣ Quando alguém se cadastrar com ele, você ganha +30 dias!`,
      `3️⃣ Sem limite de indicações!`,
      ``,
      `⏳ Seu trial termina em *${daysLeft} dias* — indique agora e continue Premium!`,
      ``,
      `🔗 Acesse: https://kash-financas.lovable.app/signup`,
    ].join("\n");

    let phone = settings.phone.replace(/\D/g, "");
    if (!phone.startsWith("55")) phone = "55" + phone;

    try {
      const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({ number: phone, text: mensagem }),
      });

      const body = await res.json();
      results.push({
        user_id: profile.user_id,
        status: res.ok ? "sent" : "failed",
        error: res.ok ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      results.push({
        user_id: profile.user_id,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  console.log(`[referral-reminder] Done: ${sent}/${results.length} sent`);

  return new Response(
    JSON.stringify({ total: results.length, sent, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

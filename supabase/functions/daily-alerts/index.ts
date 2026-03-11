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
    console.error("Evolution API secrets not configured");
    return new Response(
      JSON.stringify({ error: "Evolution API not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Current hour in BRT (UTC-3)
  const now = new Date();
  const brtHour = (now.getUTCHours() - 3 + 24) % 24;
  const currentTime = String(brtHour).padStart(2, "0") + ":00";

  console.log(`[daily-alerts] Running for time slot: ${currentTime}`);

  // Fetch users who want alerts at this hour
  const { data: usersSettings, error: settingsErr } = await supabase
    .from("user_settings")
    .select("user_id, phone, full_name, notification_time, notify_whatsapp, notify_due_dates, notify_due_days_before")
    .eq("notify_whatsapp", true)
    .eq("notification_time", currentTime);

  if (settingsErr) {
    console.error("Error fetching user settings:", settingsErr);
    return new Response(JSON.stringify({ error: "DB error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!usersSettings || usersSettings.length === 0) {
    console.log(`[daily-alerts] No users configured for ${currentTime}`);
    return new Response(JSON.stringify({ sent: 0, time: currentTime }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<{ user_id: string; status: string; error?: string }> = [];
  const today = now.toISOString().split("T")[0];

  for (const u of usersSettings) {
    if (!u.phone) {
      results.push({ user_id: u.user_id, status: "skipped_no_phone" });
      continue;
    }

    try {
      const daysAhead = u.notify_due_days_before ?? 3;
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + daysAhead);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      // Fetch transactions for this user
      const { data: txns } = await supabase
        .from("transactions")
        .select("type, status, amount, date, description")
        .eq("user_id", u.user_id);

      if (!txns || txns.length === 0) {
        results.push({ user_id: u.user_id, status: "skipped_no_data" });
        continue;
      }

      // Calculate balance (paid income - paid expenses)
      const saldo = txns.reduce((acc, t) => {
        if (t.status !== "paid") return acc;
        return t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount);
      }, 0);

      // Pending expenses in the next N days
      const upcoming = txns.filter(
        (t) => t.type === "expense" && t.status === "pending" && t.date >= today && t.date <= futureDateStr
      );

      if (upcoming.length === 0 && !u.notify_due_dates) {
        results.push({ user_id: u.user_id, status: "skipped_no_pending" });
        continue;
      }

      const totalPending = upcoming.reduce((acc, t) => acc + Number(t.amount), 0);
      const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      const nome = u.full_name ? u.full_name.split(" ")[0] : "Olá";

      const alerta = saldo < totalPending ? "\n⚠️ *Atenção: saldo pode ser insuficiente!*" : "";

      const topItems = upcoming.slice(0, 3).map((t) => `  • ${t.description || "Sem descrição"} — ${fmt(Number(t.amount))}`).join("\n");

      const mensagem = [
        `📊 *Faciliten — Resumo Diário*`,
        ``,
        `Bom dia, ${nome}! 👋`,
        ``,
        `💰 *Saldo atual:* ${fmt(saldo)}`,
        `📋 *Contas próximas:* ${upcoming.length} vencendo em ${daysAhead} dias`,
        `💸 *Total pendente:* ${fmt(totalPending)}`,
        upcoming.length > 0 ? `\n${topItems}` : "",
        alerta,
        ``,
        `Acesse o app para mais detalhes.`,
      ].filter(Boolean).join("\n");

      // Format phone
      let phone = u.phone.replace(/\D/g, "");
      if (!phone.startsWith("55")) phone = "55" + phone;

      // Send via Evolution API
      const res = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({ number: phone, text: mensagem }),
      });

      const body = await res.json();
      results.push({
        user_id: u.user_id,
        status: res.ok ? "sent" : "failed",
        error: res.ok ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      results.push({
        user_id: u.user_id,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown",
      });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  console.log(`[daily-alerts] Done: ${sent}/${results.length} sent for ${currentTime}`);

  return new Response(
    JSON.stringify({ time: currentTime, total: results.length, sent, results }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});

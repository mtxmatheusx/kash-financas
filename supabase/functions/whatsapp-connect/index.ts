const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
  const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
  const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");
  const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL");

  try {
    const { action } = await req.json();

    if (action === "generate_qr") {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        return new Response(
          JSON.stringify({ error: "Evolution API não configurada no servidor." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`,
        {
          method: "GET",
          headers: {
            apikey: EVOLUTION_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`Evolution API error [${response.status}]:`, errBody);
        return new Response(
          JSON.stringify({ error: "Falha ao gerar QR Code." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sync") {
      if (!N8N_WEBHOOK_URL) {
        return new Response(
          JSON.stringify({ error: "Webhook de sincronização não configurado." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract user from auth header
      const authHeader = req.headers.get("Authorization") || "";

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ action: "sync", timestamp: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`N8N webhook error [${response.status}]:`, errBody);
        return new Response(
          JSON.stringify({ error: "Falha na sincronização." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ message: "Sincronização concluída!", ...data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação não reconhecida." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("whatsapp-connect error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

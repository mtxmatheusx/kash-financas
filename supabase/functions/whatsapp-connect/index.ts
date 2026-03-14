const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toDataUri = (value: string) => {
  if (value.startsWith("data:image")) return value;
  return `data:image/png;base64,${value}`;
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
    let action: string | undefined;
    try {
      const payload = await req.json();
      action = payload?.action;
    } catch {
      return jsonResponse({ error: "Body JSON inválido." }, 400);
    }

    if (action === "generate_qr") {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        return jsonResponse({ error: "Evolution API não configurada no servidor." }, 500);
      }

      const baseUrl = EVOLUTION_API_URL.replace(/\/+$/, "");
      const endpoints = [
        `${baseUrl}/instance/connect/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
        `${baseUrl}/instance/qrcode/${encodeURIComponent(EVOLUTION_INSTANCE)}`,
      ];

      let lastStatus = 502;
      let lastBodyPreview = "";

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            apikey: EVOLUTION_API_KEY,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        const raw = await response.text();
        lastStatus = response.status;
        lastBodyPreview = raw.slice(0, 240);

        if (!response.ok) {
          console.error(`Evolution API error [${response.status}] @ ${endpoint}:`, raw);
          continue;
        }

        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(raw);
        } catch {
          console.error(`Evolution API non-JSON response @ ${endpoint}:`, raw);
          continue;
        }

        const base64Raw =
          (parsed.base64 as string | undefined) ??
          ((parsed.qrcode as { base64?: string } | undefined)?.base64) ??
          ((parsed.qr as { base64?: string } | undefined)?.base64);

        const instanceStatus = String(
          (parsed.instance as { status?: string; state?: string } | undefined)?.status ??
            (parsed.instance as { status?: string; state?: string } | undefined)?.state ??
            (parsed.status as string | undefined) ??
            ""
        ).toLowerCase();

        const connected = ["open", "connected", "online"].includes(instanceStatus);

        return jsonResponse({
          base64: base64Raw ? toDataUri(base64Raw) : null,
          connected,
          status: instanceStatus || null,
          raw: parsed,
        });
      }

      return jsonResponse(
        {
          error: "Falha ao gerar QR Code na Evolution API.",
          details: {
            status: lastStatus,
            preview: lastBodyPreview,
          },
        },
        502
      );
    }

    if (action === "sync") {
      if (!N8N_WEBHOOK_URL) {
        return jsonResponse({ error: "Webhook de sincronização não configurado." }, 500);
      }

      const authHeader = req.headers.get("Authorization") || "";

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: authHeader },
        body: JSON.stringify({ action: "sync", timestamp: new Date().toISOString() }),
      });

      const raw = await response.text();
      if (!response.ok) {
        console.error(`N8N webhook error [${response.status}]:`, raw);
        return jsonResponse({ error: "Falha na sincronização." }, response.status);
      }

      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(raw);
      } catch {
        data = { raw };
      }

      return jsonResponse({ message: "Sincronização concluída!", ...data });
    }

    return jsonResponse({ error: "Ação não reconhecida." }, 400);
  } catch (err) {
    console.error("whatsapp-connect error:", err);
    return jsonResponse({ error: "Erro interno do servidor." }, 500);
  }
});

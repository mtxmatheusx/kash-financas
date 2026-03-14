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

async function evolutionFetch(
  baseUrl: string,
  path: string,
  apiKey: string,
  method = "GET",
  body?: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: Record<string, unknown>; raw: string }> {
  const url = `${baseUrl}${path}`;
  const opts: RequestInit = {
    method,
    headers: {
      apikey: apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const raw = await res.text();
  let data: Record<string, unknown> = {};
  try { data = JSON.parse(raw); } catch { data = { raw }; }

  if (!res.ok) {
    console.error(`Evolution API [${res.status}] ${method} ${url}:`, raw.slice(0, 300));
  }
  return { ok: res.ok, status: res.status, data, raw };
}

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

      const baseUrl = EVOLUTION_API_URL.replace(/\/+$/, "").replace(/\/manager$/i, "");
      const instanceName = EVOLUTION_INSTANCE.includes("/")
        ? EVOLUTION_INSTANCE.split("/").filter(Boolean).pop() ?? EVOLUTION_INSTANCE
        : EVOLUTION_INSTANCE;

      // Step 1: Check if instance exists by fetching its status
      const fetchStatus = await evolutionFetch(baseUrl, `/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`, EVOLUTION_API_KEY);

      const instanceExists = fetchStatus.ok && (
        Array.isArray(fetchStatus.data) ? fetchStatus.data.length > 0 : !!fetchStatus.data?.instance
      );

      // Step 2: Create instance if it doesn't exist
      if (!instanceExists) {
        console.info(`Instance "${instanceName}" not found, creating...`);
        const createResult = await evolutionFetch(baseUrl, "/instance/create", EVOLUTION_API_KEY, "POST", {
          instanceName,
          integration: "WHATSAPP-BAILEYS",
          qrcode: true,
          reject_call: false,
          always_online: false,
        });

        if (!createResult.ok) {
          // Try without integration field (older API versions)
          const createResult2 = await evolutionFetch(baseUrl, "/instance/create", EVOLUTION_API_KEY, "POST", {
            instanceName,
            qrcode: true,
          });

          if (!createResult2.ok) {
            return jsonResponse({
              error: "Falha ao criar instância na Evolution API.",
              details: { status: createResult2.status, preview: createResult2.raw.slice(0, 240) },
            }, 502);
          }

          // Check if create response already has QR code
          const qrFromCreate = extractQr(createResult2.data);
          if (qrFromCreate) {
            return jsonResponse({
              base64: toDataUri(qrFromCreate),
              connected: false,
              status: "waiting",
              raw: createResult2.data,
            });
          }
        } else {
          // Check if create response already has QR code
          const qrFromCreate = extractQr(createResult.data);
          if (qrFromCreate) {
            return jsonResponse({
              base64: toDataUri(qrFromCreate),
              connected: false,
              status: "waiting",
              raw: createResult.data,
            });
          }
        }
      }

      // Step 3: Try to connect and get QR code
      const connectPaths = [
        `/instance/connect/${encodeURIComponent(instanceName)}`,
        `/instance/qrcode/${encodeURIComponent(instanceName)}`,
      ];

      for (const path of connectPaths) {
        const result = await evolutionFetch(baseUrl, path, EVOLUTION_API_KEY);
        if (!result.ok) continue;

        const base64Raw = extractQr(result.data);
        const instanceStatus = extractStatus(result.data);
        const connected = ["open", "connected", "online"].includes(instanceStatus);

        return jsonResponse({
          base64: base64Raw ? toDataUri(base64Raw) : null,
          connected,
          status: instanceStatus || null,
          raw: result.data,
        });
      }

      return jsonResponse({
        error: "Falha ao gerar QR Code na Evolution API.",
        details: { instanceName },
      }, 502);
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
      try { data = JSON.parse(raw); } catch { data = { raw }; }

      return jsonResponse({ message: "Sincronização concluída!", ...data });
    }

    return jsonResponse({ error: "Ação não reconhecida." }, 400);
  } catch (err) {
    console.error("whatsapp-connect error:", err);
    return jsonResponse({ error: "Erro interno do servidor." }, 500);
  }
});

function extractQr(data: Record<string, unknown>): string | null {
  return (
    (data.base64 as string | undefined) ??
    ((data.qrcode as Record<string, unknown> | undefined)?.base64 as string | undefined) ??
    ((data.qr as Record<string, unknown> | undefined)?.base64 as string | undefined) ??
    null
  );
}

function extractStatus(data: Record<string, unknown>): string {
  const inst = data.instance as Record<string, string> | undefined;
  return String(
    inst?.status ?? inst?.state ?? (data.status as string | undefined) ?? ""
  ).toLowerCase();
}

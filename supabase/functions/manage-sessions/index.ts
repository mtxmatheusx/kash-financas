import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_DEVICES = 2;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = userData.user;
    const body = await req.json();
    const { action, device_id, device_name } = body;

    if (action === "register") {
      // Check if this device is already registered
      const { data: existing } = await supabase
        .from("user_sessions")
        .select("id")
        .eq("user_id", user.id)
        .eq("device_id", device_id)
        .single();

      if (existing) {
        // Update last_active
        await supabase
          .from("user_sessions")
          .update({ last_active_at: new Date().toISOString(), device_name })
          .eq("id", existing.id);

        return new Response(JSON.stringify({ allowed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Count active sessions
      const { data: count } = await supabase.rpc("count_active_sessions", { _user_id: user.id });

      if ((count || 0) >= MAX_DEVICES) {
        // Get active sessions for display
        const { data: sessions } = await supabase
          .from("user_sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("last_active_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
          .order("last_active_at", { ascending: false });

        return new Response(JSON.stringify({
          allowed: false,
          reason: "device_limit",
          max_devices: MAX_DEVICES,
          active_sessions: sessions,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Register new session
      await supabase.from("user_sessions").insert({
        user_id: user.id,
        device_id,
        device_name: device_name || "Unknown device",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      });

      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "heartbeat") {
      await supabase
        .from("user_sessions")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("device_id", device_id);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "logout") {
      await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user.id)
        .eq("device_id", device_id);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "logout_device") {
      // Remove a specific session by id
      const { session_id } = body;
      await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", user.id)
        .eq("id", session_id);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list") {
      const { data: sessions } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("last_active_at", { ascending: false });

      return new Response(JSON.stringify({ sessions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cleanup stale sessions
    if (action === "cleanup") {
      await supabase.rpc("cleanup_stale_sessions");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("manage-sessions error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

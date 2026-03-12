import { useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique device ID and persist it
function getDeviceId(): string {
  const key = "faciliten-device-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows";
  if (/Linux/.test(ua)) return "Linux";
  return "Browser";
}

export function useSessionControl(userId: string | undefined) {
  const deviceId = getDeviceId();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerSession = useCallback(async (): Promise<{ allowed: boolean; active_sessions?: any[] }> => {
    if (!userId) return { allowed: true };
    try {
      const { data, error } = await supabase.functions.invoke("manage-sessions", {
        body: { action: "register", device_id: deviceId, device_name: getDeviceName() },
      });
      if (error) { console.error("Session register error:", error); return { allowed: true }; }
      return data;
    } catch { return { allowed: true }; }
  }, [userId, deviceId]);

  const logoutSession = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase.functions.invoke("manage-sessions", {
        body: { action: "logout", device_id: deviceId },
      });
    } catch { /* ignore */ }
  }, [userId, deviceId]);

  const logoutDevice = useCallback(async (sessionId: string) => {
    try {
      await supabase.functions.invoke("manage-sessions", {
        body: { action: "logout_device", session_id: sessionId },
      });
    } catch { /* ignore */ }
  }, []);

  const listSessions = useCallback(async () => {
    if (!userId) return [];
    try {
      const { data } = await supabase.functions.invoke("manage-sessions", {
        body: { action: "list" },
      });
      return data?.sessions || [];
    } catch { return []; }
  }, [userId]);

  // Heartbeat every 5 minutes
  useEffect(() => {
    if (!userId) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        await supabase.functions.invoke("manage-sessions", {
          body: { action: "heartbeat", device_id: deviceId },
        });
      } catch { /* ignore */ }
    }, 5 * 60 * 1000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [userId, deviceId]);

  return { deviceId, registerSession, logoutSession, logoutDevice, listSessions };
}

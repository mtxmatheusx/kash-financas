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

/** Invoke manage-sessions with automatic retry on 401 (token refresh). */
async function invokeWithRetry(
  body: Record<string, unknown>,
  retries = 1
): Promise<{ data: any; error: any }> {
  const result = await supabase.functions.invoke("manage-sessions", { body });

  // If we get a 401-style error, wait for token refresh and retry once
  if (
    retries > 0 &&
    result.error &&
    (String(result.error?.message || result.error).includes("Not authenticated") ||
      String(result.error?.message || result.error).includes("401"))
  ) {
    // Wait a short delay for the auto-refresh to complete
    await new Promise((r) => setTimeout(r, 1500));
    return invokeWithRetry(body, retries - 1);
  }

  return result;
}

export function useSessionControl(userId: string | undefined) {
  const deviceId = getDeviceId();
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const registerSession = useCallback(async (): Promise<{ allowed: boolean; active_sessions?: any[] }> => {
    if (!userId) return { allowed: true };
    try {
      const { data, error } = await invokeWithRetry({
        action: "register",
        device_id: deviceId,
        device_name: getDeviceName(),
      });
      if (error) {
        console.warn("Session register skipped:", error);
        return { allowed: true };
      }
      return data;
    } catch {
      return { allowed: true };
    }
  }, [userId, deviceId]);

  const logoutSession = useCallback(async () => {
    if (!userId) return;
    try {
      await invokeWithRetry({ action: "logout", device_id: deviceId });
    } catch { /* ignore */ }
  }, [userId, deviceId]);

  const logoutDevice = useCallback(async (sessionId: string) => {
    try {
      await invokeWithRetry({ action: "logout_device", session_id: sessionId });
    } catch { /* ignore */ }
  }, []);

  const listSessions = useCallback(async () => {
    if (!userId) return [];
    try {
      const { data } = await invokeWithRetry({ action: "list" });
      return data?.sessions || [];
    } catch {
      return [];
    }
  }, [userId]);

  // Heartbeat every 5 minutes
  useEffect(() => {
    if (!userId) return;
    heartbeatRef.current = setInterval(async () => {
      try {
        await invokeWithRetry({ action: "heartbeat", device_id: deviceId });
      } catch { /* ignore */ }
    }, 5 * 60 * 1000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [userId, deviceId]);

  return { deviceId, registerSession, logoutSession, logoutDevice, listSessions };
}

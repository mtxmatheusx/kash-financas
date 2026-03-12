import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionControl } from "@/hooks/useSessionControl";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Laptop, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";

const deviceIcon = (name: string) => {
  if (/iOS|Android/i.test(name)) return <Smartphone className="w-4 h-4" />;
  if (/Mac|Windows|Linux/i.test(name)) return <Laptop className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

export const ActiveDevices: React.FC = () => {
  const { user } = useAuth();
  const { t } = usePreferences();
  const { deviceId, listSessions, logoutDevice } = useSessionControl(user?.id);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await listSessions();
      setSessions(s);
      setLoading(false);
    })();
  }, [listSessions]);

  const handleRemove = async (sessionId: string) => {
    await logoutDevice(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success(t("sessions.deviceRemoved"));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t("sessions.title")}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground">{t("sessions.subtitle")}</p>

      {loading ? (
        <p className="text-xs text-muted-foreground">{t("common.loading")}</p>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t("sessions.noDevices")}</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const isCurrentDevice = s.device_id === deviceId;
            const lastActive = new Date(s.last_active_at);
            const isActive = Date.now() - lastActive.getTime() < 30 * 60 * 1000;

            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">{deviceIcon(s.device_name || "")}</div>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {s.device_name || "Unknown"} {isCurrentDevice && <span className="text-primary text-[10px]">({t("sessions.thisDevice")})</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isActive ? (
                        <span className="text-green-500">● {t("sessions.active")}</span>
                      ) : (
                        lastActive.toLocaleString()
                      )}
                    </p>
                  </div>
                </div>
                {!isCurrentDevice && (
                  <Button variant="ghost" size="sm" onClick={() => handleRemove(s.id)} className="text-destructive hover:text-destructive h-7 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X, Copy, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "referral_banner_last_dismissed";

function shouldShowBanner(isTrialing: boolean, trialDaysLeft: number | null): boolean {
  if (!isTrialing) return false;

  const lastDismissed = localStorage.getItem(STORAGE_KEY);
  if (!lastDismissed) return true; // first access

  const daysSince = (Date.now() - Number(lastDismissed)) / (1000 * 60 * 60 * 24);
  return daysSince >= 3;
}

export const ReferralDashboardBanner: React.FC = () => {
  const { profile, isTrialing, trialDaysLeft } = useAuth();
  const { t } = usePreferences();
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setVisible(shouldShowBanner(isTrialing, trialDaysLeft));
  }, [isTrialing, trialDaysLeft]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  const copyCode = async () => {
    if (!profile?.referral_code) return;
    await navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success(t("dashboard.referral.copied") || "Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!visible || !profile?.referral_code) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-4 md:p-5"
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/60 text-muted-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">
              {t("dashboard.referral.title")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("dashboard.referral.desc")}
            </p>
          </div>

          {/* Code + Copy */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-widest bg-card border border-border px-3 py-1.5 rounded-lg text-foreground">
              {profile.referral_code}
            </span>
            <Button size="sm" variant="outline" onClick={copyCode} className="gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (t("dashboard.referral.copied") || "Copiado") : (t("dashboard.referral.copy") || "Copiar")}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

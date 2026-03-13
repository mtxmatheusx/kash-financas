import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, ArrowRight, Clock, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const UpgradeDashboardBanner: React.FC = () => {
  const { isTrialing, trialDaysLeft, isPremium } = useAuth();
  const { t } = usePreferences();
  const [dismissed, setDismissed] = useState(false);

  if (!isTrialing || !isPremium || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-4 md:p-5"
      >
        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/60 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-3 pr-6 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {t("dashboard.upgrade.title")}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("dashboard.upgrade.desc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap lg:ml-auto">
            {trialDaysLeft !== null && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold">{trialDaysLeft}</span>
                <span>{t("dashboard.upgrade.daysLeft")}</span>
              </div>
            )}
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/upgrade">
                {t("dashboard.upgrade.cta")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

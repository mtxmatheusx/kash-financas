import React from "react";
import { motion } from "framer-motion";
import { Crown, ArrowRight, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const UpgradeDashboardBanner: React.FC = () => {
  const { isTrialing, trialDaysLeft, isPremium } = useAuth();
  const { t } = usePreferences();

  // Only show for users in trial
  if (!isTrialing || !isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-4 md:p-5"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
          <Crown className="w-6 h-6 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">
            {t("dashboard.upgrade.title")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("dashboard.upgrade.desc")}
          </p>
        </div>

        {/* Days left + CTA */}
        <div className="flex items-center gap-3">
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
  );
};

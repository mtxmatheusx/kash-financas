import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2, Gift, Copy, Clock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Upgrade: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isTrialing, trialDaysLeft, subscriptionEnd, profile } = useAuth();
  const { t, formatMoney, currency } = usePreferences();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const freeFeatures = [t("upgrade.free1"), t("upgrade.free2"), t("upgrade.free3")];
  const premiumFeatures = [
    t("upgrade.prem1"), t("upgrade.prem2"), t("upgrade.prem3"), t("upgrade.prem4"),
    t("upgrade.prem5"), t("upgrade.prem6"), t("upgrade.prem7"), t("upgrade.prem8"), t("upgrade.prem9"),
  ];

  const PRICE_MAP: Record<string, { amount: number; symbol: string; display: string }> = {
    BRL: { amount: 29.90, symbol: "R$", display: "R$ 29,90" },
    USD: { amount: 29.90, symbol: "$", display: "$29.90" },
    EUR: { amount: 27.90, symbol: "€", display: "€27.90" },
    GBP: { amount: 23.90, symbol: "£", display: "£23.90" },
  };
  const priceInfo = PRICE_MAP[currency] || PRICE_MAP.BRL;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { currency },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Checkout error");
    }
    setLoading(false);
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e.message || "Portal error");
    }
    setPortalLoading(false);
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      const url = `${window.location.origin}/signup?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(url);
      toast.success(t("upgrade.linkCopied"));
    }
  };

  if (isPremium && !isTrialing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">{t("upgrade.youArePremium")}</h2>
            <p className="text-muted-foreground">{t("upgrade.enjoyAll")}</p>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground">
                {t("upgrade.nextRenewal").replace("{date}", new Date(subscriptionEnd).toLocaleDateString())}
              </p>
            )}
            {profile?.referral_code && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5 justify-center">
                  <Gift className="h-4 w-4 text-primary" />
                  {t("upgrade.referralTitle")}
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-background px-3 py-1.5 rounded text-sm font-mono">{profile.referral_code}</code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard")}>{t("upgrade.goToDashboard")}</Button>
              <Button variant="outline" onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("upgrade.manageSubscription")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("upgrade.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("upgrade.subtitle")}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-fin-income/10 text-fin-income px-4 py-2 rounded-full text-sm font-semibold">
            <ShieldCheck className="h-4 w-4" />
            {t("upgrade.noCard")}
          </div>
          {isTrialing && trialDaysLeft !== null && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              {trialDaysLeft > 0
                ? t("upgrade.trialBanner").replace("{days}", String(trialDaysLeft)).replace(/{plural}/g, trialDaysLeft > 1 ? "s" : "")
                : t("upgrade.trialExpiredToday")}
            </div>
          )}
          {!isPremium && !isTrialing && (
            <div className="mt-4 inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              {t("upgrade.trialExpired")}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>{t("upgrade.freeTitle")}</CardTitle>
              <CardDescription>{t("upgrade.freeDesc")}</CardDescription>
              <p className="text-3xl font-bold text-foreground mt-2">{formatMoney(0)}<span className="text-sm text-muted-foreground font-normal">{t("upgrade.perMonth")}</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/dashboard")}>
                {!isPremium && !isTrialing ? t("upgrade.freePlan") : t("upgrade.freeContinue")}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              {t("upgrade.premiumBadge")}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" />{t("upgrade.premiumTitle")}</CardTitle>
              <CardDescription>{t("upgrade.premiumDesc")}</CardDescription>
              <p className="text-3xl font-bold text-foreground mt-2">{priceInfo.display}<span className="text-sm text-muted-foreground font-normal">{t("upgrade.perMonth")}</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {premiumFeatures.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-primary shrink-0" /><span>{f}</span></li>
                ))}
              </ul>
              <Button className="w-full mt-6" onClick={handleCheckout} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Crown className="h-4 w-4 mr-2" />}
                {loading ? t("upgrade.redirecting") : t("upgrade.subscribe")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {profile?.referral_code && (
          <Card className="mt-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t("upgrade.referralProgram")}</p>
                    <p className="text-xs text-muted-foreground">{t("upgrade.referralDesc")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">{profile.referral_code}</code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode}>
                    <Copy className="h-3.5 w-3.5 mr-1" />{t("upgrade.copyLink")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>{t("upgrade.backToDashboard")}</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Upgrade;

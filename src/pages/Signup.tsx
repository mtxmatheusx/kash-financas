import React, { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Check, X, Gift } from "lucide-react";
import { motion } from "framer-motion";
import facilitenLogo from "@/assets/faciliten-logo.png";
import { usePreferences } from "@/contexts/PreferencesContext";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [searchParams] = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || localStorage.getItem("faciliten_referral_code") || "");
  const [loading, setLoading] = useState(false);

  const passwordRules = [
    { test: (p: string) => p.length >= 8, label: t("auth.password.min8") },
    { test: (p: string) => /[A-Z]/.test(p), label: t("auth.password.uppercase") },
    { test: (p: string) => /[0-9]/.test(p), label: t("auth.password.number") },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: t("auth.password.special") },
  ];

  const allRulesPass = passwordRules.every((r) => r.test(password));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRulesPass) {
      toast.error(t("auth.signup.errorPassword"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("auth.signup.errorMismatch"));
      return;
    }

    setLoading(true);

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName, referral_code: referralCode || undefined },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      if (referralCode && signUpData.user) {
        try {
          await supabase.functions.invoke("apply-referral", {
            body: { referral_code: referralCode },
          });
        } catch (e) {
          console.error("Referral apply failed:", e);
        }
      }
      toast.success(t("auth.signup.success"));
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img src={facilitenLogo} alt="Faciliten" className="w-12 h-12 rounded-xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Faciliten</h1>
          <p className="text-muted-foreground mt-1">{t("auth.signup.trialBadge")}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium">
            ✓ {t("auth.signup.noCreditCard")}
          </div>
        </div>

        {/* Referral promotion banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 text-center relative overflow-hidden"
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
          <h3 className="text-base font-bold text-foreground mb-1">{t("auth.signup.referralPromoTitle")}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("auth.signup.referralPromoDesc")}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
            ✓ {t("auth.signup.description")}
          </div>
        </motion.div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t("auth.signup.title")}</CardTitle>
            <CardDescription>{t("auth.signup.description")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.signup.displayName")}</Label>
                <Input
                  id="name"
                  placeholder={t("auth.signup.displayNamePlaceholder")}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.signup.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.signup.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.signup.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordRules.map((rule, i) => {
                      const passes = rule.test(password);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {passes ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-destructive" />
                          )}
                          <span className={passes ? "text-green-500" : "text-muted-foreground"}>
                            {rule.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("auth.signup.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">{t("auth.signup.passwordMismatch")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral" className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  {t("auth.signup.referralLabel")}
                </Label>
                <Input
                  id="referral"
                  placeholder={t("auth.signup.referralPlaceholder")}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <p className="text-xs font-semibold text-primary/80">
                  {t("auth.signup.referralHint")}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading || !allRulesPass}>
                {loading ? t("auth.signup.loading") : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {t("auth.signup.submit")}
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                {t("auth.signup.hasAccount")}{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t("auth.signup.login")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;

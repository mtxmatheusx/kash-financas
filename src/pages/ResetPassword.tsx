import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const passwordRules = [
    { test: (p: string) => p.length >= 8, label: t("auth.password.min8") },
    { test: (p: string) => /[A-Z]/.test(p), label: t("auth.password.uppercase") },
    { test: (p: string) => /[0-9]/.test(p), label: t("auth.password.number") },
    { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: t("auth.password.special") },
  ];

  const allRulesPass = passwordRules.every((r) => r.test(password));

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) setIsRecovery(true);
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPass) { toast.error(t("resetPw.reqNotMet")); return; }
    if (password !== confirmPassword) { toast.error(t("resetPw.mismatch")); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success(t("resetPw.success")); navigate("/"); }
    setLoading(false);
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">{t("resetPw.invalidLink")}</p>
            <Button className="mt-4" onClick={() => navigate("/forgot-password")}>{t("resetPw.requestNew")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t("resetPw.newPassword")}</CardTitle>
            <CardDescription>{t("resetPw.setNew")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("resetPw.newPassword")}</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordRules.map((rule, i) => {
                      const passes = rule.test(password);
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {passes ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-destructive" />}
                          <span className={passes ? "text-green-500" : "text-muted-foreground"}>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">{t("resetPw.confirmNew")}</Label>
                <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading || !allRulesPass}>
                {loading ? t("resetPw.updating") : t("resetPw.update")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;

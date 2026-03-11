import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import facilitenLogo from "@/assets/faciliten-logo.png";
import { usePreferences } from "@/contexts/PreferencesContext";

const ForgotPassword: React.FC = () => {
  const { t } = usePreferences();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success(t("auth.forgot.success"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <img src={facilitenLogo} alt="Faciliten" className="w-12 h-12 rounded-xl mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Faciliten</h1>
        </div>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">{t("auth.forgot.title")}</CardTitle>
            <CardDescription>
              {sent ? t("auth.forgot.sent") : t("auth.forgot.description")}
            </CardDescription>
          </CardHeader>
          {sent ? (
            <CardContent className="text-center py-6">
              <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {t("auth.forgot.sentDetail")} <strong>{email}</strong>. {t("auth.forgot.sentSpam")}
              </p>
            </CardContent>
          ) : (
            <form onSubmit={handleReset}>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.forgot.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.forgot.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.forgot.loading") : t("auth.forgot.submit")}
                </Button>
              </CardFooter>
            </form>
          )}
          <div className="px-6 pb-6 text-center">
            <Link to="/login" className="text-sm text-primary hover:underline">
              {t("auth.forgot.backToLogin")}
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

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

const passwordRules = [
  { test: (p: string) => p.length >= 8, label: "Mínimo 8 caracteres" },
  { test: (p: string) => /[A-Z]/.test(p), label: "Uma letra maiúscula" },
  { test: (p: string) => /[0-9]/.test(p), label: "Um número" },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "Um caractere especial" },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || localStorage.getItem("faciliten_referral_code") || "");
  const [loading, setLoading] = useState(false);

  const allRulesPass = passwordRules.every((r) => r.test(password));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allRulesPass) {
      toast.error("A senha não atende aos requisitos de segurança");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
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
      // Apply referral if code provided
      if (referralCode && signUpData.user) {
        try {
          await supabase.functions.invoke("apply-referral", {
            body: { referral_code: referralCode },
          });
        } catch (e) {
          console.error("Referral apply failed:", e);
        }
      }
      toast.success("Conta criada com 30 dias de Premium grátis! Verifique seu e-mail para confirmar.");
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
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-lg">K</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Kash</h1>
          <p className="text-muted-foreground mt-1">30 dias de Premium grátis</p>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Criar conta</CardTitle>
            <CardDescription>Comece com acesso completo por 30 dias — sem cartão de crédito</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome de exibição</Label>
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-destructive">As senhas não coincidem</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral" className="flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-primary" />
                  Código de indicação (opcional)
                </Label>
                <Input
                  id="referral"
                  placeholder="Ex: AB12CD34"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Tem um código? Quem te indicou ganha +60 dias grátis!
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading || !allRulesPass}>
                {loading ? "Criando conta..." : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Começar 30 dias grátis
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Já tem conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Entrar
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

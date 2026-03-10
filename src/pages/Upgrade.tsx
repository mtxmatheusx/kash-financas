import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2, Gift, Copy, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const freeFeatures = [
  "Dashboard básico",
  "Controle de Receitas",
  "Controle de Despesas",
];

const premiumFeatures = [
  "Tudo do plano gratuito",
  "Investimentos",
  "Metas financeiras",
  "Visão Mensal completa",
  "Planejamento Financeiro",
  "DRE e EBITDA (Empresa)",
  "Importação de planilhas",
  "Consultor IA ilimitado",
  "Suporte prioritário",
];

const Upgrade: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, isTrialing, trialDaysLeft, subscriptionEnd, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao iniciar checkout");
    }
    setLoading(false);
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro ao abrir portal");
    }
    setPortalLoading(false);
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      const url = `${window.location.origin}/signup?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(url);
      toast.success("Link de indicação copiado!");
    }
  };

  // Active paid subscriber
  if (isPremium && !isTrialing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Você é Premium!</h2>
            <p className="text-muted-foreground">Aproveite todos os recursos do Kash.</p>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground">
                Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString("pt-BR")}
              </p>
            )}

            {/* Referral section */}
            {profile?.referral_code && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5 justify-center">
                  <Gift className="h-4 w-4 text-primary" />
                  Indique e ganhe +60 dias grátis
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-background px-3 py-1.5 rounded text-sm font-mono">
                    {profile.referral_code}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard")}>Ir para o Dashboard</Button>
              <Button variant="outline" onClick={handleManage} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerenciar assinatura"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Escolha seu plano</h1>
          <p className="text-muted-foreground mt-2">Desbloqueie todo o potencial do Kash</p>

          {/* Trial banner */}
          {isTrialing && trialDaysLeft !== null && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              {trialDaysLeft > 0
                ? `${trialDaysLeft} dia${trialDaysLeft > 1 ? 's' : ''} restante${trialDaysLeft > 1 ? 's' : ''} de trial`
                : 'Seu trial expirou hoje'}
            </div>
          )}
          {!isPremium && !isTrialing && (
            <div className="mt-4 inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              Seu trial expirou — assine para continuar
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Free */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Gratuito</CardTitle>
              <CardDescription>Para começar a organizar suas finanças</CardDescription>
              <p className="text-3xl font-bold text-foreground mt-2">R$ 0<span className="text-sm text-muted-foreground font-normal">/mês</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/dashboard")}>
                {!isPremium && !isTrialing ? "Plano atual" : "Continuar grátis"}
              </Button>
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-primary/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
              Recomendado
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium
              </CardTitle>
              <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
              <p className="text-3xl font-bold text-foreground mt-2">R$ 29,90<span className="text-sm text-muted-foreground font-normal">/mês</span></p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" onClick={handleCheckout} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Crown className="h-4 w-4 mr-2" />
                )}
                {loading ? "Redirecionando..." : "Assinar Premium"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Referral section */}
        {profile?.referral_code && (
          <Card className="mt-6 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Programa de indicação</p>
                    <p className="text-xs text-muted-foreground">Indique amigos e ganhe +60 dias de Premium</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">
                    {profile.referral_code}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyReferralCode}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copiar link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Upgrade;

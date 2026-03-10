import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Loader2 } from "lucide-react";
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
  const { isPremium, subscriptionEnd } = useAuth();
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

  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Você é Premium!</h2>
            <p className="text-muted-foreground mb-1">Aproveite todos os recursos do Kash.</p>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground mb-4">
                Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/")}>Ir para o Dashboard</Button>
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
              <Button variant="outline" className="w-full mt-6" onClick={() => navigate("/")}>
                Plano atual
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

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Voltar ao Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Upgrade;

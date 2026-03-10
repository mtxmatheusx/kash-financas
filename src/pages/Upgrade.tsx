import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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
  const { isPremium } = useAuth();

  if (isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Você já é Premium!</h2>
            <p className="text-muted-foreground mb-4">Aproveite todos os recursos do FinControl.</p>
            <Button onClick={() => navigate("/")}>Ir para o Dashboard</Button>
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
          <p className="text-muted-foreground mt-2">Desbloqueie todo o potencial do FinControl</p>
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
              <Button className="w-full mt-6" onClick={() => toast.info("Integração de pagamento em breve!")}>
                <Crown className="h-4 w-4 mr-2" />
                Assinar Premium
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

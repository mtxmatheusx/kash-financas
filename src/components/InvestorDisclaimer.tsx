import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InvestorDisclaimerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const DISCLAIMER_CLAUSES = [
  "Entendo que todas as informações fornecidas pelo Consultor de Investimentos são de caráter **educacional e informativo**, não constituindo recomendação de compra ou venda de ativos financeiros.",
  "Reconheço que **toda decisão de investimento é de minha exclusiva responsabilidade**, incluindo eventuais ganhos ou perdas decorrentes dessas decisões.",
  "Compreendo que o Consultor de Investimentos **não é um profissional certificado** pela CVM (Comissão de Valores Mobiliários) e que as análises apresentadas não substituem o aconselhamento de um consultor financeiro credenciado.",
  "Estou ciente de que **rentabilidade passada não é garantia de rentabilidade futura** e que investimentos em renda variável podem resultar em perda total ou parcial do capital investido.",
  "Aceito que o Faciliten e seus desenvolvedores **não se responsabilizam por prejuízos financeiros** resultantes de decisões tomadas com base nas informações do consultor de investimentos.",
];

export const InvestorDisclaimer: React.FC<InvestorDisclaimerProps> = ({ onAccept, onDecline }) => {
  const [checks, setChecks] = useState<boolean[]>(new Array(DISCLAIMER_CLAUSES.length).fill(false));
  const allChecked = checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks(prev => prev.map((v, i) => (i === index ? !v : v)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm rounded-2xl"
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-fin-pending/10 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6 text-fin-pending" />
        </div>
        <h3 className="text-title text-foreground">Termo de Responsabilidade</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Antes de utilizar o Consultor de Investimentos, leia e aceite os termos abaixo.
        </p>
      </div>

      {/* Clauses */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 pb-4">
          {DISCLAIMER_CLAUSES.map((clause, i) => (
            <motion.label
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="flex gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <Checkbox
                checked={checks[i]}
                onCheckedChange={() => toggleCheck(i)}
                className="mt-0.5 shrink-0"
              />
              <span className="text-xs text-foreground leading-relaxed">
                {clause.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="font-semibold text-foreground">{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </span>
            </motion.label>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 space-y-2 border-t border-border/50">
        <div className="flex items-center gap-1.5 justify-center">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Marque todas as caixas para continuar</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onDecline}
          >
            Voltar
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={!allChecked}
            onClick={onAccept}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aceitar e continuar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

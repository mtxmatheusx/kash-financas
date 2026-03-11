import React from "react";
import { Check, X, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  status: "paid" | "pending";
  entry_type?: "single" | "installment" | "recurring";
  frequency?: "monthly" | "yearly";
  installments?: number;
}

interface TransactionConfirmCardProps {
  transaction: ParsedTransaction;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const TransactionConfirmCard: React.FC<TransactionConfirmCardProps> = ({
  transaction,
  onConfirm,
  onCancel,
}) => {
  const isIncome = transaction.type === "income";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mx-3 my-2 rounded-xl border border-border/60 bg-muted/40 p-3 space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center",
          isIncome ? "bg-fin-income/15 text-fin-income" : "bg-fin-expense/15 text-fin-expense"
        )}>
          {isIncome ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{transaction.description}</p>
          <p className="text-[10px] text-muted-foreground">{transaction.category} · {transaction.status === "paid" ? "Pago" : "Pendente"}</p>
        </div>
        <span className={cn(
          "text-sm font-bold font-mono",
          isIncome ? "text-fin-income" : "text-fin-expense"
        )}>
          {isIncome ? "+" : "-"}{formatBRL(transaction.amount)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-3 h-3" /> Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-primary-foreground transition-colors"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)",
          }}
        >
          <Check className="w-3 h-3" /> Confirmar
        </button>
      </div>
    </motion.div>
  );
};

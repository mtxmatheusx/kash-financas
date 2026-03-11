import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, PiggyBank, Target, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TransactionRow, InvestmentRow, GoalRow } from "@/lib/types";

interface Insight {
  type: string;
  title: string;
  description: string;
  icon: string;
  severity: "info" | "warning" | "success" | "alert";
}

interface FinancialInsightsProps {
  transactions: TransactionRow[];
  investments?: { total: number };
  goals?: GoalRow[];
}

const severityStyles: Record<string, string> = {
  info: "border-primary/30 bg-primary/5",
  warning: "border-fin-pending/30 bg-fin-pending/5",
  success: "border-fin-income/30 bg-fin-income/5",
  alert: "border-fin-expense/30 bg-fin-expense/5",
};

const severityIcon: Record<string, React.ReactNode> = {
  info: <Lightbulb className="w-4 h-4 text-primary" />,
  warning: <TrendingDown className="w-4 h-4 text-fin-pending" />,
  success: <TrendingUp className="w-4 h-4 text-fin-income" />,
  alert: <PiggyBank className="w-4 h-4 text-fin-expense" />,
};

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  investments,
  goals,
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchInsights = useCallback(async () => {
    if (transactions.length === 0) return;
    setLoading(true);

    try {
      // Prepare summary data (limit to last 3 months to keep payload small)
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const recentTx = transactions
        .filter(t => new Date(t.date + "T12:00:00") >= threeMonthsAgo)
        .map(t => ({
          type: t.type,
          amount: t.amount,
          category: t.category,
          date: t.date,
          status: t.status,
          description: t.description,
        }));

      const { data, error } = await supabase.functions.invoke("financial-insights", {
        body: {
          transactions: recentTx,
          investments: investments ? { total: investments.total } : null,
          goals: goals?.map(g => ({
            name: g.name,
            target_amount: g.target_amount,
            current_amount: g.current_amount,
            deadline: g.deadline,
          })) || [],
        },
      });

      if (!error && data?.insights?.length > 0) {
        setInsights(data.insights);
      }
    } catch (e) {
      console.error("Failed to fetch insights:", e);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [transactions, investments, goals]);

  // Auto-fetch once when transactions are available
  useEffect(() => {
    if (!hasLoaded && transactions.length > 0) {
      fetchInsights();
    }
  }, [transactions.length, hasLoaded, fetchInsights]);

  if (transactions.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 cockpit-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Insights com IA
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInsights}
          disabled={loading}
          className="h-7 px-2 text-xs gap-1.5"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Analisando..." : "Atualizar"}
        </Button>
      </div>

      {loading && insights.length === 0 ? (
        <div className="flex items-center justify-center py-8 gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Analisando suas finanças...</span>
        </div>
      ) : insights.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <AnimatePresence>
            {insights.map((insight, i) => (
              <motion.div
                key={`${insight.type}-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 12, scale: 0.97 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                className={`rounded-lg border p-3 transition-colors hover:bg-accent/30 cursor-default ${
                  severityStyles[insight.severity] || severityStyles.info
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    <span className="text-lg">{insight.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {severityIcon[insight.severity]}
                      <p className="text-sm font-semibold text-card-foreground truncate">
                        {insight.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : hasLoaded ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Adicione mais transações para receber insights personalizados
        </p>
      ) : null}
    </div>
  );
};

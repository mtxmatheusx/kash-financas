import React, { useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoals } from "@/hooks/useGoals";
import { Compass, TrendingUp, TrendingDown, PiggyBank, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PlanejamentoFinanceiro: React.FC = () => {
  const { totals, transactions } = useTransactions();
  const { total: investmentTotal } = useInvestments();
  const { goals } = useGoals();

  const savingsRate = totals.income > 0 ? ((totals.income - totals.expense) / totals.income * 100) : 0;

  const topExpenses = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" /> Planejamento Financeiro
          </h1>
          <p className="text-sm text-muted-foreground">Análise e recomendações para suas finanças</p>
        </div>

        {/* Health Score */}
        <div className="rounded-xl border border-border bg-card p-6 enterprise-shadow">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Saúde Financeira</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold font-mono-fin ${savingsRate >= 20 ? 'text-fin-income' : savingsRate >= 0 ? 'text-fin-pending' : 'text-fin-expense'}`}>
                {savingsRate.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Taxa de poupança</p>
              <p className="text-[11px] text-muted-foreground">Meta: ≥ 20%</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-mono-fin text-primary">
                {formatBRL(totals.balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Saldo disponível</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold font-mono-fin text-fin-investment">
                {formatBRL(investmentTotal)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Patrimônio investido</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-xl border border-border bg-card p-6 enterprise-shadow">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Recomendações</h3>
          <div className="space-y-3">
            {savingsRate < 20 && (
              <div className="flex gap-3 p-3 rounded-lg bg-fin-pending/10 border border-fin-pending/20">
                <TrendingDown className="w-5 h-5 text-fin-pending shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Aumente sua taxa de poupança</p>
                  <p className="text-xs text-muted-foreground">Recomendamos poupar pelo menos 20% da renda. Atualmente você poupa {savingsRate.toFixed(0)}%.</p>
                </div>
              </div>
            )}
            {investmentTotal === 0 && (
              <div className="flex gap-3 p-3 rounded-lg bg-fin-investment/10 border border-fin-investment/20">
                <PiggyBank className="w-5 h-5 text-fin-investment shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Comece a investir</p>
                  <p className="text-xs text-muted-foreground">Ainda não há investimentos registrados. Comece com renda fixa para construir sua reserva.</p>
                </div>
              </div>
            )}
            {goals.length === 0 && (
              <div className="flex gap-3 p-3 rounded-lg bg-fin-goals/10 border border-fin-goals/20">
                <Target className="w-5 h-5 text-fin-goals shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Defina metas financeiras</p>
                  <p className="text-xs text-muted-foreground">Metas ajudam a manter o foco. Crie sua primeira meta na aba Metas.</p>
                </div>
              </div>
            )}
            {savingsRate >= 20 && investmentTotal > 0 && goals.length > 0 && (
              <div className="flex gap-3 p-3 rounded-lg bg-fin-income/10 border border-fin-income/20">
                <TrendingUp className="w-5 h-5 text-fin-income shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">Parabéns! Suas finanças estão saudáveis</p>
                  <p className="text-xs text-muted-foreground">Continue mantendo uma boa taxa de poupança e diversificando investimentos.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Expenses */}
        {topExpenses.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6 enterprise-shadow">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Maiores Categorias de Gasto</h3>
            <div className="space-y-3">
              {topExpenses.map(([cat, amount]) => {
                const pct = totals.expense > 0 ? (amount / totals.expense) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-card-foreground">{cat}</span>
                      <span className="font-mono-fin text-muted-foreground">{formatBRL(amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PlanejamentoFinanceiro;

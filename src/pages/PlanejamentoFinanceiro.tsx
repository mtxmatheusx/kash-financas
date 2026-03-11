import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, staggerItem, slideUp, fadeIn } from "@/components/PageTransition";
import { SummaryBar } from "@/components/SummaryBar";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoals } from "@/hooks/useGoals";
import { Compass, TrendingUp, TrendingDown, PiggyBank, Target, Trophy, ShieldCheck, AlertTriangle, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePreferences } from "@/contexts/PreferencesContext";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const PlanejamentoFinanceiro: React.FC = () => {
  const { formatMoney: formatBRL } = usePreferences();
  const { totals, transactions } = useTransactions();
  const { total: investmentTotal, investments } = useInvestments();
  const { goals } = useGoals();

  const savingsRate = totals.income > 0 ? ((totals.income - totals.expense) / totals.income * 100) : 0;
  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;

  const topExpenses = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions]);

  const monthlyFlow = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const year = new Date().getFullYear();
    monthNames.forEach((_, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      months[key] = { income: 0, expense: 0 };
    });
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (months[m]) {
        if (t.type === 'income') months[m].income += t.amount;
        else months[m].expense += t.amount;
      }
    });
    return Object.entries(months).map(([key, val]) => ({
      month: monthNames[parseInt(key.split('-')[1]) - 1],
      savings: val.income - val.expense,
    }));
  }, [transactions]);

  const recommendations = useMemo(() => {
    const recs: { icon: React.ElementType; title: string; desc: string; color: string; bgColor: string; borderColor: string }[] = [];
    if (savingsRate < 20) {
      recs.push({ icon: AlertTriangle, title: 'Aumente sua taxa de poupança', desc: `Recomendamos poupar pelo menos 20% da renda. Atualmente: ${savingsRate.toFixed(0)}%.`, color: 'text-fin-pending', bgColor: 'bg-fin-pending/10', borderColor: 'border-fin-pending/20' });
    }
    if (investmentTotal === 0) {
      recs.push({ icon: PiggyBank, title: 'Comece a investir', desc: 'Ainda não há investimentos registrados. Comece com renda fixa para construir sua reserva.', color: 'text-fin-investment', bgColor: 'bg-fin-investment/10', borderColor: 'border-fin-investment/20' });
    }
    if (goals.length === 0) {
      recs.push({ icon: Target, title: 'Defina metas financeiras', desc: 'Metas ajudam a manter o foco. Crie sua primeira meta na aba Metas.', color: 'text-fin-goals', bgColor: 'bg-fin-goals/10', borderColor: 'border-fin-goals/20' });
    }
    if (savingsRate >= 20 && investmentTotal > 0 && goals.length > 0) {
      recs.push({ icon: ShieldCheck, title: 'Parabéns! Finanças saudáveis', desc: 'Continue mantendo uma boa taxa de poupança e diversificando investimentos.', color: 'text-fin-income', bgColor: 'bg-fin-income/10', borderColor: 'border-fin-income/20' });
    }
    return recs;
  }, [savingsRate, investmentTotal, goals.length]);

  const CockpitTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-xs font-mono-fin font-semibold text-foreground">{formatBRL(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="space-y-3 md:space-y-5">
        {/* Header */}
        <motion.div {...fadeIn(0)} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Compass className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Planejamento Financeiro</h1>
            <p className="text-xs text-muted-foreground">Análise e recomendações para suas finanças</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <SummaryBar items={[
          { label: "Taxa de Poupança", value: `${savingsRate.toFixed(0)}%`, color: savingsRate >= 20 ? "income" : savingsRate >= 0 ? "pending" : "expense", icon: savingsRate >= 20 ? TrendingUp : TrendingDown },
          { label: "Saldo", value: formatBRL(totals.balance), color: "primary", icon: TrendingUp },
          { label: "Investido", value: formatBRL(investmentTotal), color: "investment", icon: PiggyBank },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Savings Flow Chart */}
          <motion.div {...slideUp(0.1)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Poupança Mensal</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyFlow} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<CockpitTooltip />} />
                <Bar dataKey="savings" name="Poupança" radius={[4, 4, 0, 0]} animationDuration={800}
                  fill="hsl(var(--fin-income))" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recommendations */}
          <motion.div {...slideUp(0.15)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Recomendações</h3>
            <motion.div className="space-y-2.5" variants={staggerContainer} initial="initial" animate="animate">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <motion.div key={i} variants={staggerItem}
                    className={cn("flex gap-3 p-3 rounded-lg border", rec.bgColor, rec.borderColor)}>
                    <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", rec.color)} />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{rec.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Top Expenses */}
          <motion.div {...slideUp(0.2)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Maiores Categorias de Gasto</h3>
            </div>
            {topExpenses.length > 0 ? (
              <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                {topExpenses.map(([cat, amount]) => {
                  const pct = totals.expense > 0 ? (amount / totals.expense) * 100 : 0;
                  return (
                    <motion.div key={cat} variants={staggerItem}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-card-foreground">{cat}</span>
                        <span className="font-mono-fin text-xs text-muted-foreground">{formatBRL(amount)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhuma despesa registrada</p>
            )}
          </motion.div>

          {/* Goals Progress */}
          <motion.div {...slideUp(0.25)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Progresso das Metas</h3>
            </div>
            {goals.length > 0 ? (
              <motion.div className="space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                {goals.slice(0, 5).map(g => {
                  const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
                  return (
                    <motion.div key={g.id} variants={staggerItem}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-card-foreground flex items-center gap-1.5">
                          {g.name}
                          {pct >= 100 && <Trophy className="w-3 h-3 text-fin-income" />}
                        </span>
                        <span className="font-mono-fin text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhuma meta registrada</p>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PlanejamentoFinanceiro;

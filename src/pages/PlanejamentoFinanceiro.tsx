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
import type { TranslationKey } from "@/i18n/translations";

const MONTH_KEYS: TranslationKey[] = [
  "month.jan","month.feb","month.mar","month.apr","month.may","month.jun",
  "month.jul","month.aug","month.sep","month.oct","month.nov","month.dec",
];

const PlanejamentoFinanceiro: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const { totals, transactions } = useTransactions();
  const { total: investmentTotal, investments } = useInvestments();
  const { goals } = useGoals();

  const months = MONTH_KEYS.map(k => t(k));
  const savingsRate = totals.income > 0 ? ((totals.income - totals.expense) / totals.income * 100) : 0;
  const completedGoals = goals.filter(g => g.current_amount >= g.target_amount).length;

  const topExpenses = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [transactions]);

  const monthlyFlow = useMemo(() => {
    const mData: Record<string, { income: number; expense: number }> = {};
    const year = new Date().getFullYear();
    months.forEach((_, i) => { mData[`${year}-${String(i + 1).padStart(2, '0')}`] = { income: 0, expense: 0 }; });
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (mData[m]) { if (t.type === 'income') mData[m].income += t.amount; else mData[m].expense += t.amount; }
    });
    return Object.entries(mData).map(([key, val]) => ({
      month: months[parseInt(key.split('-')[1]) - 1],
      savings: val.income - val.expense,
    }));
  }, [transactions, months]);

  const recommendations = useMemo(() => {
    const recs: { icon: React.ElementType; title: string; desc: string; color: string; bgColor: string; borderColor: string }[] = [];
    if (savingsRate < 20) {
      recs.push({ icon: AlertTriangle, title: t("planning.increaseSavings"), desc: t("planning.increaseSavingsDesc").replace("{pct}", savingsRate.toFixed(0)), color: 'text-fin-pending', bgColor: 'bg-fin-pending/10', borderColor: 'border-fin-pending/20' });
    }
    if (investmentTotal === 0) {
      recs.push({ icon: PiggyBank, title: t("planning.startInvesting"), desc: t("planning.startInvestingDesc"), color: 'text-fin-investment', bgColor: 'bg-fin-investment/10', borderColor: 'border-fin-investment/20' });
    }
    if (goals.length === 0) {
      recs.push({ icon: Target, title: t("planning.setGoals"), desc: t("planning.setGoalsDesc"), color: 'text-fin-goals', bgColor: 'bg-fin-goals/10', borderColor: 'border-fin-goals/20' });
    }
    if (savingsRate >= 20 && investmentTotal > 0 && goals.length > 0) {
      recs.push({ icon: ShieldCheck, title: t("planning.healthyFinances"), desc: t("planning.healthyFinancesDesc"), color: 'text-fin-income', bgColor: 'bg-fin-income/10', borderColor: 'border-fin-income/20' });
    }
    return recs;
  }, [savingsRate, investmentTotal, goals.length, t]);

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
        <motion.div {...fadeIn(0)} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Compass className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">{t("planning.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("planning.subtitle")}</p>
          </div>
        </motion.div>

        <SummaryBar items={[
          { label: t("planning.savingsRate"), value: `${savingsRate.toFixed(0)}%`, color: savingsRate >= 20 ? "income" : savingsRate >= 0 ? "pending" : "expense", icon: savingsRate >= 20 ? TrendingUp : TrendingDown },
          { label: t("kpi.balance"), value: formatBRL(totals.balance), color: "primary", icon: TrendingUp },
          { label: t("kpi.invested"), value: formatBRL(investmentTotal), color: "investment", icon: PiggyBank },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <motion.div {...slideUp(0.1)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t("planning.monthlySavings")}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyFlow} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={v => Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip content={<CockpitTooltip />} />
                <Bar dataKey="savings" name={t("planning.monthlySavings")} radius={[4, 4, 0, 0]} animationDuration={800} fill="hsl(var(--fin-income))" opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...slideUp(0.15)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t("planning.recommendations")}</h3>
            <motion.div className="space-y-2.5" variants={staggerContainer} initial="initial" animate="animate">
              {recommendations.map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <motion.div key={i} variants={staggerItem} className={cn("flex gap-3 p-3 rounded-lg border", rec.bgColor, rec.borderColor)}>
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
          <motion.div {...slideUp(0.2)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("planning.topCategories")}</h3>
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
              <p className="text-xs text-muted-foreground text-center py-8">{t("planning.noExpenses")}</p>
            )}
          </motion.div>

          <motion.div {...slideUp(0.25)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("planning.goalsProgress")}</h3>
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
              <p className="text-xs text-muted-foreground text-center py-8">{t("planning.noGoals")}</p>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PlanejamentoFinanceiro;

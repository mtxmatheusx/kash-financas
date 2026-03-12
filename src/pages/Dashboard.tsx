import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, staggerItem, slideUp, fadeIn } from "@/components/PageTransition";
import { SummaryBar } from "@/components/SummaryBar";
import { KPICard } from "@/components/KPICard";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Activity, Calendar } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { translateCategory } from "@/lib/categoryI18n";
import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { createAnimatedBarShape } from "@/components/AnimatedBar";
import { getDateRange, type DateFilter } from "@/components/DashboardDateFilter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FinancialInsights } from "@/components/FinancialInsights";
import { useGoals } from "@/hooks/useGoals";


const formatCompact = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toString();
};

const Dashboard: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();

  /* Cockpit-style tooltip */
  const CockpitTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-xl">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2.5 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }} />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
            <span className="font-mono-fin text-xs font-semibold text-foreground ml-auto">{formatBRL(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const { transactions, totals } = useTransactions();
  const { total: investmentTotal } = useInvestments();
  const { goals } = useGoals();

  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  // Weekly summary data
  const weeklySummary = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const weekTxs = transactions.filter(tx => {
      const d = new Date(tx.date + 'T12:00:00');
      return d >= weekAgo && d <= now;
    });

    const income = weekTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const expense = weekTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    return { income, expense, balance: income - expense, count: weekTxs.length };
  }, [transactions]);

  const filtered = useMemo(() => {
    const { from, to } = getDateRange(dateFilter, customRange);
    if (!from) return transactions;
    return transactions.filter(t => {
      const d = new Date(t.date + 'T12:00:00');
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [transactions, dateFilter, customRange]);

  const filteredTotals = useMemo(() => {
    const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const monthlyData = useMemo(() => {
    // Show all 12 months of the current year
    const year = new Date().getFullYear();
    const monthKeys = ['month.jan','month.feb','month.mar','month.apr','month.may','month.jun','month.jul','month.aug','month.sep','month.oct','month.nov','month.dec'] as const;
    const monthNames = monthKeys.map(k => t(k));
    const months: { month: string; income: number; expense: number }[] = monthNames.map((name, i) => {
      const key = `${year}-${String(i + 1).padStart(2, '0')}`;
      return { month: name, income: 0, expense: 0, _key: key };
    });

    filtered.forEach(t => {
      const m = t.date.slice(0, 7);
      const idx = months.findIndex((mo: any) => mo._key === m);
      if (idx >= 0) {
        if (t.type === 'income') months[idx].income += t.amount;
        else months[idx].expense += t.amount;
      }
    });

    return months.map(({ month, income, expense }) => ({ month, income, expense }));
  }, [filtered]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    filtered.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [filtered]);

  return (
    <PageTransition>
      <div className="space-y-3 md:space-y-5">
        {/* Header + Filters */}
        <motion.div {...fadeIn(0)} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("dashboard.subtitle")}</p>
            </div>
          </div>
          <Select
            value={dateFilter}
            onValueChange={(v) => setDateFilter(v as DateFilter)}
          >
            <SelectTrigger className="w-[180px] h-9 text-xs bg-card border-border">
              <SelectValue placeholder={t("filter.period")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.all")}</SelectItem>
              <SelectItem value="today">{t("filter.today")}</SelectItem>
              <SelectItem value="yesterday">{t("filter.yesterday")}</SelectItem>
              <SelectItem value="week">{t("filter.week")}</SelectItem>
              <SelectItem value="month">{t("filter.month")}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* KPIs */}
        <SummaryBar items={[
          { label: t("kpi.income"), value: formatBRL(filteredTotals.income), color: "income", icon: TrendingUp },
          { label: t("kpi.expenses"), value: formatBRL(filteredTotals.expense), color: "expense", icon: TrendingDown },
          { label: t("kpi.balance"), value: formatBRL(filteredTotals.balance), color: "primary", icon: Wallet },
        ]} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 md:gap-3">
          <motion.div {...slideUp(0.15)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("dashboard.incomeVsExpense")}</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-fin-income" style={{ boxShadow: '0 0 6px hsl(var(--fin-income))' }} />
                  <span className="text-[10px] text-muted-foreground">{t("kpi.income")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-fin-expense" style={{ boxShadow: '0 0 6px hsl(var(--fin-expense))' }} />
                  <span className="text-[10px] text-muted-foreground">{t("kpi.expenses")}</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'DM Sans' }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickFormatter={formatCompact} />
                <Tooltip content={<CockpitTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                <Bar dataKey="income" name={t("kpi.income")} fill="hsl(var(--fin-income))" radius={[4, 4, 0, 0]}
                  opacity={0.85} animationDuration={800} />
                <Bar dataKey="expense" name={t("kpi.expenses")} fill="hsl(var(--fin-expense))" radius={[4, 4, 0, 0]}
                  opacity={0.85} animationDuration={800} animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div {...slideUp(0.25)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t("dashboard.topCategories")}</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <XAxis type="number" axisLine={false} tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={formatCompact} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 11, fontFamily: 'DM Sans' }} width={90} />
                  <Tooltip content={<CockpitTooltip />} />
                  <Bar dataKey="value" name="Total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}
                    shape={createAnimatedBarShape("vertical")} isAnimationActive={false} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
                {t("dashboard.addExpenses")}
              </div>
            )}
          </motion.div>
        </div>

        {/* Weekly Summary */}
        <motion.div {...slideUp(0.25)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{t("dashboard.weeklyTitle")}</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">{weeklySummary.count} {t("dashboard.weeklyTransactions")}</span>
          </div>
          {weeklySummary.count > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-lg bg-fin-income/5 border border-fin-income/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("dashboard.weeklyIncome")}</p>
                <p className="text-sm font-bold font-mono-fin text-fin-income">+{formatBRL(weeklySummary.income)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-fin-expense/5 border border-fin-expense/10">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("dashboard.weeklyExpense")}</p>
                <p className="text-sm font-bold font-mono-fin text-fin-expense">−{formatBRL(weeklySummary.expense)}</p>
              </div>
              <div className={cn("text-center p-3 rounded-lg border", weeklySummary.balance >= 0 ? "bg-primary/5 border-primary/10" : "bg-fin-expense/5 border-fin-expense/10")}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{t("dashboard.weeklyBalance")}</p>
                <p className={cn("text-sm font-bold font-mono-fin", weeklySummary.balance >= 0 ? "text-primary" : "text-fin-expense")}>
                  {formatBRL(weeklySummary.balance)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">{t("dashboard.weeklyNoData")}</p>
          )}
        </motion.div>

        {/* AI Insights */}
        <motion.div {...slideUp(0.3)}>
          <FinancialInsights
            transactions={filtered}
            investments={{ total: investmentTotal }}
            goals={goals}
          />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div {...slideUp(0.35)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t("dashboard.recentTransactions")}</h3>
          {filtered.length > 0 ? (
            <motion.div className="space-y-0.5" variants={staggerContainer} initial="initial" animate="animate">
              {filtered.slice(0, 8).map(tx => (
                <motion.div key={tx.id} variants={staggerItem}
                  whileHover={{ x: 3, transition: { duration: 0.1 } }}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-default">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${tx.type === 'income' ? 'bg-fin-income' : 'bg-fin-expense'}`}
                      style={{ boxShadow: tx.type === 'income' ? '0 0 4px hsl(var(--fin-income))' : '0 0 4px hsl(var(--fin-expense))' }} />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{tx.description}</p>
                      <p className="text-[10px] text-muted-foreground">{translateCategory(tx.category, t)} · {new Date(tx.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`font-mono-fin text-sm font-semibold ${tx.type === 'income' ? 'text-fin-income' : 'text-fin-expense'}`}>
                    {tx.type === 'income' ? '+' : '−'} {formatBRL(tx.amount)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">{t("dashboard.noTransactions")}</p>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

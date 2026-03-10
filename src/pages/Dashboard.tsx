import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, staggerItem, slideUp, fadeIn } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Activity } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { createAnimatedBarShape } from "@/components/AnimatedBar";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatCompact = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return v.toString();
};

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

const Dashboard: React.FC = () => {
  const { transactions, totals } = useTransactions();
  const { total: investmentTotal } = useInvestments();

  const monthlyData = useMemo(() => {
    const months: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      if (t.type === 'income') months[m].income += t.amount;
      else months[m].expense += t.amount;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        ...data,
      }));
  }, [transactions]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <PageTransition>
      <div className="space-y-5">
        {/* Header */}
        <motion.div {...fadeIn(0)} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-xs text-muted-foreground">Visão geral das suas finanças</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <KPICard title="Saldo" value={formatBRL(totals.balance)} icon={Wallet}
            color="bg-primary/10 text-primary" />
          <KPICard title="Receitas" value={formatBRL(totals.income)} icon={TrendingUp}
            color="bg-fin-income/10 text-fin-income" />
          <KPICard title="Despesas" value={formatBRL(totals.expense)} icon={TrendingDown}
            color="bg-fin-expense/10 text-fin-expense" />
          <KPICard title="Investimentos" value={formatBRL(investmentTotal)} icon={PiggyBank}
            color="bg-fin-investment/10 text-fin-investment" />
        </motion.div>

        {/* Charts - cockpit style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <motion.div
            {...slideUp(0.15)}
            className="rounded-xl border border-border bg-card p-4 cockpit-glow"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Receitas vs Despesas</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-fin-income" style={{ boxShadow: '0 0 6px hsl(var(--fin-income))' }} />
                  <span className="text-[10px] text-muted-foreground">Receitas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-fin-expense" style={{ boxShadow: '0 0 6px hsl(var(--fin-expense))' }} />
                  <span className="text-[10px] text-muted-foreground">Despesas</span>
                </div>
              </div>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--fin-income))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--fin-income))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--fin-expense))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--fin-expense))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'DM Sans' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={formatCompact}
                  />
                  <Tooltip content={<CockpitTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Receitas"
                    stroke="hsl(var(--fin-income))"
                    fill="url(#incomeGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--fin-income))' }}
                    animationDuration={1000}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Despesas"
                    stroke="hsl(var(--fin-expense))"
                    fill="url(#expenseGrad)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--fin-expense))' }}
                    animationDuration={1000}
                    animationBegin={200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
                Adicione transações para ver o gráfico
              </div>
            )}
          </motion.div>

          <motion.div
            {...slideUp(0.25)}
            className="rounded-xl border border-border bg-card p-4 cockpit-glow"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Top Categorias</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }}>
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 48%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickFormatter={formatCompact}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(220, 10%, 60%)', fontSize: 11, fontFamily: 'DM Sans' }}
                    width={90}
                  />
                  <Tooltip content={<CockpitTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Total"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    shape={createAnimatedBarShape("vertical")}
                    isAnimationActive={false}
                    opacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">
                Adicione despesas para ver o gráfico
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Transactions */}
        <motion.div
          {...slideUp(0.3)}
          className="rounded-xl border border-border bg-card p-4 cockpit-glow"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Transações Recentes</h3>
          {transactions.length > 0 ? (
            <motion.div
              className="space-y-0.5"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {transactions.slice(0, 8).map(t => (
                <motion.div
                  key={t.id}
                  variants={staggerItem}
                  whileHover={{ x: 3, transition: { duration: 0.1 } }}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-default"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-fin-income' : 'bg-fin-expense'}`}
                      style={{ boxShadow: t.type === 'income' ? '0 0 4px hsl(var(--fin-income))' : '0 0 4px hsl(var(--fin-expense))' }}
                    />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{t.description}</p>
                      <p className="text-[10px] text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`font-mono-fin text-sm font-semibold ${t.type === 'income' ? 'text-fin-income' : 'text-fin-expense'}`}>
                    {t.type === 'income' ? '+' : '−'} {formatBRL(t.amount)}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">Nenhuma transação registrada</p>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

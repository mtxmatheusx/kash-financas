import React, { useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { KPICard } from "@/components/KPICard";
import { useTransactions } from "@/hooks/useTransactions";
import { useInvestments } from "@/hooks/useInvestments";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg enterprise-shadow-md">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground text-xs">{entry.name}:</span>
          <span className="font-semibold font-mono-fin text-xs">{formatBRL(entry.value)}</span>
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
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral das suas finanças</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Saldo" value={formatBRL(totals.balance)} icon={Wallet}
            color="bg-primary/10 text-primary" />
          <KPICard title="Receitas" value={formatBRL(totals.income)} icon={TrendingUp}
            color="bg-fin-income/10 text-fin-income" />
          <KPICard title="Despesas" value={formatBRL(totals.expense)} icon={TrendingDown}
            color="bg-fin-expense/10 text-fin-expense" />
          <KPICard title="Investimentos" value={formatBRL(investmentTotal)} icon={PiggyBank}
            color="bg-fin-investment/10 text-fin-investment" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Receitas vs Despesas</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(220, 9%, 46%)' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(220, 9%, 46%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Receitas" stroke="hsl(152, 69%, 41%)" fill="hsl(152, 69%, 41%)" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="expense" name="Despesas" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                Adicione transações para ver o gráfico
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Top Categorias (Despesas)</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fill: 'hsl(220, 9%, 46%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Total" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                Adicione despesas para ver o gráfico
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Transações Recentes</h3>
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 8).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-fin-income' : 'bg-fin-expense'}`} />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{t.description}</p>
                      <p className="text-[11px] text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`font-mono-fin text-sm font-semibold ${t.type === 'income' ? 'text-fin-income' : 'text-fin-expense'}`}>
                    {t.type === 'income' ? '+' : '−'} {formatBRL(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma transação registrada</p>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

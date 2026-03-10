import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { CalendarRange } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Mensal: React.FC = () => {
  const { transactions } = useTransactions();
  const [year, setYear] = useState(new Date().getFullYear());

  const monthlyData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const month = String(i + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      const monthTxs = transactions.filter(t => t.date.startsWith(prefix));
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { name, income, expense, balance: income - expense };
    });
  }, [transactions, year]);

  const yearTotals = useMemo(() => ({
    income: monthlyData.reduce((s, m) => s + m.income, 0),
    expense: monthlyData.reduce((s, m) => s + m.expense, 0),
  }), [monthlyData]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarRange className="w-6 h-6 text-primary" /> Visão Mensal
            </h1>
            <p className="text-sm text-muted-foreground">Comparativo mensal de {year}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setYear(y => y - 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
              ← {year - 1}
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold">{year}</span>
            <button onClick={() => setYear(y => y + 1)} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
              {year + 1} →
            </button>
          </div>
        </div>

        {/* Year summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receitas no ano</p>
            <p className="text-xl font-bold font-mono-fin text-fin-income">{formatBRL(yearTotals.income)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Despesas no ano</p>
            <p className="text-xl font-bold font-mono-fin text-fin-expense">{formatBRL(yearTotals.expense)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Saldo no ano</p>
            <p className={`text-xl font-bold font-mono-fin ${yearTotals.income - yearTotals.expense >= 0 ? 'text-fin-income' : 'text-fin-expense'}`}>
              {formatBRL(yearTotals.income - yearTotals.expense)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 12 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Bar dataKey="income" name="Receitas" fill="hsl(152, 69%, 41%)" radius={[4, 4, 0, 0]} animationBegin={0} animationDuration={1000} animationEasing="ease-out" />
              <Bar dataKey="expense" name="Despesas" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} animationBegin={300} animationDuration={1000} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Month table */}
        <div className="rounded-xl border border-border bg-card enterprise-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mês</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receitas</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Despesas</th>
                <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monthlyData.map(m => (
                <tr key={m.name} className="hover:bg-accent/20 transition-colors">
                  <td className="p-3 font-medium text-card-foreground">{m.name}</td>
                  <td className="p-3 text-right font-mono-fin text-fin-income">{formatBRL(m.income)}</td>
                  <td className="p-3 text-right font-mono-fin text-fin-expense">{formatBRL(m.expense)}</td>
                  <td className={`p-3 text-right font-mono-fin font-semibold ${m.balance >= 0 ? 'text-fin-income' : 'text-fin-expense'}`}>
                    {formatBRL(m.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
};

export default Mensal;

import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { CalendarRange } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Mensal: React.FC = () => {
  const { transactions } = useTransactions();
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const monthlyData = useMemo(() => {
    return MONTHS.map((name, i) => {
      const month = String(i + 1).padStart(2, '0');
      const prefix = `${year}-${month}`;
      const monthTxs = transactions.filter(t => t.date.startsWith(prefix));
      const income = monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { name, index: i, income, expense, balance: income - expense };
    });
  }, [transactions, year]);

  const filteredData = useMemo(() => {
    if (selectedMonth === null) return monthlyData;
    return monthlyData.filter(m => m.index === selectedMonth);
  }, [monthlyData, selectedMonth]);

  const summaryData = useMemo(() => {
    const data = selectedMonth !== null ? filteredData : monthlyData;
    return {
      income: data.reduce((s, m) => s + m.income, 0),
      expense: data.reduce((s, m) => s + m.expense, 0),
    };
  }, [filteredData, monthlyData, selectedMonth]);

  const summaryLabel = selectedMonth !== null ? MONTHS[selectedMonth] : "no ano";

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarRange className="w-6 h-6 text-primary" /> Visão Mensal
            </h1>
            <p className="text-sm text-muted-foreground">
              {selectedMonth !== null
                ? `Detalhes de ${MONTHS[selectedMonth]} de ${year}`
                : `Comparativo mensal de ${year}`}
            </p>
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

        {/* Month selector chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMonth(null)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              selectedMonth === null
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            Todos
          </button>
          {MONTHS.map((m, i) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(selectedMonth === i ? null : i)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                selectedMonth === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Receitas {summaryLabel}</p>
            <p className="text-xl font-bold font-mono-fin text-fin-income">{formatBRL(summaryData.income)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Despesas {summaryLabel}</p>
            <p className="text-xl font-bold font-mono-fin text-fin-expense">{formatBRL(summaryData.expense)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Saldo {summaryLabel}</p>
            <p className={`text-xl font-bold font-mono-fin ${summaryData.income - summaryData.expense >= 0 ? 'text-fin-income' : 'text-fin-expense'}`}>
              {formatBRL(summaryData.income - summaryData.expense)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
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
              {filteredData.map(m => (
                <tr
                  key={m.name}
                  onClick={() => setSelectedMonth(selectedMonth === m.index ? null : m.index)}
                  className={cn(
                    "hover:bg-accent/20 transition-colors cursor-pointer",
                    selectedMonth === m.index && "bg-primary/5"
                  )}
                >
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

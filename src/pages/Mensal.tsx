import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { SummaryBar } from "@/components/SummaryBar";
import { useTransactions } from "@/hooks/useTransactions";
import { CalendarRange, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { createAnimatedBarShape } from "@/components/AnimatedBar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePreferences } from "@/contexts/PreferencesContext";

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const Mensal: React.FC = () => {
  const { formatMoney: formatBRL } = usePreferences();
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

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <CalendarRange className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Visão Mensal
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {selectedMonth !== null
                ? `Detalhes de ${MONTHS[selectedMonth]} de ${year}`
                : `Comparativo mensal de ${year}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => setYear(y => y - 1)} className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-accent transition-colors">
                ← {year - 1}
              </button>
              <span className="px-2.5 py-1.5 text-xs font-semibold">{year}</span>
              <button onClick={() => setYear(y => y + 1)} className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:bg-accent transition-colors">
                {year + 1} →
              </button>
            </div>
            <Select
              value={selectedMonth !== null ? String(selectedMonth) : "all"}
              onValueChange={(v) => setSelectedMonth(v === "all" ? null : parseInt(v))}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filtrar por mês..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary */}
        <SummaryBar items={[
          { label: "Receitas", value: formatBRL(summaryData.income), color: "income", icon: TrendingUp },
          { label: "Despesas", value: formatBRL(summaryData.expense), color: "expense", icon: TrendingDown },
          { label: "Saldo", value: formatBRL(summaryData.income - summaryData.expense), color: summaryData.income - summaryData.expense >= 0 ? "income" : "expense", icon: Wallet },
        ]} />

        {/* Chart */}
        <div className="rounded-xl border border-border bg-card p-3 md:p-5 enterprise-shadow">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={filteredData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(220, 9%, 46%)', fontSize: 10, fontFamily: 'JetBrains Mono' }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatBRL(v)} />
              <Bar dataKey="income" name="Receitas" fill="hsl(var(--fin-income))" radius={[4, 4, 0, 0]} shape={createAnimatedBarShape("horizontal")} isAnimationActive={false} />
              <Bar dataKey="expense" name="Despesas" fill="hsl(var(--fin-expense))" radius={[4, 4, 0, 0]} shape={createAnimatedBarShape("horizontal")} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Month table */}
        <div className="rounded-xl border border-border bg-card enterprise-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border bg-accent/30">
                  <th className="text-left p-3 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mês</th>
                  <th className="text-right p-3 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Receitas</th>
                  <th className="text-right p-3 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Despesas</th>
                  <th className="text-right p-3 text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saldo</th>
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
                    <td className="p-3 font-medium text-card-foreground text-xs md:text-sm">{m.name}</td>
                    <td className="p-3 text-right font-mono-fin text-fin-income text-xs md:text-sm">{formatBRL(m.income)}</td>
                    <td className="p-3 text-right font-mono-fin text-fin-expense text-xs md:text-sm">{formatBRL(m.expense)}</td>
                    <td className={`p-3 text-right font-mono-fin font-semibold text-xs md:text-sm ${m.balance >= 0 ? 'text-fin-income' : 'text-fin-expense'}`}>
                      {formatBRL(m.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Mensal;

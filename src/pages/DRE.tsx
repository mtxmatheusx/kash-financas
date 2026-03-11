import React, { useMemo, useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/contexts/PreferencesContext";

const EXPENSE_GROUPS: Record<string, string[]> = {
  "Custos Operacionais": ["Fornecedores", "Infraestrutura", "Funcionários"],
  "Despesas Administrativas": ["Casa", "Transporte", "Saúde"],
  "Despesas Comerciais": ["Marketing", "Lazer"],
  "Impostos e Taxas": ["Impostos"],
  "Outras Despesas": ["Outros", "Alimentação"],
};

interface DRELine {
  label: string;
  value: number;
  indent?: number;
  bold?: boolean;
  highlight?: boolean;
  separator?: boolean;
}

const DRE: React.FC = () => {
  const { allTransactions } = useTransactions();
  const { account } = useAccount();
  const [refDate, setRefDate] = useState(new Date());

  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(refDate);
  const prevMonthStart = startOfMonth(subMonths(refDate, 1));
  const prevMonthEnd = endOfMonth(subMonths(refDate, 1));

  const buildDRE = (start: Date, end: Date) => {
    const txs = allTransactions.filter(t => {
      const d = new Date(t.date);
      return t.account_type === account.type && d >= start && d <= end;
    });

    const incomes = txs.filter(t => t.type === "income");
    const expenses = txs.filter(t => t.type === "expense");

    const receitaBruta = incomes.reduce((s, t) => s + t.amount, 0);

    // Group income by category
    const incomeByCategory: Record<string, number> = {};
    incomes.forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });

    // Group expenses
    const expenseGroupTotals: Record<string, { total: number; categories: Record<string, number> }> = {};
    Object.entries(EXPENSE_GROUPS).forEach(([group, cats]) => {
      const groupData: Record<string, number> = {};
      let groupTotal = 0;
      cats.forEach(cat => {
        const catTotal = expenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
        if (catTotal > 0) {
          groupData[cat] = catTotal;
          groupTotal += catTotal;
        }
      });
      if (groupTotal > 0) {
        expenseGroupTotals[group] = { total: groupTotal, categories: groupData };
      }
    });

    // Uncategorized expenses
    const allMappedCats = Object.values(EXPENSE_GROUPS).flat();
    const uncategorized = expenses
      .filter(t => !allMappedCats.includes(t.category))
      .reduce((s, t) => s + t.amount, 0);

    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
    const resultadoOperacional = receitaBruta - totalExpenses;
    const margem = receitaBruta > 0 ? (resultadoOperacional / receitaBruta) * 100 : 0;

    return {
      receitaBruta,
      incomeByCategory,
      expenseGroupTotals,
      uncategorized,
      totalExpenses,
      resultadoOperacional,
      margem,
    };
  };

  const current = useMemo(() => buildDRE(monthStart, monthEnd), [allTransactions, account.type, refDate]);
  const previous = useMemo(() => buildDRE(prevMonthStart, prevMonthEnd), [allTransactions, account.type, refDate]);

  const lines = useMemo((): DRELine[] => {
    const result: DRELine[] = [];

    // RECEITAS
    result.push({ label: "RECEITA OPERACIONAL BRUTA", value: current.receitaBruta, bold: true, highlight: true });
    Object.entries(current.incomeByCategory).forEach(([cat, val]) => {
      result.push({ label: cat, value: val, indent: 1 });
    });
    result.push({ label: "", value: 0, separator: true });

    // DEDUÇÕES (placeholder)
    result.push({ label: "(-) Deduções sobre receita", value: 0, indent: 1 });
    result.push({ label: "RECEITA OPERACIONAL LÍQUIDA", value: current.receitaBruta, bold: true, highlight: true });
    result.push({ label: "", value: 0, separator: true });

    // DESPESAS
    Object.entries(current.expenseGroupTotals).forEach(([group, data]) => {
      result.push({ label: `(-) ${group}`, value: -data.total, bold: true });
      Object.entries(data.categories).forEach(([cat, val]) => {
        result.push({ label: cat, value: -val, indent: 2 });
      });
    });

    if (current.uncategorized > 0) {
      result.push({ label: "(-) Despesas não classificadas", value: -current.uncategorized, indent: 1 });
    }

    result.push({ label: "", value: 0, separator: true });
    result.push({ label: "TOTAL DE DESPESAS", value: -current.totalExpenses, bold: true });
    result.push({ label: "", value: 0, separator: true });

    // RESULTADO
    result.push({ label: "RESULTADO OPERACIONAL", value: current.resultadoOperacional, bold: true, highlight: true });
    result.push({ label: `Margem operacional: ${current.margem.toFixed(1)}%`, value: 0, indent: 1 });

    return result;
  }, [current]);

  const variation = previous.resultadoOperacional !== 0
    ? ((current.resultadoOperacional - previous.resultadoOperacional) / Math.abs(previous.resultadoOperacional)) * 100
    : 0;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">DRE</h1>
            <p className="text-sm text-muted-foreground">Demonstração do Resultado do Exercício</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setRefDate(d => subMonths(d, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[120px] text-center capitalize">
              {format(refDate, "MMMM yyyy", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setRefDate(d => subMonths(d, -1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Receita Bruta</p>
            <p className="text-lg font-bold text-fin-income">{formatBRL(current.receitaBruta)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Despesas</p>
            <p className="text-lg font-bold text-fin-expense">{formatBRL(current.totalExpenses)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Resultado</p>
            <p className={cn("text-lg font-bold", current.resultadoOperacional >= 0 ? "text-fin-income" : "text-fin-expense")}>
              {formatBRL(current.resultadoOperacional)}
            </p>
            {variation !== 0 && (
              <p className={cn("text-xs mt-1", variation > 0 ? "text-fin-income" : "text-fin-expense")}>
                {variation > 0 ? "+" : ""}{variation.toFixed(1)}% vs mês anterior
              </p>
            )}
          </div>
        </div>

        {/* DRE Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Descrição</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">Mês Atual</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">Mês Anterior</span>
          </div>

          {lines.map((line, i) => {
            if (line.separator) {
              return <div key={i} className="border-t border-border" />;
            }

            // Find matching previous value for comparison
            let prevValue = 0;
            if (line.label === "RECEITA OPERACIONAL BRUTA" || line.label === "RECEITA OPERACIONAL LÍQUIDA") {
              prevValue = previous.receitaBruta;
            } else if (line.label === "TOTAL DE DESPESAS") {
              prevValue = -previous.totalExpenses;
            } else if (line.label === "RESULTADO OPERACIONAL") {
              prevValue = previous.resultadoOperacional;
            }

            return (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-2.5 border-b border-border/50 last:border-0",
                  line.highlight && "bg-muted/20"
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    line.bold ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                  style={{ paddingLeft: (line.indent || 0) * 16 }}
                >
                  {line.label}
                </span>
                <span
                  className={cn(
                    "text-sm text-right min-w-[100px]",
                    line.bold ? "font-semibold" : "",
                    line.value > 0 ? "text-fin-income" : line.value < 0 ? "text-fin-expense" : "text-muted-foreground"
                  )}
                >
                  {line.value !== 0 ? formatBRL(Math.abs(line.value)) : "—"}
                </span>
                <span className="text-sm text-right min-w-[100px] text-muted-foreground">
                  {prevValue !== 0 ? formatBRL(Math.abs(prevValue)) : "—"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Health Indicator */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Análise Automática</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {current.receitaBruta === 0 && current.totalExpenses === 0 ? (
              <p>Nenhuma movimentação registrada neste mês.</p>
            ) : (
              <>
                {current.resultadoOperacional > 0 ? (
                  <p className="text-fin-income">
                    ✓ Resultado positivo — sua operação gerou lucro de {formatBRL(current.resultadoOperacional)} ({current.margem.toFixed(1)}% de margem).
                  </p>
                ) : (
                  <p className="text-fin-expense">
                    ✗ Resultado negativo — suas despesas excedem receitas em {formatBRL(Math.abs(current.resultadoOperacional))}.
                  </p>
                )}
                {current.margem < 10 && current.margem > 0 && (
                  <p className="text-fin-pending">⚠ Margem operacional abaixo de 10% — atenção aos custos.</p>
                )}
                {Object.entries(current.expenseGroupTotals).length > 0 && (
                  <p>
                    Maior grupo de despesa:{" "}
                    <strong>
                      {Object.entries(current.expenseGroupTotals).sort((a, b) => b[1].total - a[1].total)[0][0]}
                    </strong>{" "}
                    ({formatBRL(Object.entries(current.expenseGroupTotals).sort((a, b) => b[1].total - a[1].total)[0][1].total)})
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DRE;

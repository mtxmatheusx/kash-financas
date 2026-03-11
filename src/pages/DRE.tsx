import React, { useMemo, useRef, useState, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

/* ── Category → DRE group mapping ── */
const COST_CATEGORIES = ["Fornecedores", "Infraestrutura"]; // CPV / Custos diretos
const EXPENSE_GROUPS: Record<string, string[]> = {
  "Despesas com Pessoal": ["Funcionários"],
  "Despesas Administrativas": ["Casa", "Transporte", "Saúde", "Alimentação"],
  "Despesas Comerciais": ["Marketing", "Lazer"],
  "Impostos e Taxas": ["Impostos"],
  "Outras Despesas": ["Outros"],
};

/* ── DRE line type ── */
interface DRELine {
  label: string;
  value: number;
  prevValue?: number;
  indent?: number;
  bold?: boolean;
  highlight?: boolean;
  separator?: boolean;
  tooltip?: string;
}

/* ── Helpers ── */
const pct = (part: number, total: number) => (total !== 0 ? (part / total) * 100 : 0);

const DRE: React.FC = () => {
  const { formatMoney: formatBRL } = usePreferences();
  const { allTransactions } = useTransactions();
  const { account } = useAccount();
  const [refDate, setRefDate] = useState(new Date());
  const [exporting, setExporting] = useState(false);
  const dreRef = useRef<HTMLDivElement>(null);

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

    // 1. Receita Bruta
    const receitaBruta = incomes.reduce((s, t) => s + t.amount, 0);
    const incomeByCategory: Record<string, number> = {};
    incomes.forEach(t => {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    });

    // 2. Deduções (placeholder — user can add later)
    const deducoes = 0;

    // 3. Receita Líquida
    const receitaLiquida = receitaBruta - deducoes;

    // 4. CPV — Custos dos Produtos Vendidos
    const cpv = expenses
      .filter(t => COST_CATEGORIES.includes(t.category))
      .reduce((s, t) => s + t.amount, 0);
    const cpvByCategory: Record<string, number> = {};
    expenses.filter(t => COST_CATEGORIES.includes(t.category)).forEach(t => {
      cpvByCategory[t.category] = (cpvByCategory[t.category] || 0) + t.amount;
    });

    // 5. Lucro Bruto
    const lucroBruto = receitaLiquida - cpv;

    // 6. Despesas Operacionais (agrupadas)
    const allOpexCats = Object.values(EXPENSE_GROUPS).flat();
    const opexGroups: Record<string, { total: number; categories: Record<string, number> }> = {};
    let totalOpex = 0;
    Object.entries(EXPENSE_GROUPS).forEach(([group, cats]) => {
      const groupData: Record<string, number> = {};
      let groupTotal = 0;
      cats.forEach(cat => {
        const catTotal = expenses.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
        if (catTotal > 0) { groupData[cat] = catTotal; groupTotal += catTotal; }
      });
      if (groupTotal > 0) {
        opexGroups[group] = { total: groupTotal, categories: groupData };
        totalOpex += groupTotal;
      }
    });

    // Despesas não classificadas
    const mappedCats = [...COST_CATEGORIES, ...allOpexCats];
    const uncategorized = expenses.filter(t => !mappedCats.includes(t.category)).reduce((s, t) => s + t.amount, 0);
    totalOpex += uncategorized;

    // 7. Lucro Operacional (EBIT)
    const lucroOperacional = lucroBruto - totalOpex;

    // 8. Outras receitas / despesas (placeholder)
    const outrasReceitas = 0;
    const outrasDespesas = 0;

    // 9. Lucro Líquido
    const lucroLiquido = lucroOperacional + outrasReceitas - outrasDespesas;

    const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

    return {
      receitaBruta, incomeByCategory, deducoes, receitaLiquida,
      cpv, cpvByCategory, lucroBruto,
      opexGroups, totalOpex, uncategorized,
      lucroOperacional, outrasReceitas, outrasDespesas, lucroLiquido,
      totalExpenses,
      margemBruta: pct(lucroBruto, receitaLiquida),
      margemOperacional: pct(lucroOperacional, receitaLiquida),
      margemLiquida: pct(lucroLiquido, receitaLiquida),
    };
  };

  const current = useMemo(() => buildDRE(monthStart, monthEnd), [allTransactions, account.type, refDate]);
  const previous = useMemo(() => buildDRE(prevMonthStart, prevMonthEnd), [allTransactions, account.type, refDate]);

  const lines = useMemo((): DRELine[] => {
    const r: DRELine[] = [];

    // ── RECEITA BRUTA ──
    r.push({ label: "RECEITA BRUTA", value: current.receitaBruta, prevValue: previous.receitaBruta, bold: true, highlight: true, tooltip: "Total de vendas/receitas no período" });
    Object.entries(current.incomeByCategory).forEach(([cat, val]) => {
      const prev = previous.incomeByCategory[cat] || 0;
      r.push({ label: cat, value: val, prevValue: prev, indent: 1 });
    });
    r.push({ label: "", value: 0, separator: true });

    // ── DEDUÇÕES ──
    r.push({ label: "(-) Deduções sobre receita", value: -current.deducoes, prevValue: -previous.deducoes, indent: 1, tooltip: "Devoluções, descontos e abatimentos" });
    r.push({ label: "", value: 0, separator: true });

    // ── RECEITA LÍQUIDA ──
    r.push({ label: "RECEITA LÍQUIDA", value: current.receitaLiquida, prevValue: previous.receitaLiquida, bold: true, highlight: true, tooltip: "Receita Bruta menos deduções" });
    r.push({ label: "", value: 0, separator: true });

    // ── CPV ──
    r.push({ label: "(-) Custos dos Produtos/Serviços (CPV)", value: -current.cpv, prevValue: -previous.cpv, bold: true, tooltip: "Custos diretos de produção ou aquisição" });
    Object.entries(current.cpvByCategory).forEach(([cat, val]) => {
      const prev = previous.cpvByCategory[cat] || 0;
      r.push({ label: cat, value: -val, prevValue: -prev, indent: 2 });
    });
    r.push({ label: "", value: 0, separator: true });

    // ── LUCRO BRUTO ──
    r.push({ label: "LUCRO BRUTO", value: current.lucroBruto, prevValue: previous.lucroBruto, bold: true, highlight: true, tooltip: "Receita Líquida menos CPV" });
    r.push({ label: `Margem bruta: ${current.margemBruta.toFixed(1)}%`, value: 0, indent: 1 });
    r.push({ label: "", value: 0, separator: true });

    // ── DESPESAS OPERACIONAIS ──
    Object.entries(current.opexGroups).forEach(([group, data]) => {
      const prevGroup = previous.opexGroups[group];
      r.push({ label: `(-) ${group}`, value: -data.total, prevValue: prevGroup ? -prevGroup.total : 0, bold: true });
      Object.entries(data.categories).forEach(([cat, val]) => {
        const prev = prevGroup?.categories[cat] || 0;
        r.push({ label: cat, value: -val, prevValue: -prev, indent: 2 });
      });
    });
    if (current.uncategorized > 0) {
      r.push({ label: "(-) Despesas não classificadas", value: -current.uncategorized, prevValue: -previous.uncategorized, indent: 1 });
    }
    r.push({ label: "", value: 0, separator: true });
    r.push({ label: "TOTAL DESPESAS OPERACIONAIS", value: -current.totalOpex, prevValue: -previous.totalOpex, bold: true });
    r.push({ label: "", value: 0, separator: true });

    // ── LUCRO OPERACIONAL ──
    r.push({ label: "LUCRO OPERACIONAL (EBIT)", value: current.lucroOperacional, prevValue: previous.lucroOperacional, bold: true, highlight: true, tooltip: "Lucro Bruto menos Despesas Operacionais" });
    r.push({ label: `Margem operacional: ${current.margemOperacional.toFixed(1)}%`, value: 0, indent: 1 });
    r.push({ label: "", value: 0, separator: true });

    // ── OUTRAS RECEITAS/DESPESAS ──
    r.push({ label: "(+) Outras Receitas", value: current.outrasReceitas, prevValue: previous.outrasReceitas, indent: 1, tooltip: "Receitas não operacionais (juros, etc.)" });
    r.push({ label: "(-) Outras Despesas", value: -current.outrasDespesas, prevValue: -previous.outrasDespesas, indent: 1, tooltip: "Despesas financeiras, juros, etc." });
    r.push({ label: "", value: 0, separator: true });

    // ── LUCRO LÍQUIDO ──
    r.push({ label: "LUCRO LÍQUIDO DO EXERCÍCIO", value: current.lucroLiquido, prevValue: previous.lucroLiquido, bold: true, highlight: true, tooltip: "Resultado final após todas as deduções" });
    r.push({ label: `Margem líquida: ${current.margemLiquida.toFixed(1)}%`, value: 0, indent: 1 });

    return r;
  }, [current, previous]);

  const variation = previous.lucroLiquido !== 0
    ? ((current.lucroLiquido - previous.lucroLiquido) / Math.abs(previous.lucroLiquido)) * 100
    : 0;

  return (
    <PageTransition>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">DRE</h1>
              <p className="text-sm text-muted-foreground">Demonstração do Resultado do Exercício</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={exporting}
                className="gap-2"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Exportar PDF
              </Button>
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
          </div>

          {/* PDF-exportable content */}
          <div ref={dreRef} className="space-y-6 bg-background">
            {/* PDF Header (hidden on screen, visible in export) */}
            <div className="hidden print:block text-center mb-4">
              <h2 className="text-xl font-bold">Demonstração do Resultado do Exercício</h2>
              <p className="text-sm text-muted-foreground capitalize">{format(refDate, "MMMM yyyy", { locale: ptBR })}</p>
            </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: "Receita Bruta", value: current.receitaBruta, color: "text-fin-income" },
              { label: "Lucro Bruto", value: current.lucroBruto, color: current.lucroBruto >= 0 ? "text-fin-income" : "text-fin-expense" },
              { label: "Total Despesas", value: current.totalExpenses, color: "text-fin-expense" },
              { label: "Lucro Líquido", value: current.lucroLiquido, color: current.lucroLiquido >= 0 ? "text-fin-income" : "text-fin-expense" },
            ].map((card, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                <p className={cn("text-lg font-bold", card.color)}>{formatBRL(Math.abs(card.value))}</p>
                {i === 3 && variation !== 0 && (
                  <p className={cn("text-xs mt-1", variation > 0 ? "text-fin-income" : "text-fin-expense")}>
                    {variation > 0 ? "+" : ""}{variation.toFixed(1)}% vs mês anterior
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* DRE Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Descrição</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">Mês Atual</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">Mês Anterior</span>
            </div>

            {lines.map((line, i) => {
              if (line.separator) return <div key={i} className="border-t border-border" />;

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
                      "text-sm flex items-center gap-1.5",
                      line.bold ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                    style={{ paddingLeft: (line.indent || 0) * 16 }}
                  >
                    {line.label}
                    {line.tooltip && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[200px] text-xs">
                          {line.tooltip}
                        </TooltipContent>
                      </Tooltip>
                    )}
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
                    {(line.prevValue ?? 0) !== 0 ? formatBRL(Math.abs(line.prevValue!)) : "—"}
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
                  {current.lucroLiquido > 0 ? (
                    <p className="text-fin-income">
                      ✓ Resultado positivo — lucro líquido de {formatBRL(current.lucroLiquido)} ({current.margemLiquida.toFixed(1)}% de margem).
                    </p>
                  ) : (
                    <p className="text-fin-expense">
                      ✗ Resultado negativo — prejuízo de {formatBRL(Math.abs(current.lucroLiquido))}.
                    </p>
                  )}
                  {current.margemBruta > 0 && current.margemBruta < 30 && (
                    <p className="text-fin-pending">⚠ Margem bruta abaixo de 30% — seus custos diretos estão elevados.</p>
                  )}
                  {current.margemOperacional > 0 && current.margemOperacional < 10 && (
                    <p className="text-fin-pending">⚠ Margem operacional abaixo de 10% — atenção às despesas.</p>
                  )}
                  {Object.entries(current.opexGroups).length > 0 && (
                    <p>
                      Maior grupo de despesa:{" "}
                      <strong>
                        {Object.entries(current.opexGroups).sort((a, b) => b[1].total - a[1].total)[0][0]}
                      </strong>{" "}
                      ({formatBRL(Object.entries(current.opexGroups).sort((a, b) => b[1].total - a[1].total)[0][1].total)})
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Guide */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Como ler sua DRE
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Receita → Lucro Bruto</p>
                <p>Receita Bruta menos deduções e custos diretos (CPV). Mostra a eficiência na produção/venda.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Lucro Bruto → EBIT</p>
                <p>Lucro Bruto menos despesas operacionais (pessoal, admin, comercial). Mostra o resultado da operação.</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">EBIT → Lucro Líquido</p>
                <p>EBIT ajustado por receitas/despesas não operacionais. É o resultado final do exercício.</p>
              </div>
            </div>
          </div>
          </div> {/* end dreRef */}
        </div>
      </TooltipProvider>
    </PageTransition>
  );
};

export default DRE;

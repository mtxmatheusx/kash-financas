import React, { useMemo, useRef, useState, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR, enUS, es as esLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { translateCategory } from "@/lib/categoryI18n";

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
  const { formatMoney: formatBRL, t, language } = usePreferences();
  const dateLocale = language === "en" ? enUS : language === "es" ? esLocale : ptBR;
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
    r.push({ label: t("dre.line.grossRevenue"), value: current.receitaBruta, prevValue: previous.receitaBruta, bold: true, highlight: true, tooltip: t("dre.line.tooltipGrossRevenue") });
    Object.entries(current.incomeByCategory).forEach(([cat, val]) => {
      const prev = previous.incomeByCategory[cat] || 0;
      r.push({ label: translateCategory(cat, t), value: val, prevValue: prev, indent: 1 });
    });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.deductions"), value: -current.deducoes, prevValue: -previous.deducoes, indent: 1, tooltip: t("dre.line.tooltipDeductions") });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.netRevenue"), value: current.receitaLiquida, prevValue: previous.receitaLiquida, bold: true, highlight: true, tooltip: t("dre.line.tooltipNetRevenue") });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.cogs"), value: -current.cpv, prevValue: -previous.cpv, bold: true, tooltip: t("dre.line.tooltipCogs") });
    Object.entries(current.cpvByCategory).forEach(([cat, val]) => {
      const prev = previous.cpvByCategory[cat] || 0;
      r.push({ label: translateCategory(cat, t), value: -val, prevValue: -prev, indent: 2 });
    });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.grossProfitLabel"), value: current.lucroBruto, prevValue: previous.lucroBruto, bold: true, highlight: true, tooltip: t("dre.line.tooltipGrossProfit") });
    r.push({ label: t("dre.line.grossMarginLabel").replace("{pct}", current.margemBruta.toFixed(1)), value: 0, indent: 1 });
    r.push({ label: "", value: 0, separator: true });

    Object.entries(current.opexGroups).forEach(([group, data]) => {
      const prevGroup = previous.opexGroups[group];
      r.push({ label: `(-) ${translateCategory(group, t)}`, value: -data.total, prevValue: prevGroup ? -prevGroup.total : 0, bold: true });
      Object.entries(data.categories).forEach(([cat, val]) => {
        const prev = prevGroup?.categories[cat] || 0;
        r.push({ label: translateCategory(cat, t), value: -val, prevValue: -prev, indent: 2 });
      });
    });
    if (current.uncategorized > 0) {
      r.push({ label: t("dre.line.unclassified"), value: -current.uncategorized, prevValue: -previous.uncategorized, indent: 1 });
    }
    r.push({ label: "", value: 0, separator: true });
    r.push({ label: t("dre.line.totalOpex"), value: -current.totalOpex, prevValue: -previous.totalOpex, bold: true });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.ebit"), value: current.lucroOperacional, prevValue: previous.lucroOperacional, bold: true, highlight: true, tooltip: t("dre.line.tooltipEbit") });
    r.push({ label: t("dre.line.opMarginLabel").replace("{pct}", current.margemOperacional.toFixed(1)), value: 0, indent: 1 });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.otherRevenue"), value: current.outrasReceitas, prevValue: previous.outrasReceitas, indent: 1, tooltip: t("dre.line.tooltipOtherRevenue") });
    r.push({ label: t("dre.line.otherExpenses"), value: -current.outrasDespesas, prevValue: -previous.outrasDespesas, indent: 1, tooltip: t("dre.line.tooltipOtherExpenses") });
    r.push({ label: "", value: 0, separator: true });

    r.push({ label: t("dre.line.netProfitLabel"), value: current.lucroLiquido, prevValue: previous.lucroLiquido, bold: true, highlight: true, tooltip: t("dre.line.tooltipNetProfit") });
    r.push({ label: t("dre.line.netMarginLabel").replace("{pct}", current.margemLiquida.toFixed(1)), value: 0, indent: 1 });

    return r;
  }, [current, previous]);

  const variation = previous.lucroLiquido !== 0
    ? ((current.lucroLiquido - previous.lucroLiquido) / Math.abs(previous.lucroLiquido)) * 100
    : 0;

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = 210;
      const h = 297;
      const m = 16; // margin
      const u = w - m * 2; // usable width
      let y = m;

      const monthLabel = format(refDate, "MMMM yyyy", { locale: dateLocale });
      const capitalMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

      // ── Palette ──
      const black = [23, 23, 23] as const;
      const zinc500 = [113, 113, 122] as const;
      const zinc300 = [212, 212, 216] as const;
      const zinc200 = [228, 228, 231] as const;
      const zinc100 = [244, 244, 245] as const;
      const zinc50 = [250, 250, 250] as const;
      const green600 = [22, 163, 74] as const;
      const red600 = [220, 38, 38] as const;
      const white = [255, 255, 255] as const;

      const addPage = () => { if (y > 265) { pdf.addPage(); y = m; } };

      // ── Load logo ──
      const logoImg = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve("");
        img.src = "/favicon.png";
      });

      type C3 = [number, number, number];
      const zinc950: C3 = [9, 9, 11];
      const zinc900: C3 = [24, 24, 27];
      const accentRed: C3 = [244, 63, 94]; // rose-500

      // ════════════════════════════════════════════════
      // 1. HEADER — MOLDURA DARK
      // ════════════════════════════════════════════════
      const headerH = 28;
      pdf.setFillColor(...zinc950);
      pdf.rect(0, 0, w, headerH, "F");

      // Logo image
      if (logoImg) {
        try {
          pdf.addImage(logoImg, "PNG", m, 5, 8, 8);
        } catch { /* fallback below */ }
      }
      // Logo text
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(...white);
      pdf.text("Faciliten", m + 11, 12);

      // Right side: title + date
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...white);
      pdf.text(`DRE — ${capitalMonth}`, w - m, 10, { align: "right" });

      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(161, 161, 170); // zinc-400
      pdf.text(`Emitido em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, w - m, 16, { align: "right" });

      // Accent line below header
      pdf.setFillColor(...accentRed);
      pdf.rect(0, headerH, w, 0.8, "F");

      y = headerH + 8;

      // ════════════════════════════════════════════════
      // 2. RESUMO EXECUTIVO DA IA — border-l-4 accent
      // ════════════════════════════════════════════════
      let aiText = "";
      if (current.receitaBruta === 0 && current.totalExpenses === 0) {
        aiText = "Nenhuma movimentação registrada neste período.";
      } else if (current.lucroLiquido >= 0) {
        aiText = `Resultado positivo no período com lucro líquido de ${formatBRL(current.lucroLiquido)} e margem de ${current.margemLiquida.toFixed(1)}%.`;
        if (current.margemBruta > 0 && current.margemBruta < 30) aiText += " Atenção: margem bruta abaixo de 30%.";
      } else {
        aiText = `Resultado negativo no período com prejuízo de ${formatBRL(Math.abs(current.lucroLiquido))}. Recomenda-se revisão de custos e despesas operacionais.`;
      }
      const aiTextLines = pdf.splitTextToSize(aiText, u - 18);
      const aiBoxH = 10 + aiTextLines.length * 4;

      // Card bg
      pdf.setFillColor(...zinc50);
      pdf.roundedRect(m, y, u, aiBoxH, 2, 2, "F");
      pdf.setDrawColor(...zinc200);
      pdf.roundedRect(m, y, u, aiBoxH, 2, 2, "S");

      // Left accent border (border-l-4)
      pdf.setFillColor(...accentRed);
      pdf.rect(m, y, 1.5, aiBoxH, "F");

      // Title
      pdf.setFontSize(8.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...black);
      pdf.text("✦  Resumo Executivo da IA", m + 6, y + 6);

      // Body
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...zinc500);
      pdf.text(aiTextLines, m + 6, y + 12);
      y += aiBoxH + 6;

      // ════════════════════════════════════════════════
      // 3. KPIs — SaaS Cards with shadow feel
      // ════════════════════════════════════════════════
      const kpis: { label: string; value: number; color: C3 }[] = [
        { label: "Receita Bruta", value: current.receitaBruta, color: [...green600] },
        { label: "Total Despesas", value: current.totalExpenses, color: [...red600] },
        { label: "Lucro Líquido", value: current.lucroLiquido, color: current.lucroLiquido >= 0 ? [...green600] : [...red600] },
      ];

      const kpiW = (u - 8) / 3;
      const kpiH = 28;
      kpis.forEach((kpi, i) => {
        const x = m + i * (kpiW + 4);

        // Shadow simulation (slightly offset rect)
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(x + 0.4, y + 0.4, kpiW, kpiH, 3, 3, "F");

        // Card
        pdf.setFillColor(...white);
        pdf.roundedRect(x, y, kpiW, kpiH, 3, 3, "F");
        pdf.setDrawColor(...zinc200);
        pdf.roundedRect(x, y, kpiW, kpiH, 3, 3, "S");

        // Label
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...zinc500);
        pdf.text(kpi.label.toUpperCase(), x + kpiW / 2, y + 8, { align: "center" });

        // Value (giant)
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...kpi.color);
        pdf.text(formatBRL(Math.abs(kpi.value)), x + kpiW / 2, y + 20, { align: "center" });
      });
      y += kpiH + 8;

      // ════════════════════════════════════════════════
      // 4. TABELA DRE — Minimalismo, header dark
      // ════════════════════════════════════════════════
      const tableStartY = y;

      // Dark header row
      pdf.setFillColor(...zinc900);
      pdf.rect(m, y, u, 8, "F");
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...white);
      pdf.text("DESCRIÇÃO", m + 4, y + 5.5);
      pdf.text("MÊS ATUAL", m + u - 56, y + 5.5);
      pdf.text("MÊS ANTERIOR", m + u - 24, y + 5.5);
      y += 8;

      let rowIdx = 0;
      lines.forEach((line) => {
        addPage();

        if (line.separator) {
          // Only horizontal line, no vertical
          pdf.setDrawColor(...zinc100);
          pdf.setLineWidth(0.2);
          pdf.line(m, y, m + u, y);
          y += 1.5;
          return;
        }

        const rowH = 6.5;

        // Zebra + highlight
        if (line.highlight) {
          pdf.setFillColor(...zinc100);
          pdf.rect(m, y, u, rowH, "F");
        } else if (line.bold && !line.indent) {
          pdf.setFillColor(...zinc50);
          pdf.rect(m, y, u, rowH, "F");
        } else if (rowIdx % 2 === 1) {
          pdf.setFillColor(253, 253, 253);
          pdf.rect(m, y, u, rowH, "F");
        }

        const indent = (line.indent || 0) * 6;

        // Label
        const labelColor: C3 = line.bold ? [...black] : [...zinc500];
        pdf.setFontSize(line.bold ? 8 : 7.5);
        pdf.setFont("helvetica", line.bold ? "bold" : "normal");
        pdf.setTextColor(...labelColor);
        pdf.text(line.label, m + 4 + indent, y + 4.5);

        // Current value (right-aligned)
        if (line.value !== 0) {
          const valColor: C3 = line.value > 0 ? [...green600] : [...red600];
          pdf.setFont("helvetica", line.bold ? "bold" : "normal");
          pdf.setTextColor(...valColor);
          pdf.text(formatBRL(Math.abs(line.value)), m + u - 36, y + 4.5, { align: "right" });
        } else {
          pdf.setTextColor(...zinc300);
          pdf.text("—", m + u - 46, y + 4.5);
        }

        // Previous value (right-aligned)
        const pv = line.prevValue ?? 0;
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...zinc300);
        if (pv !== 0) {
          pdf.text(formatBRL(Math.abs(pv)), m + u - 4, y + 4.5, { align: "right" });
        } else {
          pdf.text("—", m + u - 12, y + 4.5);
        }

        // Horizontal bottom border only
        pdf.setDrawColor(...zinc100);
        pdf.setLineWidth(0.15);
        pdf.line(m, y + rowH, m + u, y + rowH);

        y += rowH + 0.5;
        rowIdx++;
      });

      // ════════════════════════════════════════════════
      // 5. MARGENS RESUMO
      // ════════════════════════════════════════════════
      y += 5;
      addPage();
      const margins = [
        { label: "Margem Bruta", value: `${current.margemBruta.toFixed(1)}%` },
        { label: "Margem Operacional", value: `${current.margemOperacional.toFixed(1)}%` },
        { label: "Margem Líquida", value: `${current.margemLiquida.toFixed(1)}%` },
      ];
      const mCardW = (u - 8) / 3;
      margins.forEach((mg, i) => {
        const x = m + i * (mCardW + 4);
        pdf.setFillColor(...zinc50);
        pdf.roundedRect(x, y, mCardW, 14, 2, 2, "F");
        pdf.setDrawColor(...zinc200);
        pdf.roundedRect(x, y, mCardW, 14, 2, 2, "S");
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...zinc500);
        pdf.text(mg.label, x + mCardW / 2, y + 5.5, { align: "center" });
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...black);
        pdf.text(mg.value, x + mCardW / 2, y + 11.5, { align: "center" });
      });

      // ════════════════════════════════════════════════
      // FOOTER — MOLDURA DARK (all pages)
      // ════════════════════════════════════════════════
      const pageCount = pdf.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        pdf.setPage(p);

        // Dark footer bar
        const footerH = 12;
        pdf.setFillColor(...zinc950);
        pdf.rect(0, h - footerH, w, footerH, "F");

        // Top accent line
        pdf.setFillColor(...accentRed);
        pdf.rect(0, h - footerH, w, 0.6, "F");

        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...white);
        pdf.text("Faciliten · Gestão Financeira Inteligente", m, h - 4.5);
        pdf.text(`Página ${p} de ${pageCount}`, w - m, h - 4.5, { align: "right" });
      }

      pdf.save(`DRE_${format(refDate, "yyyy-MM")}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (err) {
      console.error("Erro ao exportar PDF:", err);
      toast.error("Erro ao exportar PDF");
    } finally {
      setExporting(false);
    }
  }, [refDate, current, lines, formatBRL]);

  return (
    <PageTransition>
      <TooltipProvider>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("dre.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("dre.subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting} className="gap-2">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {t("dre.exportPdf")}
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
              { label: t("dre.grossRevenue"), value: current.receitaBruta, color: "text-fin-income" },
              { label: t("dre.grossProfit"), value: current.lucroBruto, color: current.lucroBruto >= 0 ? "text-fin-income" : "text-fin-expense" },
              { label: t("dre.totalExpenses"), value: current.totalExpenses, color: "text-fin-expense" },
              { label: t("dre.netProfit"), value: current.lucroLiquido, color: current.lucroLiquido >= 0 ? "text-fin-income" : "text-fin-expense" },
            ].map((card, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                <p className={cn("text-lg font-bold", card.color)}>{formatBRL(Math.abs(card.value))}</p>
                {i === 3 && variation !== 0 && (
                  <p className={cn("text-xs mt-1", variation > 0 ? "text-fin-income" : "text-fin-expense")}>
                    {variation > 0 ? "+" : ""}{variation.toFixed(1)}% {t("dre.vsLastMonth")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* DRE Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 px-4 py-3 border-b border-border bg-muted/30">
              <span className="text-xs font-semibold text-muted-foreground uppercase">{t("dre.description")}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">{t("dre.currentMonth")}</span>
              <span className="text-xs font-semibold text-muted-foreground uppercase text-right min-w-[100px]">{t("dre.previousMonth")}</span>
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
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("dre.autoAnalysis")}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {current.receitaBruta === 0 && current.totalExpenses === 0 ? (
                <p>{t("dre.noMovements")}</p>
              ) : (
                <>
                  {current.lucroLiquido > 0 ? (
                    <p className="text-fin-income">
                      {t("dre.positiveResult").replace("{amount}", formatBRL(current.lucroLiquido)).replace("{pct}", current.margemLiquida.toFixed(1))}
                    </p>
                  ) : (
                    <p className="text-fin-expense">
                      {t("dre.negativeResult").replace("{amount}", formatBRL(Math.abs(current.lucroLiquido)))}
                    </p>
                  )}
                  {current.margemBruta > 0 && current.margemBruta < 30 && (
                    <p className="text-fin-pending">{t("dre.lowGrossMargin")}</p>
                  )}
                  {current.margemOperacional > 0 && current.margemOperacional < 10 && (
                    <p className="text-fin-pending">{t("dre.lowOpMargin")}</p>
                  )}
                  {Object.entries(current.opexGroups).length > 0 && (
                    <p>
                      {t("dre.topExpenseGroup")}{" "}
                      <strong>{Object.entries(current.opexGroups).sort((a, b) => b[1].total - a[1].total)[0][0]}</strong>{" "}
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
              {t("dre.howToRead")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div className="space-y-1">
                <p className="font-medium text-foreground">{t("dre.revenueToGross")}</p>
                <p>{t("dre.revenueToGrossDesc")}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{t("dre.grossToEbit")}</p>
                <p>{t("dre.grossToEbitDesc")}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{t("dre.ebitToNet")}</p>
                <p>{t("dre.ebitToNetDesc")}</p>
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

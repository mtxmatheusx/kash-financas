import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";

const parseNumber = (v: string) => {
  const cleaned = v.replace(/[^\d,.-]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

interface FieldDef {
  key: string;
  label: string;
  hint: string;
  negative?: boolean;
}

const fields: FieldDef[] = [
  { key: "receita", label: "Receita Operacional Bruta", hint: "Total de vendas / faturamento bruto" },
  { key: "despVendas", label: "(-) Despesas com Vendas", hint: "Comissões, fretes, marketing", negative: true },
  { key: "despAdmin", label: "(-) Despesas Gerais e Administrativas", hint: "Salários, aluguel, escritório", negative: true },
  { key: "despOp", label: "(-) Outras Despesas Operacionais", hint: "Manutenção, seguros, utilities", negative: true },
  { key: "deprec", label: "(+) Depreciação e Amortização", hint: "Desgaste de ativos e intangíveis" },
  { key: "jurosP", label: "(-) Juros Pagos", hint: "Despesas financeiras com empréstimos", negative: true },
  { key: "jurosR", label: "(+) Juros Recebidos", hint: "Rendimentos de aplicações financeiras" },
];

const EBITDA: React.FC = () => {
  const { formatMoney: formatBRL } = usePreferences();
  const [values, setValues] = useState<Record<string, string>>({});

  const update = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const nums = useMemo(() => {
    const r: Record<string, number> = {};
    fields.forEach(f => { r[f.key] = parseNumber(values[f.key] || ""); });
    return r;
  }, [values]);

  const calc = useMemo(() => {
    const receita = nums.receita;
    const lucroOperacional = receita - nums.despVendas - nums.despAdmin - nums.despOp;
    const resultadoFinanceiro = nums.jurosR - nums.jurosP;
    const lucroAntes = lucroOperacional + resultadoFinanceiro;
    const ebitda = lucroAntes + nums.deprec + nums.jurosP - nums.jurosR;
    const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;
    return { lucroOperacional, resultadoFinanceiro, lucroAntes, ebitda, margemEbitda };
  }, [nums]);

  const hasData = nums.receita > 0;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calculadora EBITDA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Calcule a margem EBITDA da sua empresa de forma simples e rápida
          </p>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">O que é EBITDA?</p>
            <p>
              EBITDA significa <strong>Earnings Before Interest, Taxes, Depreciation and Amortization</strong> 
              (Lucros antes de Juros, Impostos, Depreciação e Amortização). É um indicador que mede a 
              geração operacional de caixa de uma empresa, excluindo efeitos financeiros e contábeis.
            </p>
            <p className="text-xs mt-2">
              <strong>Fórmula:</strong> EBITDA = Lucro Operacional + Depreciação + Amortização
              <br />
              <strong>Margem EBITDA:</strong> (EBITDA ÷ Receita Bruta) × 100
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Dados da Operação</h2>
          <div className="space-y-3">
            {fields.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-sm font-medium text-foreground">{f.label}</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="R$ 0,00"
                  value={values[f.key] || ""}
                  onChange={e => update(f.key, e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">{f.hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">Resultado</h2>
          </div>

          <div className="divide-y divide-border/50">
            <Row label="Receita Operacional Bruta" value={nums.receita} />
            <Row label="(-) Despesas com Vendas" value={-nums.despVendas} />
            <Row label="(-) Despesas Gerais e Admin." value={-nums.despAdmin} />
            <Row label="(-) Outras Desp. Operacionais" value={-nums.despOp} />
            <Row label="= Lucro Operacional" value={calc.lucroOperacional} bold highlight />
            <Row label="(+) Depreciação e Amortização" value={nums.deprec} />
            <Row label="(+) Juros Pagos" value={nums.jurosP} />
            <Row label="(-) Juros Recebidos" value={-nums.jurosR} />
          </div>

          {/* EBITDA Highlight */}
          <div className="border-t-2 border-primary/30 bg-primary/5 px-5 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">EBITDA</p>
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  calc.ebitda >= 0 ? "text-fin-income" : "text-fin-expense"
                )}>
                  {formatBRL(calc.ebitda)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Margem EBITDA</p>
                <p className={cn(
                  "text-3xl font-bold font-mono",
                  !hasData ? "text-muted-foreground" : calc.margemEbitda >= 15 ? "text-fin-income" : calc.margemEbitda >= 5 ? "text-fin-pending" : "text-fin-expense"
                )}>
                  {hasData ? `${calc.margemEbitda.toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>

            {hasData && (
              <p className="text-sm text-muted-foreground mt-3">
                {calc.margemEbitda >= 20
                  ? "Excelente! Margem EBITDA acima de 20% indica uma operação altamente eficiente."
                  : calc.margemEbitda >= 10
                  ? "Boa margem. Sua operação gera caixa de forma saudável."
                  : calc.margemEbitda >= 0
                  ? "Margem baixa. Considere revisar custos operacionais para melhorar a eficiência."
                  : "Margem negativa. A operação está consumindo mais caixa do que gera."}
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const Row: React.FC<{ label: string; value: number; bold?: boolean; highlight?: boolean }> = ({
  label, value, bold, highlight
}) => (
  <div className={cn("flex items-center justify-between px-5 py-2.5", highlight && "bg-muted/20")}>
    <span className={cn("text-sm", bold ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {label}
    </span>
    <span className={cn(
      "text-sm font-mono",
      bold ? "font-semibold" : "",
      value > 0 ? "text-fin-income" : value < 0 ? "text-fin-expense" : "text-muted-foreground"
    )}>
      {formatBRL(Math.abs(value))}
    </span>
  </div>
);

export default EBITDA;

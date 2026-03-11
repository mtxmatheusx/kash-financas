import React, { useState, useMemo, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Info, ChevronLeft, ChevronRight, RefreshCw, BookOpen, Target, AlertTriangle } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const parseNumber = (v: string) => {
  const cleaned = v.replace(/[^\d,.-]/g, "").replace(",", ".");
  return isNaN(parseFloat(cleaned)) ? 0 : parseFloat(cleaned);
};

/* Category mappings for auto-fill */
const COST_CATS = ["Fornecedores", "Infraestrutura"];
const VENDAS_CATS = ["Marketing", "Lazer"];
const ADMIN_CATS = ["Funcionários", "Casa", "Transporte", "Saúde", "Alimentação"];
const OTHER_CATS = ["Impostos", "Outros"];

interface FieldDef {
  key: string;
  label: string;
  hint: string;
}

const fields: FieldDef[] = [
  { key: "receita", label: "Receita Operacional Bruta", hint: "Total de vendas / faturamento bruto" },
  { key: "cpv", label: "(-) Custos dos Produtos/Serviços", hint: "Custos diretos de produção ou aquisição" },
  { key: "despVendas", label: "(-) Despesas com Vendas", hint: "Comissões, fretes, marketing" },
  { key: "despAdmin", label: "(-) Despesas Gerais e Administrativas", hint: "Salários, aluguel, escritório" },
  { key: "despOp", label: "(-) Outras Despesas Operacionais", hint: "Manutenção, seguros, utilities" },
  { key: "deprec", label: "(+) Depreciação e Amortização", hint: "Desgaste de ativos e intangíveis" },
];

const EBITDA: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const { allTransactions } = useTransactions();
  const { account } = useAccount();
  const [values, setValues] = useState<Record<string, string>>({});
  const [refDate, setRefDate] = useState(new Date());
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const monthStart = startOfMonth(refDate);
  const monthEnd = endOfMonth(refDate);

  // Auto-fill from transactions
  const autoValues = useMemo(() => {
    const txs = allTransactions.filter(t => {
      const d = new Date(t.date);
      return t.account_type === account.type && d >= monthStart && d <= monthEnd;
    });
    const incomes = txs.filter(t => t.type === "income");
    const expenses = txs.filter(t => t.type === "expense");

    const sumCats = (cats: string[]) => expenses.filter(t => cats.includes(t.category)).reduce((s, t) => s + t.amount, 0);

    return {
      receita: incomes.reduce((s, t) => s + t.amount, 0),
      cpv: sumCats(COST_CATS),
      despVendas: sumCats(VENDAS_CATS),
      despAdmin: sumCats(ADMIN_CATS),
      despOp: sumCats(OTHER_CATS),
      deprec: 0,
    };
  }, [allTransactions, account.type, refDate]);

  // Reset manual values when switching to auto
  useEffect(() => {
    if (mode === "auto") setValues({});
  }, [mode]);

  const nums = useMemo(() => {
    if (mode === "auto") return autoValues;
    const r: Record<string, number> = {};
    fields.forEach(f => { r[f.key] = parseNumber(values[f.key] || ""); });
    return r;
  }, [mode, values, autoValues]);

  const calc = useMemo(() => {
    const receita = nums.receita;
    const lucroBruto = receita - nums.cpv;
    const lucroOperacional = lucroBruto - nums.despVendas - nums.despAdmin - nums.despOp;
    const ebitda = lucroOperacional + nums.deprec;
    const margemEbitda = receita > 0 ? (ebitda / receita) * 100 : 0;
    const margemBruta = receita > 0 ? (lucroBruto / receita) * 100 : 0;
    return { lucroBruto, lucroOperacional, ebitda, margemEbitda, margemBruta };
  }, [nums]);

  const hasData = nums.receita > 0;

  const update = (key: string, val: string) => setValues(prev => ({ ...prev, [key]: val }));

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calculadora EBITDA</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Calcule a margem EBITDA da sua empresa de forma simples e rápida
            </p>
          </div>
          {mode === "auto" && (
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
          )}
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">O que é EBITDA?</p>
            <p>
              EBITDA significa <strong className="text-foreground">Earnings Before Interest, Taxes, Depreciation and Amortization</strong>{" "}
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

        {/* Mode Toggle */}
        <Tabs value={mode} onValueChange={v => setMode(v as "auto" | "manual")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="auto" className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Dados automáticos
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              ✏️ Entrada manual
            </TabsTrigger>
          </TabsList>

          {/* Auto Mode */}
          <TabsContent value="auto" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Dados da Operação (automático)</h2>
              <p className="text-xs text-muted-foreground">Valores preenchidos automaticamente com base nas suas transações do mês selecionado.</p>
              <div className="divide-y divide-border/50">
                {fields.map(f => (
                  <div key={f.key} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.hint}</p>
                    </div>
                    <span className="text-sm font-mono text-foreground">{formatBRL(autoValues[f.key as keyof typeof autoValues] || 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Manual Mode */}
          <TabsContent value="manual" className="mt-4">
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
          </TabsContent>
        </Tabs>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">Resultado</h2>
          </div>

          <div className="divide-y divide-border/50">
            <Row label="Receita Operacional Bruta" value={nums.receita} />
            <Row label="(-) Custos dos Produtos/Serviços" value={-nums.cpv} />
            <Row label="= Lucro Bruto" value={calc.lucroBruto} bold highlight />
            <Row label="(-) Despesas com Vendas" value={-nums.despVendas} />
            <Row label="(-) Despesas Gerais e Admin." value={-nums.despAdmin} />
            <Row label="(-) Outras Desp. Operacionais" value={-nums.despOp} />
            <Row label="= Lucro Operacional" value={calc.lucroOperacional} bold highlight />
            <Row label="(+) Depreciação e Amortização" value={nums.deprec} />
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

        {/* Educational Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Aplicações</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Avaliação e valuation de empresas</li>
              <li>• Comparação entre empresas do setor</li>
              <li>• Análise de capacidade de pagamento</li>
              <li>• Decisões de investimento</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Referências</h3>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>&gt; 20%</strong> — Margem excelente</p>
              <p><strong>10–20%</strong> — Margem saudável</p>
              <p><strong>5–10%</strong> — Atenção necessária</p>
              <p><strong>&lt; 5%</strong> — Operação ineficiente</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-fin-pending" />
              <h3 className="text-sm font-semibold text-foreground">Limitações</h3>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Não considera necessidade de capital</li>
              <li>• Ignora custos financeiros reais</li>
              <li>• Pode mascarar endividamento</li>
              <li>• Não substitui o fluxo de caixa</li>
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const Row: React.FC<{ label: string; value: number; bold?: boolean; highlight?: boolean }> = ({
  label, value, bold, highlight
}) => {
  const { formatMoney: formatBRL } = usePreferences();
  return (
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
};

export default EBITDA;

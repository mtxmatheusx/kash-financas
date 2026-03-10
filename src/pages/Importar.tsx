import React, { useState, useCallback, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, Check, AlertTriangle, X, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

// --- Parsing Utilities ---

function parseLocalizedNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return value;

  let cleaned = String(value).replace(/\s/g, "").replace(/[R$€$£¥]/g, "");
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");

  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, "");
  } else if (lastComma !== -1 && lastDot === -1) {
    cleaned = cleaned.replace(",", ".");
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseDate(value: any): string | null {
  if (!value) return null;

  if (typeof value === "number" && value > 1 && value < 100000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(epoch.getTime() + value * 86400000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    // ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    // DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    // DD/MM/YY
    const dmyShort = trimmed.match(/^(\d{1,2})[/\\-.](\d{1,2})[/\\-.](\d{2})$/);
    if (dmyShort) {
      const [, d, m, y] = dmyShort;
      const fullYear = parseInt(y) > 50 ? `19${y}` : `20${y}`;
      return `${fullYear}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return null;
}

function normalizeHeader(h: any): string {
  if (!h) return "";
  return String(h).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
}

// Known header aliases
const FIELD_ALIASES: Record<string, string[]> = {
  description: ["descricao", "descrição", "description", "historico", "histórico", "lancamento", "lançamento", "memo", "obs", "observacao"],
  amount: ["valor", "amount", "value", "quantia", "montante", "total"],
  date: ["data", "date", "dt", "vencimento", "competencia", "competência"],
  category: ["categoria", "category", "tipo", "type", "classificacao", "classificação"],
  type: ["tipo_transacao", "tipo transacao", "type", "entrada_saida", "natureza", "credit_debit", "credito_debito"],
};

function detectField(header: string): string | null {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some(a => norm.includes(a))) return field;
  }
  return null;
}

interface ParsedRow {
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "income" | "expense";
  raw: Record<string, any>;
  warnings: string[];
}

interface ImportResult {
  headers: string[];
  rawRows: Record<string, any>[];
  mapping: Record<string, string>; // field -> header
  parsed: ParsedRow[];
  duplicates: number;
  errors: number;
}

const Importar: React.FC = () => {
  const { transactions, create } = useTransactions();
  const { account } = useAccount();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "done">("upload");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();

    let rawRows: Record<string, any>[] = [];
    let headers: string[] = [];

    if (ext === "csv") {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;

      headers = parseCSVLine(lines[0]);
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        const row: Record<string, any> = {};
        headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
        rawRows.push(row);
      }
    } else {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      if (json.length === 0) return;
      headers = Object.keys(json[0]);
      rawRows = json;
    }

    // Auto-detect mapping
    const autoMap: Record<string, string> = {};
    headers.forEach(h => {
      const field = detectField(h);
      if (field && !autoMap[field]) autoMap[field] = h;
    });

    setMapping(autoMap);
    setResult({ headers, rawRows, mapping: autoMap, parsed: [], duplicates: 0, errors: 0 });
    setStep("mapping");
  }, []);

  const processMapping = useCallback(() => {
    if (!result) return;

    const existingKeys = new Set(
      transactions.map(t => `${t.date}-${t.amount}-${t.description.substring(0, 20)}`)
    );

    const parsed: ParsedRow[] = [];
    let duplicates = 0;
    let errors = 0;

    for (const row of result.rawRows) {
      const warnings: string[] = [];

      const description = String(row[mapping.description] || "").trim();
      const rawAmount = row[mapping.amount];
      const rawDate = row[mapping.date];
      const rawCategory = mapping.category ? String(row[mapping.category] || "").trim() : "";
      const rawType = mapping.type ? normalizeHeader(row[mapping.type]) : "";

      const amount = parseLocalizedNumber(rawAmount);
      const date = parseDate(rawDate);

      if (!description && !amount) { errors++; continue; }
      if (!amount || amount === 0) { warnings.push("Valor inválido"); errors++; continue; }
      if (!date) { warnings.push("Data inválida"); errors++; continue; }

      // Detect type
      let type: "income" | "expense" = "expense";
      if (rawType.includes("receita") || rawType.includes("entrada") || rawType.includes("credit") || rawType.includes("credito")) {
        type = "income";
      } else if (amount > 0 && !rawType) {
        // If no type column, positive = income, negative = expense
        // Actually keep it ambiguous — default to expense unless clearly income
      }

      const absAmount = Math.abs(amount);
      const key = `${date}-${absAmount}-${(description || "").substring(0, 20)}`;
      if (existingKeys.has(key)) { duplicates++; continue; }
      existingKeys.add(key);

      parsed.push({
        description: description || "Sem descrição",
        amount: absAmount,
        date,
        category: rawCategory || "Outros",
        type,
        raw: row,
        warnings,
      });
    }

    setResult(prev => prev ? { ...prev, parsed, duplicates, errors } : null);
    setStep("preview");
  }, [result, mapping, transactions]);

  const doImport = useCallback(() => {
    if (!result) return;
    setImporting(true);

    let count = 0;
    for (const row of result.parsed) {
      create({
        type: row.type,
        amount: row.amount,
        description: row.description,
        category: row.category,
        date: row.date,
        status: "paid" as const,
        account_type: account.type,
      });
      count++;
    }

    setImportCount(count);
    setImporting(false);
    setStep("done");
  }, [result, create, account.type]);

  const reset = () => {
    setStep("upload");
    setResult(null);
    setMapping({});
    setImportCount(0);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Importar Planilha</h1>
          <p className="text-sm text-muted-foreground">Importe transações de arquivos CSV ou Excel (.xlsx)</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          {["Upload", "Mapeamento", "Pré-visualização", "Concluído"].map((label, i) => {
            const stepIndex = ["upload", "mapping", "preview", "done"].indexOf(step);
            return (
              <React.Fragment key={label}>
                {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                <span className={cn(
                  "px-2 py-1 rounded-md",
                  i === stepIndex ? "bg-primary text-primary-foreground" :
                  i < stepIndex ? "bg-muted text-foreground" : "text-muted-foreground"
                )}>{label}</span>
              </React.Fragment>
            );
          })}
        </div>

        {/* STEP: Upload */}
        {step === "upload" && (
          <div
            className="rounded-xl border-2 border-dashed border-border bg-card p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Clique para selecionar ou arraste o arquivo</p>
            <p className="text-xs text-muted-foreground mt-1">Formatos aceitos: CSV, XLSX, XLS</p>
          </div>
        )}

        {/* STEP: Mapping */}
        {step === "mapping" && result && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{fileName}</p>
                <p className="text-xs text-muted-foreground">{result.rawRows.length} linhas encontradas</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">Associe as colunas da planilha aos campos do sistema:</p>

            <div className="space-y-3">
              {(["description", "amount", "date", "category", "type"] as const).map(field => {
                const labels: Record<string, string> = {
                  description: "Descrição *",
                  amount: "Valor *",
                  date: "Data *",
                  category: "Categoria",
                  type: "Tipo (Receita/Despesa)",
                };
                const required = ["description", "amount", "date"].includes(field);
                return (
                  <div key={field} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm font-medium text-foreground min-w-[160px]">{labels[field]}</span>
                    <Select
                      value={mapping[field] || "__none__"}
                      onValueChange={v => setMapping(prev => ({ ...prev, [field]: v === "__none__" ? "" : v }))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione a coluna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Não mapear —</SelectItem>
                        {result.headers.map(h => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {required && !mapping[field] && (
                      <AlertTriangle className="w-4 h-4 text-fin-pending shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Preview sample */}
            {result.rawRows.length > 0 && (
              <div className="text-xs text-muted-foreground border-t border-border pt-3">
                <p className="font-medium mb-1">Amostra da primeira linha:</p>
                <div className="grid grid-cols-2 gap-1">
                  {result.headers.slice(0, 8).map(h => (
                    <div key={h}><span className="font-mono">{h}:</span> {String(result.rawRows[0][h]).substring(0, 30)}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={reset}>Cancelar</Button>
              <Button
                onClick={processMapping}
                disabled={!mapping.description || !mapping.amount || !mapping.date}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Preview */}
        {step === "preview" && result && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-fin-income">{result.parsed.length}</p>
                <p className="text-xs text-muted-foreground">Prontas</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-fin-pending">{result.duplicates}</p>
                <p className="text-xs text-muted-foreground">Duplicadas</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 text-center">
                <p className="text-2xl font-bold text-fin-expense">{result.errors}</p>
                <p className="text-xs text-muted-foreground">Erros</p>
              </div>
            </div>

            {/* Table preview */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Data</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Descrição</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Categoria</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">Tipo</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-muted-foreground">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.parsed.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="px-3 py-2 text-muted-foreground font-mono text-xs">{row.date}</td>
                        <td className="px-3 py-2 text-foreground">{row.description.substring(0, 40)}</td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs">{row.category}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={cn(
                            "text-xs",
                            row.type === "income"
                              ? "bg-fin-income/10 text-fin-income border-fin-income/20"
                              : "bg-fin-expense/10 text-fin-expense border-fin-expense/20"
                          )}>
                            {row.type === "income" ? "Receita" : "Despesa"}
                          </Badge>
                        </td>
                        <td className={cn(
                          "px-3 py-2 text-right font-mono",
                          row.type === "income" ? "text-fin-income" : "text-fin-expense"
                        )}>
                          {formatBRL(row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.parsed.length > 20 && (
                <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border">
                  Mostrando 20 de {result.parsed.length} transações
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("mapping")}>Voltar</Button>
              <Button onClick={doImport} disabled={importing || result.parsed.length === 0}>
                {importing ? "Importando..." : `Importar ${result.parsed.length} transações`}
              </Button>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === "done" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-fin-income/10 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-fin-income" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Importação concluída!</h2>
            <p className="text-sm text-muted-foreground">
              {importCount} transações foram importadas com sucesso para a conta {account.type === "personal" ? "Pessoal" : "Empresa"}.
            </p>
            <Button onClick={reset}>Importar outro arquivo</Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

// CSV parser with quote awareness
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "," || char === ";") && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export default Importar;

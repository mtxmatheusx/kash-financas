import React, { useState, useCallback, useRef } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, Check, AlertTriangle, ArrowRight, Download, Brain, Loader2, Sparkles, RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

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
    if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }

  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().slice(0, 10);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const dmyMatch = trimmed.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    const dmyShort = trimmed.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2})$/);
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

// Fallback local aliases (used if AI is unavailable)
const FIELD_ALIASES: Record<string, string[]> = {
  description: ["descricao", "descrição", "description", "historico", "histórico", "lancamento", "lançamento", "memo", "obs", "observacao"],
  amount: ["valor", "amount", "value", "quantia", "montante", "total"],
  date: ["data", "date", "dt", "vencimento", "competencia", "competência"],
  category: ["categoria", "category", "tipo", "type", "classificacao", "classificação"],
  type: ["tipo_transacao", "tipo transacao", "type", "entrada_saida", "natureza", "credit_debit", "credito_debito"],
};

function detectFieldLocal(header: string): string | null {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some(a => norm.includes(a))) return field;
  }
  return null;
}

// Smart sheet data extraction: finds actual header row, skips empty/merged rows
function extractSheetData(ws: XLSX.WorkSheet): { headers: string[]; rawRows: Record<string, any>[] } {
  // First try default parsing
  const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
  if (json.length === 0) return { headers: [], rawRows: [] };

  let headers = Object.keys(json[0]);
  let rawRows = json;

  // Check if headers are mostly __EMPTY patterns (meaning the real header is not on row 1)
  const emptyHeaderCount = headers.filter(h => /^__EMPTY/.test(String(h))).length;
  const isHeaderBroken = emptyHeaderCount > headers.length * 0.5;

  if (isHeaderBroken) {
    // Scan rows to find the actual header row (first row with mostly non-empty string values)
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    let headerRowIdx = -1;

    for (let r = range.s.r; r <= Math.min(range.s.r + 15, range.e.r); r++) {
      let filledCells = 0;
      let totalCells = 0;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        totalCells++;
        if (cell && cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== "") {
          filledCells++;
        }
      }
      // A good header row has at least 3 filled cells and > 40% fill rate
      if (filledCells >= 3 && filledCells / totalCells > 0.4) {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx >= 0) {
      // Re-parse with the correct header row
      const reparsed = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: "",
        range: headerRowIdx,
      });
      if (reparsed.length > 0) {
        headers = Object.keys(reparsed[0]);
        rawRows = reparsed;
      }
    }
  }

  // Filter out __EMPTY* headers
  headers = headers.filter(h => h && String(h).trim() !== "" && !/^__EMPTY/.test(String(h)));

  return { headers, rawRows };
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
  mapping: Record<string, string>;
  parsed: ParsedRow[];
  duplicates: number;
  errors: number;
}

// CSV parser with quote awareness
function parseCSVLine(line: string, delimiter: string = ","): string[] {
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
    } else if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

const Importar: React.FC = () => {
  const { transactions, create } = useTransactions();
  const { account } = useAccount();
  const { t } = usePreferences();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "done">("upload");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const [aiMapping, setAiMapping] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [sheetsAvailable, setSheetsAvailable] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);

  const requestAiMapping = useCallback(async (headers: string[], rawRows: Record<string, any>[]) => {
    setAiMapping(true);
    try {
      const sampleRows = rawRows.slice(0, 3);
      const { data, error } = await supabase.functions.invoke("map-columns", {
        body: { headers, sampleRows },
      });

      if (error) throw error;

      if (data?.mapping) {
        // Filter out empty values and validate against actual headers
        const validMapping: Record<string, string> = {};
        for (const [field, col] of Object.entries(data.mapping)) {
          if (col && headers.includes(col as string)) {
            validMapping[field] = col as string;
          }
        }
        setMapping(validMapping);
        setAiConfidence(data.confidence || null);
        setAiNotes(data.notes || null);
        toast.success("IA mapeou as colunas automaticamente!");
        return validMapping;
      }
    } catch (err: any) {
      console.error("AI mapping error:", err);
      toast.error("IA indisponível — usando mapeamento por padrões");
    } finally {
      setAiMapping(false);
    }
    return null;
  }, []);

  const fallbackMapping = useCallback((headers: string[]) => {
    const autoMap: Record<string, string> = {};
    headers.forEach(h => {
      const field = detectFieldLocal(h);
      if (field && !autoMap[field]) autoMap[field] = h;
    });
    return autoMap;
  }, []);

  const processSheetData = useCallback(async (headers: string[], rawRows: Record<string, any>[]) => {
    // Try AI first, fallback to local
    const aiMap = await requestAiMapping(headers, rawRows);
    const finalMap = aiMap || fallbackMapping(headers);
    setMapping(finalMap);
    setResult({ headers, rawRows, mapping: finalMap, parsed: [], duplicates: 0, errors: 0 });
    setStep("mapping");
  }, [requestAiMapping, fallbackMapping]);

  const handleFile = useCallback(async (file: File) => {
    try {
      setFileName(file.name);
      const ext = file.name.split(".").pop()?.toLowerCase();

      let rawRows: Record<string, any>[] = [];
      let headers: string[] = [];

      if (ext === "csv" || ext === "txt") {
        const text = await file.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) {
          toast.error("Arquivo vazio ou com apenas uma linha");
          return;
        }

        const firstLine = lines[0];
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const commaCount = (firstLine.match(/,/g) || []).length;
        const tabCount = (firstLine.match(/\t/g) || []).length;
        const delimiter = tabCount > semicolonCount && tabCount > commaCount ? "\t" : semicolonCount > commaCount ? ";" : ",";

        headers = parseCSVLine(lines[0], delimiter);
        for (let i = 1; i < lines.length; i++) {
          const vals = parseCSVLine(lines[i], delimiter);
          if (vals.every(v => !v.trim())) continue; // skip empty rows
          const row: Record<string, any> = {};
          headers.forEach((h, idx) => { row[h] = vals[idx] || ""; });
          rawRows.push(row);
        }
      } else {
        // XLSX, XLS, ODS
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array", cellDates: true });

        // Multi-sheet support
        if (wb.SheetNames.length > 1) {
          setSheetsAvailable(wb.SheetNames);
          setWorkbookRef(wb);
          setSelectedSheet(wb.SheetNames[0]);
        }

        const ws = wb.Sheets[wb.SheetNames[0]];
        ({ headers, rawRows } = extractSheetData(ws));
        if (rawRows.length === 0) {
          toast.error("Planilha vazia — nenhuma linha encontrada");
          return;
        }
      }

      if (headers.length === 0) {
        toast.error("Não foi possível detectar colunas no arquivo");
        return;
      }

      toast.success(`${rawRows.length} linhas carregadas de "${file.name}"`);
      await processSheetData(headers, rawRows);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(`Erro ao ler arquivo: ${err.message || "formato não suportado"}`);
    }
  }, [processSheetData]);

  const switchSheet = useCallback(async (sheetName: string) => {
    if (!workbookRef) return;
    setSelectedSheet(sheetName);
    const ws = workbookRef.Sheets[sheetName];
    const { headers, rawRows } = extractSheetData(ws);
    if (rawRows.length === 0) {
      toast.error("Aba vazia");
      return;
    }
    toast.info(`Aba "${sheetName}": ${rawRows.length} linhas`);
    await processSheetData(headers, rawRows);
  }, [workbookRef, processSheetData]);

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
      if (!amount || amount === 0) { errors++; continue; }
      if (!date) { errors++; continue; }

      let type: "income" | "expense" = "expense";
      if (rawType.includes("receita") || rawType.includes("entrada") || rawType.includes("credit") || rawType.includes("credito")) {
        type = "income";
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
    setAiConfidence(null);
    setAiNotes(null);
    setSheetsAvailable([]);
    setSelectedSheet("");
    setWorkbookRef(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const templateData = [
      { Data: "10/03/2025", "Descrição": "Salário mensal", Valor: "5000,00", Categoria: "Salário", Tipo: "Receita" },
      { Data: "11/03/2025", "Descrição": "Aluguel", Valor: "1500,00", Categoria: "Moradia", Tipo: "Despesa" },
      { Data: "12/03/2025", "Descrição": "Supermercado", Valor: "450,00", Categoria: "Alimentação", Tipo: "Despesa" },
      { Data: "15/03/2025", "Descrição": "Freelance", Valor: "2000,00", Categoria: "Renda Extra", Tipo: "Receita" },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 14 }, { wch: 30 }, { wch: 14 }, { wch: 18 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");
    XLSX.writeFile(wb, "modelo-importacao-faciliten.xlsx");
    toast.success("Modelo baixado com sucesso!");
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("import.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("import.subtitle")}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium flex-wrap">
          {[t("import.stepUpload"), t("import.stepMapping"), t("import.stepPreview"), t("import.stepDone")].map((label, i) => {
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
          <div className="space-y-4">
            <div
              className="rounded-xl border-2 border-dashed border-border bg-card p-8 sm:p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,.ods,.txt,.tsv"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">{t("import.clickToSelect")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("import.fileTypes")}</p>
            </div>

            {/* AI badge */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  {t("import.aiMapping")}
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("import.aiMappingDesc")}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t("import.templateTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    {t("import.templateDesc")}
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
                    <Download className="w-3.5 h-3.5" /> {t("import.downloadTemplate")}
                  </Button>
                </div>
              </div>
            </div>

            {/* Reset imported data */}
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-start gap-3">
                <Trash2 className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{t("import.resetTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                    {t("import.resetDesc")}
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-3.5 h-3.5" /> {t("import.resetAll")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("import.resetConfirmTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("import.resetConfirmDesc").replace("{account}", account.type === "personal" ? t("topbar.personal") : t("topbar.business"))}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => {
                            const keys = ['fincontrol-transactions', 'fincontrol-investments', 'fincontrol-goals'];
                            const currentAccount = account.type;
                            keys.forEach(key => {
                              try {
                                const data = JSON.parse(localStorage.getItem(key) || '[]');
                                const filtered = data.filter((item: any) => item.account_type !== currentAccount);
                                localStorage.setItem(key, JSON.stringify(filtered));
                              } catch { localStorage.setItem(key, '[]'); }
                            });
                            toast.success('Todos os dados da conta foram resetados. Recarregue a página para ver as mudanças.');
                            setTimeout(() => window.location.reload(), 1000);
                          }}
                        >
                          Sim, resetar tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Mapping */}
        {step === "mapping" && result && (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{fileName}</p>
                  <p className="text-xs text-muted-foreground">{result.rawRows.length} linhas encontradas</p>
                </div>
              </div>
              {aiMapping && (
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  IA analisando...
                </div>
              )}
            </div>

            {/* Multi-sheet selector */}
            {sheetsAvailable.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Abas:</span>
                {sheetsAvailable.map(s => (
                  <Button
                    key={s}
                    variant={s === selectedSheet ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => switchSheet(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            )}

            {/* AI confidence badge */}
            {aiConfidence && (
              <div className={cn(
                "rounded-lg px-3 py-2 text-xs flex items-start gap-2",
                aiConfidence === "high" ? "bg-fin-income/10 border border-fin-income/20" :
                aiConfidence === "medium" ? "bg-fin-pending/10 border border-fin-pending/20" :
                "bg-fin-expense/10 border border-fin-expense/20"
              )}>
                <Brain className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">
                    IA: confiança {aiConfidence === "high" ? "alta" : aiConfidence === "medium" ? "média" : "baixa"}
                  </span>
                  {aiNotes && <p className="text-muted-foreground mt-0.5">{aiNotes}</p>}
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">Confira e ajuste o mapeamento das colunas:</p>

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
                        {result.headers.filter(h => h && h.trim() !== "").map(h => (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {result.headers.slice(0, 8).map(h => (
                    <div key={h} className="truncate"><span className="font-mono">{h}:</span> {String(result.rawRows[0][h]).substring(0, 30)}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 flex-wrap">
              <Button variant="outline" onClick={reset}>Cancelar</Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={aiMapping}
                onClick={() => requestAiMapping(result.headers, result.rawRows).then(m => {
                  if (m) setMapping(m);
                })}
              >
                <RefreshCw className={cn("w-3.5 h-3.5", aiMapping && "animate-spin")} />
                Remapear com IA
              </Button>
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

export default Importar;

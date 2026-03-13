import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppAlertBanner } from "@/components/WhatsAppAlertBanner";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Search, ArrowUpRight } from "lucide-react";
import { TransactionGroupedList } from "@/components/TransactionGroupedList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SummaryBar } from "@/components/SummaryBar";
import { CurrencyInput } from "@/components/CurrencyInput";
import type { TransactionRow } from "@/lib/types";
import { useAutoCategory } from "@/hooks/useAutoCategory";
import { Sparkles } from "lucide-react";
import { usePreferences, CURRENCIES, type CurrencyCode } from "@/contexts/PreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Category keys mapped to translation keys for i18n display
const INCOME_CAT_KEYS = [
  { value: 'Salário', tKey: 'cat.income.salary' as const },
  { value: 'Freelance', tKey: 'cat.income.freelance' as const },
  { value: 'Vendas', tKey: 'cat.income.sales' as const },
  { value: 'Serviços', tKey: 'cat.income.services' as const },
  { value: 'Aluguel', tKey: 'cat.income.rent' as const },
  { value: 'Dividendos', tKey: 'cat.income.dividends' as const },
  { value: 'Outros', tKey: 'cat.income.other' as const },
];
const CATEGORIES = INCOME_CAT_KEYS.map(c => c.value);

const emptyForm = (defaultCurrency: CurrencyCode = 'BRL') => ({
  description: '', amount: '', category: CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
  status: 'paid' as 'paid' | 'pending',
  entry_type: 'single' as 'single' | 'installment' | 'recurring',
  installments: '2',
  frequency: 'monthly' as 'monthly' | 'yearly',
  recurring_months: '12',
  currency: defaultCurrency,
});

const Receitas: React.FC = () => {
  const { formatMoney: formatBRL, t, currency: defaultCurrency } = usePreferences();
  const { transactions, create, update, remove, totals } = useTransactions('income');
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm(defaultCurrency));
  const [amountCents, setAmountCents] = useState(0);
  const [userChangedCategory, setUserChangedCategory] = useState(false);

  const { suggesting } = useAutoCategory(
    showForm && !editingId && !userChangedCategory ? form.description : '',
    'income',
    (cat) => {
      if (CATEGORIES.includes(cat)) {
        setForm(prev => ({ ...prev, category: cat }));
      }
    },
  );

  const paidTotal = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(defaultCurrency));
    setAmountCents(0);
    setUserChangedCategory(false);
    setShowForm(true);
  };

  const openEdit = (t: TransactionRow) => {
    setEditingId(t.id);
    const formatted = formatBRL(t.amount).replace('R$\u00a0', 'R$ ');
    setForm({
      description: t.description,
      amount: formatted,
      category: t.category,
      date: t.date,
      status: t.status,
      entry_type: t.entry_type ?? 'single',
      installments: String(t.installments ?? 2),
      frequency: t.frequency ?? 'monthly',
      recurring_months: '12',
      currency: (t as any).currency || defaultCurrency,
    });
    setAmountCents(Math.round(t.amount * 100));
    setShowForm(true);
  };

  const handleSubmit = () => {
    const amount = amountCents / 100;
    if (!form.description || !amount) return;

    const payload = {
      type: 'income' as const,
      amount,
      description: form.description,
      category: form.category,
      date: form.date,
      status: form.status,
      entry_type: form.entry_type,
      account_type: account.type,
      currency: form.currency,
      ...(form.entry_type === 'installment' ? { installments: parseInt(form.installments) || 2 } : {}),
      ...(form.entry_type === 'recurring' ? { frequency: form.frequency, recurring_months: parseInt(form.recurring_months) || 12 } : {}),
    };

    if (editingId) {
      update(editingId, payload);
    } else {
      create(payload);
    }

    setForm(emptyForm(defaultCurrency));
    setAmountCents(0);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-fin-income" /> {t("income.title")}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">{t("income.subtitle")}</p>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> {t("income.new")}
          </Button>
        </div>

        <WhatsAppAlertBanner />

        <SummaryBar items={[
          { label: t("income.total"), value: formatBRL(totals.income), color: "income", icon: ArrowUpRight },
          { label: t("income.received"), value: formatBRL(paidTotal), color: "income" },
          { label: t("common.pending"), value: formatBRL(pendingTotal), color: "pending" },
        ]} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("income.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </div>

        <TransactionGroupedList
          transactions={filtered}
          type="income"
          onEdit={openEdit}
          onRemove={remove}
          onToggleStatus={(id, status) => update(id, { status })}
        />
      </div>

      <Dialog open={showForm} onOpenChange={v => { if (!v) { setEditingId(null); } setShowForm(v); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? t("income.editTitle") : t("income.new")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.description")}</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("income.descPlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.amount")}</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} />
                </div>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as CurrencyCode })}>
                  <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.category")}</label>
                {suggesting && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                {!editingId && !userChangedCategory && form.description.length >= 3 && (
                  <span className="text-[10px] text-primary/70 italic">IA</span>
                )}
              </div>
              <select value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); setUserChangedCategory(true); }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {INCOME_CAT_KEYS.map(c => <option key={c.value} value={c.value}>{t(c.tKey)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'paid' | 'pending' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="paid">{t("income.received")}</option>
                <option value="pending">{t("common.pending")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("income.entryType")}</label>
              <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value as 'single' | 'installment' | 'recurring' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="single">{t("income.singleEntry")}</option>
                <option value="installment">{t("income.contractEntry")}</option>
                <option value="recurring">{t("income.recurringEntry")}</option>
              </select>
            </div>
            {form.entry_type === 'installment' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("income.numEntries")}</label>
                <Input type="number" min="1" value={form.installments} onChange={e => setForm({ ...form, installments: e.target.value })} />
              </div>
            )}
            {form.entry_type === 'recurring' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("form.frequency")}</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="monthly">{t("form.monthly")}</option>
                    <option value="yearly">{t("form.yearly")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("income.duration")}</label>
                  <Input type="number" min="1" max="120" value={form.recurring_months} onChange={e => setForm({ ...form, recurring_months: e.target.value })} placeholder="Ex: 12" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t("income.autoLaunchNote").replace("{count}", form.recurring_months || "0")}
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.date")}</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">{editingId ? t("income.saveChanges") : t("income.saveNew")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Receitas;

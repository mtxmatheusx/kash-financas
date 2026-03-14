import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppConnectBanner } from "@/components/WhatsAppConnectBanner";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Search, ArrowDownRight, Percent, Sparkles } from "lucide-react";
import { TransactionGroupedList } from "@/components/TransactionGroupedList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SummaryBar } from "@/components/SummaryBar";
import { CurrencyInput } from "@/components/CurrencyInput";
import type { TransactionRow } from "@/lib/types";
import { useAutoCategory } from "@/hooks/useAutoCategory";
import { usePreferences, CURRENCIES, type CurrencyCode } from "@/contexts/PreferencesContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERSONAL_CAT_KEYS = [
  { value: 'Alimentação', tKey: 'cat.expense.food' as const },
  { value: 'Transporte', tKey: 'cat.expense.transport' as const },
  { value: 'Moradia', tKey: 'cat.expense.housing' as const },
  { value: 'Saúde', tKey: 'cat.expense.health' as const },
  { value: 'Lazer', tKey: 'cat.expense.leisure' as const },
  { value: 'Educação', tKey: 'cat.expense.education' as const },
  { value: 'Outros', tKey: 'cat.expense.other' as const },
];
const BUSINESS_CAT_KEYS = [
  { value: 'Fornecedores', tKey: 'cat.expense.suppliers' as const },
  { value: 'Impostos', tKey: 'cat.expense.taxes' as const },
  { value: 'Funcionários', tKey: 'cat.expense.employees' as const },
  { value: 'Marketing', tKey: 'cat.expense.marketing' as const },
  { value: 'Infraestrutura', tKey: 'cat.expense.infrastructure' as const },
  { value: 'Outros', tKey: 'cat.expense.other' as const },
];
const PERSONAL_CATS = PERSONAL_CAT_KEYS.map(c => c.value);
const BUSINESS_CATS = BUSINESS_CAT_KEYS.map(c => c.value);

const Despesas: React.FC = () => {
  const { formatMoney: formatBRL, t, currency: defaultCurrency } = usePreferences();
  const { transactions, create, update, remove, totals, allTransactions } = useTransactions('expense');
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const categories = account.type === 'personal' ? PERSONAL_CATS : BUSINESS_CATS;
  const categoryKeys = account.type === 'personal' ? PERSONAL_CAT_KEYS : BUSINESS_CAT_KEYS;

  const emptyForm = () => ({
    description: '', amount: '', category: categories[0],
    date: new Date().toISOString().slice(0, 10),
    status: 'paid' as 'paid' | 'pending',
    entry_type: 'single' as 'single' | 'installment' | 'recurring',
    installments: '2',
    frequency: 'monthly' as 'monthly' | 'yearly',
    is_percentage: false,
    percentage: '',
    recurring_months: '12',
    percentage_base: 'total' as 'total' | 'monthly',
    currency: defaultCurrency,
  });

  const [form, setForm] = useState(emptyForm());
  const [amountCents, setAmountCents] = useState(0);
  const [userChangedCategory, setUserChangedCategory] = useState(false);

  const { suggesting } = useAutoCategory(
    showForm && !editingId && !userChangedCategory ? form.description : '',
    'expense',
    (cat) => {
      const allCats = [...PERSONAL_CATS, ...BUSINESS_CATS];
      if (allCats.includes(cat)) {
        setForm(prev => ({ ...prev, category: cat }));
      }
    },
  );

  const paidTotal = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const monthlyIncome = useMemo(() => {
    const month = form.date?.slice(0, 7);
    if (!month) return 0;
    return allTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0);
  }, [allTransactions, form.date]);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
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
      is_percentage: t.is_percentage ?? false,
      percentage: t.percentage ? String(t.percentage) : '',
      recurring_months: '12',
      percentage_base: 'total',
      currency: (t as any).currency || defaultCurrency,
    });
    setAmountCents(Math.round(t.amount * 100));
    setShowForm(true);
  };

  const handleSubmit = () => {
    let amount: number;
    const pct = form.is_percentage ? parseFloat(form.percentage.replace(',', '.')) : 0;

    if (form.is_percentage) {
      if (!form.description || !pct || pct <= 0) return;
      if (form.percentage_base === 'monthly' && form.entry_type === 'recurring') {
        amount = 0;
      } else {
        const base = form.percentage_base === 'monthly' ? monthlyIncome : totals.income;
        amount = (base * pct) / 100;
      }
    } else {
      amount = amountCents / 100;
      if (!form.description || !amount) return;
    }

    const payload = {
      type: 'expense' as const,
      amount,
      description: form.description,
      category: form.category,
      date: form.date,
      status: form.status,
      entry_type: form.entry_type,
      account_type: account.type,
      currency: form.currency,
      is_percentage: form.is_percentage,
      percentage_base: form.percentage_base,
      ...(form.is_percentage ? { percentage: pct } : {}),
      ...(form.entry_type === 'installment' ? { installments: parseInt(form.installments) || 2 } : {}),
      ...(form.entry_type === 'recurring' ? { frequency: form.frequency, recurring_months: parseInt(form.recurring_months) || 12 } : {}),
    };

    if (editingId) {
      update(editingId, payload);
    } else {
      create(payload);
    }

    setForm(emptyForm());
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
              <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 text-fin-expense" /> {t("expense.title")}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">{t("expense.subtitle")}</p>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> {t("expense.new")}
          </Button>
        </div>

        <WhatsAppConnectBanner />

        <SummaryBar items={[
          { label: t("expense.total"), value: formatBRL(totals.expense), color: "expense", icon: ArrowDownRight },
          { label: t("expense.paidLabel"), value: formatBRL(paidTotal), color: "income" },
          { label: t("common.pending"), value: formatBRL(pendingTotal), color: "pending" },
        ]} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("expense.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </div>

        <TransactionGroupedList
          transactions={filtered}
          type="expense"
          onEdit={openEdit}
          onRemove={remove}
          onToggleStatus={(id, status) => update(id, { status })}
        />
      </div>

      <Dialog open={showForm} onOpenChange={v => { if (!v) { setEditingId(null); } setShowForm(v); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader><DialogTitle className="text-center text-lg font-bold">{editingId ? t("expense.editTitle") : t("expense.new")}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.description")}</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("expense.descPlaceholder")} className="rounded-xl h-12 mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.valueMode")}</label>
              <select value={form.is_percentage ? 'percentage' : 'fixed'} onChange={e => setForm({ ...form, is_percentage: e.target.value === 'percentage', amount: '', percentage: '' })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                <option value="fixed">{t("expense.fixedValue")}</option>
                <option value="percentage">{t("expense.revenuePercent")}</option>
              </select>
            </div>
            {form.is_percentage ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.calcBase")}</label>
                  <select value={form.percentage_base} onChange={e => setForm({ ...form, percentage_base: e.target.value as 'total' | 'monthly' })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                    <option value="total">{t("expense.totalRevenue")} ({formatBRL(totals.income)})</option>
                    <option value="monthly">{t("expense.monthlyRevenue")} ({formatBRL(monthlyIncome)})</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.percentageLabel")}</label>
                  <div className="relative">
                    <Input value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="Ex: 10" inputMode="decimal" className="rounded-xl h-12 mt-1.5 pr-10" />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground mt-[3px]" />
                  </div>
                  {form.percentage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {(() => {
                        const base = form.percentage_base === 'monthly' ? monthlyIncome : totals.income;
                        const pct = parseFloat(form.percentage.replace(',', '.')) || 0;
                        return `= ${formatBRL((base * pct) / 100)} de ${formatBRL(base)}`;
                      })()}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("common.amount")}
                  {form.entry_type === 'installment' && (
                    <span className="ml-1 normal-case text-primary/70 font-normal">({t("income.installmentValueHint")})</span>
                  )}
                  {form.entry_type === 'recurring' && (
                    <span className="ml-1 normal-case text-primary/70 font-normal">({t("income.recurringValueHint")})</span>
                  )}
                </label>
                <div className="flex gap-2 mt-1.5">
                  <div className="flex-1">
                    <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} className="rounded-xl h-12" />
                  </div>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v as CurrencyCode })}>
                    <SelectTrigger className="w-[110px] rounded-xl h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {CURRENCIES.map(c => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.category")}</label>
                {suggesting && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                {!editingId && !userChangedCategory && form.description.length >= 3 && (
                  <span className="text-[10px] text-primary/70 italic">IA</span>
                )}
              </div>
              <select value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); setUserChangedCategory(true); }}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                {categoryKeys.map(c => <option key={c.value} value={c.value}>{t(c.tKey)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.status")}</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'paid' | 'pending' })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                <option value="paid">{t("expense.paidLabel")}</option>
                <option value="pending">{t("common.pending")}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.paymentType")}</label>
              <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value as 'single' | 'installment' | 'recurring' })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                <option value="single">{t("expense.singlePayment")}</option>
                <option value="installment">{t("expense.installmentPayment")}</option>
                <option value="recurring">{t("expense.recurringPayment")}</option>
              </select>
            </div>
            {form.entry_type === 'installment' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.numInstallments")}</label>
                <Input type="number" min="1" value={form.installments} onChange={e => setForm({ ...form, installments: e.target.value })} className="rounded-xl h-12 mt-1.5" />
              </div>
            )}
            {form.entry_type === 'recurring' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("form.frequency")}</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                    <option value="monthly">{t("form.monthly")}</option>
                    <option value="yearly">{t("form.yearly")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("expense.duration")}</label>
                  <Input type="number" min="1" max="120" value={form.recurring_months} onChange={e => setForm({ ...form, recurring_months: e.target.value })} placeholder="Ex: 12" className="rounded-xl h-12 mt-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t("expense.autoLaunchNote").replace("{count}", form.recurring_months || "0")}
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.date")}</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="rounded-xl h-12 mt-1.5" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto rounded-xl h-12">{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto rounded-xl h-12">{editingId ? t("expense.saveChanges") : t("expense.saveNew")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Despesas;

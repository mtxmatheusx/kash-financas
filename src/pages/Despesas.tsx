import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { Plus, Search, ArrowDownRight } from "lucide-react";
import { TransactionGroupedList } from "@/components/TransactionGroupedList";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { SummaryBar } from "@/components/SummaryBar";
import { CurrencyInput } from "@/components/CurrencyInput";
import type { TransactionRow } from "@/lib/types";
import { usePreferences } from "@/contexts/PreferencesContext";

const CATEGORIES = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'];

const emptyForm = () => ({
  description: '', amount: '', category: CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
});

const Despesas: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const { transactions, create, update, remove, totals } = useTransactions('expense');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [amountCents, setAmountCents] = useState(0);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditingId(null); setForm(emptyForm()); setAmountCents(0); setShowForm(true); };

  const openEdit = (t: TransactionRow) => {
    setEditingId(t.id);
    setForm({ description: t.description, amount: formatBRL(t.amount), category: t.category, date: t.date });
    setAmountCents(Math.round(t.amount * 100));
    setShowForm(true);
  };

  const handleSubmit = () => {
    const amount = amountCents / 100;
    if (!form.description || !amount) return;
    const payload = { type: 'expense' as const, amount, description: form.description, category: form.category, date: form.date, status: 'paid' as const, account_type: 'personal' as const };
    if (editingId) update(editingId, payload); else create(payload);
    setForm(emptyForm()); setAmountCents(0); setEditingId(null); setShowForm(false);
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

        <SummaryBar items={[
          { label: t("expense.total"), value: formatBRL(totals.expense), color: "expense", icon: ArrowDownRight },
        ]} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("expense.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </div>

        <TransactionGroupedList
          transactions={filtered} type="expense"
          onEdit={openEdit} onRemove={remove}
          onToggleStatus={(id, status) => update(id, { status })}
        />
      </div>

      <Dialog open={showForm} onOpenChange={v => { if (!v) setEditingId(null); setShowForm(v); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle className="text-center text-lg font-bold">{editingId ? t("expense.editTitle") : t("expense.new")}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.description")}</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t("expense.descPlaceholder")} className="rounded-xl h-12 mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.amount")}</label>
              <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} className="rounded-xl h-12 mt-1.5" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("common.category")}</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm mt-1.5 h-12">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
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

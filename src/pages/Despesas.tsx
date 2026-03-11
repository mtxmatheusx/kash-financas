import React, { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppAlertBanner } from "@/components/WhatsAppAlertBanner";
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
import { usePreferences } from "@/contexts/PreferencesContext";

const PERSONAL_CATS = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'];
const BUSINESS_CATS = ['Fornecedores', 'Impostos', 'Funcionários', 'Marketing', 'Infraestrutura', 'Outros'];

const Despesas: React.FC = () => {
  const { formatMoney: formatBRL } = usePreferences();
  const { transactions, create, update, remove, totals, allTransactions } = useTransactions('expense');
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const categories = account.type === 'personal' ? PERSONAL_CATS : BUSINESS_CATS;

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
    });
    setAmountCents(Math.round(t.amount * 100));
    setShowForm(true);
  };

  const handleSubmit = () => {
    let amount: number;
    const pct = form.is_percentage ? parseFloat(form.percentage.replace(',', '.')) : 0;

    if (form.is_percentage) {
      if (!form.description || !pct || pct <= 0) return;
      // For 'monthly' base with recurring, the hook calculates per-month amounts
      // For single or 'total' base, calculate here
      if (form.percentage_base === 'monthly' && form.entry_type === 'recurring') {
        amount = 0; // placeholder — hook will calculate per month
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
              <ArrowDownRight className="w-5 h-5 md:w-6 md:h-6 text-fin-expense" /> Despesas
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">Gestão de saídas</p>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Nova Despesa
          </Button>
        </div>

        <WhatsAppAlertBanner />

        <SummaryBar items={[
          { label: "Total", value: formatBRL(totals.expense), color: "expense", icon: ArrowDownRight },
          { label: "Pago", value: formatBRL(paidTotal), color: "income" },
          { label: "Pendente", value: formatBRL(pendingTotal), color: "pending" },
        ]} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar despesas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
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
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Aluguel" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modo de Valor</label>
              <select value={form.is_percentage ? 'percentage' : 'fixed'} onChange={e => setForm({ ...form, is_percentage: e.target.value === 'percentage', amount: '', percentage: '' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="fixed">Valor Fixo (R$)</option>
                <option value="percentage">% da Receita</option>
              </select>
            </div>
            {form.is_percentage ? (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Base de cálculo</label>
                  <select value={form.percentage_base} onChange={e => setForm({ ...form, percentage_base: e.target.value as 'total' | 'monthly' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="total">Receita Total ({formatBRL(totals.income)})</option>
                    <option value="monthly">Receita do Mês ({formatBRL(monthlyIncome)})</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Porcentagem (%)</label>
                  <div className="relative">
                    <Input value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="Ex: 10" inputMode="decimal" className="pr-10" />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</label>
                <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} />
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</label>
                {suggesting && <Sparkles className="w-3 h-3 text-primary animate-pulse" />}
                {!editingId && !userChangedCategory && form.description.length >= 3 && (
                  <span className="text-[10px] text-primary/70 italic">IA</span>
                )}
              </div>
              <select value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); setUserChangedCategory(true); }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'paid' | 'pending' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="paid">Pago</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Pagamento</label>
              <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value as 'single' | 'installment' | 'recurring' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="single">Pagamento Único</option>
                <option value="installment">Parcelado</option>
                <option value="recurring">Recorrente</option>
              </select>
            </div>
            {form.entry_type === 'installment' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nº de Parcelas</label>
                <Input type="number" min="1" value={form.installments} onChange={e => setForm({ ...form, installments: e.target.value })} />
              </div>
            )}
            {form.entry_type === 'recurring' && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequência</label>
                  <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Duração (meses)</label>
                  <Input type="number" min="1" max="120" value={form.recurring_months} onChange={e => setForm({ ...form, recurring_months: e.target.value })} placeholder="Ex: 12" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Serão criados {form.recurring_months || 0} lançamentos automáticos a partir da data selecionada
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">{editingId ? 'Salvar Alterações' : 'Salvar Despesa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Despesas;

import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppAlertBanner } from "@/components/WhatsAppAlertBanner";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Search, Trash2, ArrowDownRight, Percent, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/CurrencyInput";
import type { TransactionRow } from "@/lib/types";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PERSONAL_CATS = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação', 'Outros'];
const BUSINESS_CATS = ['Fornecedores', 'Impostos', 'Funcionários', 'Marketing', 'Infraestrutura', 'Outros'];

const Despesas: React.FC = () => {
  const { transactions, create, update, remove, totals } = useTransactions('expense');
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
  });

  const [form, setForm] = useState(emptyForm());
  const [amountCents, setAmountCents] = useState(0);

  const paidTotal = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setAmountCents(0);
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
    });
    setAmountCents(Math.round(t.amount * 100));
    setShowForm(true);
  };

  const handleSubmit = () => {
    let amount: number;
    if (form.is_percentage) {
      const pct = parseFloat(form.percentage.replace(',', '.'));
      if (!form.description || !pct || pct <= 0) return;
      amount = (totals.income * pct) / 100;
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
      ...(form.is_percentage ? { percentage: parseFloat(form.percentage.replace(',', '.')) } : {}),
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

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border-l-4 border-l-fin-expense border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-base md:text-xl font-bold text-foreground mt-1">{formatBRL(totals.expense)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-l-fin-expense/60 border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Pago</p>
            <p className="text-base md:text-xl font-bold text-fin-income mt-1">{formatBRL(paidTotal)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-l-fin-pending border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendente</p>
            <p className="text-base md:text-xl font-bold text-fin-pending mt-1">{formatBRL(pendingTotal)}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar despesas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center bg-muted/50 px-4 md:px-6 py-3 border-b border-border/50">
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</span>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:block">Categoria</span>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider text-center">Status</span>
            <span className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Valor</span>
            <span className="w-16" />
          </div>

          {filtered.length > 0 ? (
            <div>
              {filtered.map(t => (
                <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[2fr_1fr_1fr_auto_auto] items-center px-4 md:px-6 py-3.5 md:py-4 border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-colors duration-150 group">
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                      {t.is_percentage && t.percentage && ` · ${t.percentage}% da receita`}
                      {t.entry_type === 'recurring' && ` · Recorrente ${t.frequency === 'yearly' ? '(Anual)' : '(Mensal)'}`}
                      {t.entry_type === 'installment' && ` · ${t.installments}x parcelas`}
                      <span className="md:hidden"> · {t.category}</span>
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground hidden md:block">{t.category}</span>

                  <div className="flex justify-center px-2">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
                      t.status === 'paid'
                        ? "bg-fin-expense/10 text-fin-expense border border-fin-expense/20"
                        : "bg-fin-pending/10 text-fin-pending border border-fin-pending/20"
                    )}>
                      {t.status === 'paid' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>

                  <span className="font-mono-fin text-sm font-semibold text-fin-expense text-right pl-3 whitespace-nowrap">
                    − {formatBRL(t.amount)}
                  </span>

                  <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(t.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">
              {search ? 'Nenhuma despesa encontrada' : 'Nenhuma despesa registrada'}
            </p>
          )}
        </div>
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
                <option value="percentage">% da Receita Total</option>
              </select>
            </div>
            {form.is_percentage ? (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Porcentagem (%)</label>
                <div className="relative">
                  <Input value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} placeholder="Ex: 10" inputMode="decimal" className="pr-10" />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {form.percentage && totals.income > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    = {formatBRL((totals.income * (parseFloat(form.percentage.replace(',', '.')) || 0)) / 100)} de {formatBRL(totals.income)}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</label>
                <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
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
                  <select value={form.recurring_months} onChange={e => setForm({ ...form, recurring_months: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses (1 ano)</option>
                    <option value="24">24 meses (2 anos)</option>
                    <option value="36">36 meses (3 anos)</option>
                  </select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Serão criados {form.recurring_months} lançamentos automáticos a partir da data selecionada
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

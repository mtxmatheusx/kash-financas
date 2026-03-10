import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { WhatsAppAlertBanner } from "@/components/WhatsAppAlertBanner";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Search, Trash2, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CurrencyInput } from "@/components/CurrencyInput";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CATEGORIES = ['Salário', 'Freelance', 'Vendas', 'Serviços', 'Aluguel', 'Dividendos', 'Outros'];

const Receitas: React.FC = () => {
  const { transactions, create, remove, totals } = useTransactions('income');
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: '', amount: '', category: CATEGORIES[0],
    date: new Date().toISOString().slice(0, 10),
    status: 'paid' as 'paid' | 'pending',
    entry_type: 'single' as 'single' | 'installment' | 'recurring',
    installments: '2',
    frequency: 'monthly' as 'monthly' | 'yearly',
  });
  const [amountCents, setAmountCents] = useState(0);

  const paidTotal = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const pendingTotal = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0);

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    const amount = amountCents / 100;
    if (!form.description || !amount) return;
    create({
      type: 'income', amount, description: form.description,
      category: form.category, date: form.date, status: form.status,
      entry_type: form.entry_type, account_type: account.type,
      ...(form.entry_type === 'installment' ? { installments: parseInt(form.installments) || 2 } : {}),
      ...(form.entry_type === 'recurring' ? { frequency: form.frequency } : {}),
    });
    setForm({ description: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().slice(0, 10), status: 'paid', entry_type: 'single', installments: '2', frequency: 'monthly' });
    setAmountCents(0);
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-fin-income" /> Receitas
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">Gestão de entradas</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Nova Receita
          </Button>
        </div>

        <WhatsAppAlertBanner />
          <div className="rounded-xl border-l-4 border-l-fin-income border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-base md:text-xl font-bold text-foreground mt-1">{formatBRL(totals.income)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-l-fin-income/60 border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Recebido</p>
            <p className="text-base md:text-xl font-bold text-fin-income mt-1">{formatBRL(paidTotal)}</p>
          </div>
          <div className="rounded-xl border-l-4 border-l-fin-pending border border-border bg-card p-3 md:p-4">
            <p className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendente</p>
            <p className="text-base md:text-xl font-bold text-fin-pending mt-1">{formatBRL(pendingTotal)}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar receitas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </div>

        <div className="rounded-xl border border-border bg-card enterprise-shadow overflow-hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map(t => (
                <div key={t.id} className="p-3 md:p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="w-2 h-2 rounded-full bg-fin-income mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-card-foreground truncate">{t.description}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}
                          {t.entry_type === 'recurring' && ` · Recorrente ${t.frequency === 'yearly' ? '(Anual)' : '(Mensal)'}`}
                          {t.entry_type === 'installment' && ` · Contrato ${t.installments} meses`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-fin-expense transition-colors shrink-0 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 ml-[18px]">
                    <Badge variant="outline" className={cn("text-[10px] h-5", t.status === 'paid' ? "border-fin-income/30 text-fin-income" : "border-fin-pending/30 text-fin-pending")}>
                      {t.status === 'paid' ? 'Recebido' : 'Pendente'}
                    </Badge>
                    <span className="font-mono-fin text-sm font-semibold text-fin-income">+ {formatBRL(t.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              {search ? 'Nenhuma receita encontrada' : 'Nenhuma receita registrada'}
            </p>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>Nova Receita</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Salário mensal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</label>
              <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'paid' | 'pending' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="paid">Recebido</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo de Entrada</label>
              <select value={form.entry_type} onChange={e => setForm({ ...form, entry_type: e.target.value as 'single' | 'installment' | 'recurring' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="single">Entrada Única</option>
                <option value="installment">Contrato / Prazo Fixo</option>
                <option value="recurring">Recorrente</option>
              </select>
            </div>
            {form.entry_type === 'installment' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nº de Entradas (meses)</label>
                <Input type="number" min="1" value={form.installments} onChange={e => setForm({ ...form, installments: e.target.value })} />
              </div>
            )}
            {form.entry_type === 'recurring' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Frequência</label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value as 'monthly' | 'yearly' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">Salvar Receita</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Receitas;

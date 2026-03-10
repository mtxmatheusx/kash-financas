import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useInvestments } from "@/hooks/useInvestments";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Trash2, PieChart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const TYPES = ['Renda Fixa', 'Renda Variável', 'Fundos', 'Cripto', 'Imóveis', 'Outros'];

const Investimentos: React.FC = () => {
  const { investments, create, remove, total } = useInvestments();
  const { account } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: TYPES[0], amount: '', current_value: '', date: new Date().toISOString().slice(0, 10) });

  const handleSubmit = () => {
    const amount = parseFloat(form.amount.replace(',', '.'));
    const current = parseFloat(form.current_value.replace(',', '.')) || amount;
    if (!form.name || !amount) return;
    create({ name: form.name, type: form.type, amount, current_value: current, date: form.date, account_type: account.type });
    setForm({ name: '', type: TYPES[0], amount: '', current_value: '', date: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-4 md:space-y-6">
        {/* Header - stacked on mobile */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <PieChart className="w-5 h-5 md:w-6 md:h-6 text-fin-investment" /> Investimentos
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">Total investido: {formatBRL(total)}</p>
          </div>
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Novo Investimento
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {investments.map(inv => {
            const gain = inv.current_value - inv.amount;
            const gainPct = inv.amount > 0 ? ((gain / inv.amount) * 100).toFixed(1) : '0';
            return (
              <div key={inv.id} className="rounded-xl border border-border bg-card p-4 md:p-5 enterprise-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-card-foreground truncate">{inv.name}</p>
                    <p className="text-[11px] text-muted-foreground">{inv.type}</p>
                  </div>
                  <button onClick={() => remove(inv.id)} className="text-muted-foreground hover:text-fin-expense p-1 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-bold font-mono-fin text-card-foreground">{formatBRL(inv.current_value)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-muted-foreground">Investido: {formatBRL(inv.amount)}</span>
                  <span className={`text-xs font-semibold ${gain >= 0 ? 'text-fin-income' : 'text-fin-expense'}`}>
                    {gain >= 0 ? '+' : ''}{gainPct}%
                  </span>
                </div>
              </div>
            );
          })}
          {investments.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-12">Nenhum investimento registrado</p>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>Novo Investimento</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Tesouro Selic" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor investido</label>
              <Input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor atual</label>
              <Input value={form.current_value} onChange={e => setForm({ ...form, current_value: e.target.value })} placeholder="0,00" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Cancelar</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Investimentos;

import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Search, Trash2, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CATEGORIES = ['Salário', 'Freelance', 'Vendas', 'Serviços', 'Aluguel', 'Dividendos', 'Outros'];

const Receitas: React.FC = () => {
  const { transactions, create, remove, totals } = useTransactions('income');
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().slice(0, 10) });

  const filtered = transactions.filter(t =>
    t.description.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    const amount = parseFloat(form.amount.replace(',', '.'));
    if (!form.description || !amount) return;
    create({
      type: 'income', amount, description: form.description,
      category: form.category, date: form.date, status: 'paid',
      account_type: account.type,
    });
    setForm({ description: '', amount: '', category: CATEGORIES[0], date: new Date().toISOString().slice(0, 10) });
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowUpRight className="w-6 h-6 text-fin-income" /> Receitas
            </h1>
            <p className="text-sm text-muted-foreground">Total: {formatBRL(totals.income)}</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Receita
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar receitas..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-10" />
        </div>

        <div className="rounded-xl border border-border bg-card enterprise-shadow overflow-hidden">
          {filtered.length > 0 ? (
            <div className="divide-y divide-border">
              {filtered.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-fin-income" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{t.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {t.category} · {new Date(t.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-fin-income/30 text-fin-income text-xs">
                      {t.status === 'paid' ? 'Recebido' : 'Pendente'}
                    </Badge>
                    <span className="font-mono-fin text-sm font-semibold text-fin-income">
                      + {formatBRL(t.amount)}
                    </span>
                    <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-fin-expense transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Receita</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Descrição</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Salário mensal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</label>
              <Input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Categoria</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Receitas;

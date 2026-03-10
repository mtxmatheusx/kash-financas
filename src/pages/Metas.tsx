import React, { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useGoals } from "@/hooks/useGoals";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Trash2, Target } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const formatBRL = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const Metas: React.FC = () => {
  const { goals, create, update, remove } = useGoals();
  const { account } = useAccount();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '' });

  const handleSubmit = () => {
    const target = parseFloat(form.target_amount.replace(',', '.'));
    const current = parseFloat(form.current_amount.replace(',', '.')) || 0;
    if (!form.name || !target || !form.deadline) return;
    create({ name: form.name, target_amount: target, current_amount: current, deadline: form.deadline, account_type: account.type });
    setForm({ name: '', target_amount: '', current_amount: '', deadline: '' });
    setShowForm(false);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-fin-goals" /> Metas Financeiras
            </h1>
            <p className="text-sm text-muted-foreground">{goals.length} meta(s) ativa(s)</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nova Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(g => {
            const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
            return (
              <div key={g.id} className="rounded-xl border border-border bg-card p-5 enterprise-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">Prazo: {new Date(g.deadline).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-fin-expense">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{formatBRL(g.current_amount)}</span>
                    <span className="font-semibold text-card-foreground">{formatBRL(g.target_amount)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{pct.toFixed(0)}% concluído</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Adicionar valor"
                    inputMode="decimal"
                    className="text-xs h-8"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value.replace(',', '.'));
                        if (val > 0) {
                          update(g.id, { current_amount: g.current_amount + val });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
          {goals.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground text-center py-12">Nenhuma meta registrada</p>
          )}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Meta</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome da meta</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Reserva de emergência" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor alvo</label>
              <Input value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} placeholder="0,00" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor atual</label>
              <Input value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })} placeholder="0,00" inputMode="decimal" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prazo</label>
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
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

export default Metas;

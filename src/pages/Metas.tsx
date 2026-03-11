import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, staggerItem, slideUp, fadeIn } from "@/components/PageTransition";
import { SummaryBar } from "@/components/SummaryBar";
import { useGoals } from "@/hooks/useGoals";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Trash2, Target, Search, Trophy, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/CurrencyInput";
import { usePreferences } from "@/contexts/PreferencesContext";
import { cn } from "@/lib/utils";

const Metas: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const { goals, create, update, remove } = useGoals();
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', deadline: '' });
  const [targetCents, setTargetCents] = useState(0);
  const [currentCents, setCurrentCents] = useState(0);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addValue, setAddValue] = useState('');
  const [addCents, setAddCents] = useState(0);

  const filtered = goals.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.target_amount, 0), [goals]);
  const totalCurrent = useMemo(() => goals.reduce((s, g) => s + g.current_amount, 0), [goals]);
  const overallPct = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100) : 0;
  const completedCount = goals.filter(g => g.current_amount >= g.target_amount).length;

  const handleSubmit = () => {
    const target = targetCents / 100;
    const current = currentCents / 100;
    if (!form.name || !target || !form.deadline) return;
    create({ name: form.name, target_amount: target, current_amount: current, deadline: form.deadline, account_type: account.type });
    setForm({ name: '', target_amount: '', current_amount: '', deadline: '' });
    setTargetCents(0); setCurrentCents(0); setShowForm(false);
  };

  const handleAddValue = (goalId: string, currentAmount: number) => {
    const val = addCents / 100;
    if (val > 0) {
      update(goalId, { current_amount: currentAmount + val });
      setAddValue(''); setAddCents(0); setAddingId(null);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-3 md:space-y-5">
        <motion.div {...fadeIn(0)} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fin-goals/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-fin-goals" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{t("goals.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("goals.subtitle")}</p>
            </div>
          </div>
          <Button onClick={() => { setForm({ name: '', target_amount: '', current_amount: '', deadline: '' }); setTargetCents(0); setCurrentCents(0); setShowForm(true); }} size="sm" className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> {t("goals.new")}
          </Button>
        </motion.div>

        <SummaryBar items={[
          { label: t("goals.activeGoals"), value: String(goals.length), color: "primary", icon: Target },
          { label: t("goals.overallProgress"), value: `${overallPct.toFixed(0)}%`, color: overallPct >= 80 ? "income" : overallPct >= 40 ? "pending" : "expense", icon: TrendingUp },
          { label: t("goals.completed"), value: String(completedCount), color: "income", icon: Trophy },
        ]} />

        <motion.div {...slideUp(0.1)} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("goals.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={staggerContainer} initial="initial" animate="animate">
          {filtered.map(g => {
            const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
            const isCompleted = pct >= 100;
            const daysLeft = Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
              <motion.div key={g.id} variants={staggerItem} whileHover={{ y: -2, transition: { duration: 0.15 } }}
                className={cn("rounded-xl border bg-card p-4 md:p-5 cockpit-glow", isCompleted ? "border-fin-income/30" : "border-border")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-card-foreground truncate">{g.name}</p>
                      {isCompleted && <Trophy className="w-3.5 h-3.5 text-fin-income shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className={cn("text-[10px]", daysLeft < 0 ? "text-fin-expense" : daysLeft < 30 ? "text-fin-pending" : "text-muted-foreground")}>
                        {daysLeft < 0 ? t("goals.daysLate").replace("{count}", String(Math.abs(daysLeft))) : t("goals.daysLeft").replace("{count}", String(daysLeft))}
                        {' · '}{new Date(g.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-fin-expense p-1 shrink-0 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold font-mono-fin text-card-foreground tracking-tight">{formatBRL(g.current_amount)}</span>
                    <span className="text-xs font-mono-fin text-muted-foreground">{formatBRL(g.target_amount)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <p className={cn("text-[10px] text-right font-semibold", isCompleted ? "text-fin-income" : "text-muted-foreground")}>
                    {t("goals.percentComplete").replace("{pct}", pct.toFixed(0))}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-border/50">
                  {addingId === g.id ? (
                    <div className="flex gap-2">
                      <CurrencyInput value={addValue} onValueChange={(formatted, cents) => { setAddValue(formatted); setAddCents(cents); }} className="text-xs h-8 flex-1" />
                      <Button size="sm" className="h-8 text-xs px-3" onClick={() => handleAddValue(g.id, g.current_amount)}>{t("common.add")}</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-xs px-2" onClick={() => { setAddingId(null); setAddValue(''); setAddCents(0); }}>✕</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1.5" onClick={() => setAddingId(g.id)}>
                      <Plus className="w-3 h-3" /> {t("goals.addValue")}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <motion.div {...fadeIn(0.2)} className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
              <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t("goals.noGoals")}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{t("goals.noGoalsHint")}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("goals.new")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("goals.goalName")}</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("goals.goalNamePlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("goals.target")}</label>
              <CurrencyInput value={form.target_amount} onValueChange={(formatted, cents) => { setForm({ ...form, target_amount: formatted }); setTargetCents(cents); }} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("goals.current")}</label>
              <CurrencyInput value={form.current_amount} onValueChange={(formatted, cents) => { setForm({ ...form, current_amount: formatted }); setCurrentCents(cents); }} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("goals.deadline")}</label>
              <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">{t("goals.saveGoal")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Metas;

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, PiggyBank, Lightbulb, X, MessageSquare, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { toast } from "sonner";
import type { GoalRow } from "@/lib/types";
import type { TransactionRow } from "@/lib/types";

interface Insight {
  type: string;
  title: string;
  description: string;
  icon: string;
  severity: "info" | "warning" | "success" | "alert";
}

interface UserPreference {
  id: string;
  preference: string;
  category: string | null;
  created_at: string;
}

interface FinancialInsightsProps {
  transactions: TransactionRow[];
  investments?: { total: number };
  goals?: GoalRow[];
}

const severityStyles: Record<string, string> = {
  info: "border-primary/30 bg-primary/5",
  warning: "border-fin-pending/30 bg-fin-pending/5",
  success: "border-fin-income/30 bg-fin-income/5",
  alert: "border-fin-expense/30 bg-fin-expense/5",
};

const severityIcon: Record<string, React.ReactNode> = {
  info: <Lightbulb className="w-4 h-4 text-primary" />,
  warning: <TrendingDown className="w-4 h-4 text-fin-pending" />,
  success: <TrendingUp className="w-4 h-4 text-fin-income" />,
  alert: <PiggyBank className="w-4 h-4 text-fin-expense" />,
};

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  investments,
  goals,
}) => {
  const { user } = useAuth();
  const { t, language } = usePreferences();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [feedbackInsight, setFeedbackInsight] = useState<Insight | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showPrefs, setShowPrefs] = useState(false);

  const QUICK_REASONS = [
    t("insights.reason1"),
    t("insights.reason2"),
    t("insights.reason3"),
    t("insights.reason4"),
  ];

  const fetchPreferences = useCallback(async () => {
    if (!user) return [];
    const { data } = await supabase
      .from("user_financial_preferences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const prefs = (data || []) as UserPreference[];
    setPreferences(prefs);
    return prefs;
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const fetchInsights = useCallback(async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    try {
      const prefs = await fetchPreferences();
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const recentTx = transactions
        .filter(t => new Date(t.date + "T12:00:00") >= threeMonthsAgo)
        .map(t => ({ type: t.type, amount: t.amount, category: t.category, date: t.date, status: t.status, description: t.description }));

      const { data, error } = await supabase.functions.invoke("financial-insights", {
        body: {
          transactions: recentTx,
          investments: investments ? { total: investments.total } : null,
          goals: goals?.map(g => ({ name: g.name, target_amount: g.target_amount, current_amount: g.current_amount, deadline: g.deadline })) || [],
          preferences: prefs.map(p => p.preference),
          language,
        },
      });
      if (!error && data?.insights?.length > 0) setInsights(data.insights);
    } catch (e) {
      console.error("Failed to fetch insights:", e);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, [transactions, investments, goals, fetchPreferences, language]);

  useEffect(() => {
    if (!hasLoaded && transactions.length > 0) fetchInsights();
  }, [transactions.length, hasLoaded, fetchInsights]);

  const handleDismiss = (insight: Insight) => {
    setFeedbackInsight(insight);
    setFeedbackText("");
  };

  const submitFeedback = async (reason: string) => {
    if (!user || !feedbackInsight) return;
    const preference = `Não sugira otimizar ou questionar "${feedbackInsight.title}". Motivo do usuário: ${reason}`;
    const { error } = await supabase.from("user_financial_preferences").insert({ user_id: user.id, preference, category: feedbackInsight.type });
    if (error) { toast.error("Erro ao salvar preferência"); return; }
    toast.success("Preferência salva!");
    setInsights(prev => prev.filter(i => i.title !== feedbackInsight.title));
    setFeedbackInsight(null);
    fetchPreferences();
  };

  const removePreference = async (id: string) => {
    await supabase.from("user_financial_preferences").delete().eq("id", id);
    setPreferences(prev => prev.filter(p => p.id !== id));
    toast.success(t("common.delete"));
  };

  if (transactions.length === 0) return null;

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4 cockpit-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              {t("insights.title")}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            {preferences.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowPrefs(!showPrefs)} className="h-7 px-2 text-xs gap-1.5">
                <MessageSquare className="w-3 h-3" />
                {preferences.length} {preferences.length === 1 ? t("insights.preference") : t("insights.preferences")}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={fetchInsights} disabled={loading} className="h-7 px-2 text-xs gap-1.5">
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {loading ? t("insights.refreshing") : t("insights.refresh")}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showPrefs && preferences.length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t("insights.yourPrefs")}</p>
                {preferences.map(p => (
                  <div key={p.id} className="flex items-start justify-between gap-2 text-xs">
                    <span className="text-muted-foreground leading-relaxed">{p.preference}</span>
                    <Button variant="ghost" size="sm" onClick={() => removePreference(p.id)} className="h-5 w-5 p-0 shrink-0 text-muted-foreground hover:text-fin-expense">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && insights.length === 0 ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">{t("insights.analyzing")}</span>
          </div>
        ) : insights.length > 0 ? (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
            <AnimatePresence>
              {insights.map((insight, i) => (
                <motion.div key={`${insight.type}-${i}`} variants={{ hidden: { opacity: 0, y: 12, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1 } }}
                  className={`group relative rounded-lg border p-3 transition-colors hover:bg-accent/30 ${severityStyles[insight.severity] || severityStyles.info}`}>
                  <button onClick={() => handleDismiss(insight)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted" title="Feedback">
                    <ThumbsDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                  <div className="flex items-start gap-2.5 pr-5">
                    <div className="mt-0.5 shrink-0"><span className="text-lg">{insight.icon}</span></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {severityIcon[insight.severity]}
                        <p className="text-sm font-semibold text-card-foreground truncate">{insight.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : hasLoaded ? (
          <p className="text-xs text-muted-foreground text-center py-4">{t("insights.addMore")}</p>
        ) : null}
      </div>

      <Dialog open={!!feedbackInsight} onOpenChange={v => { if (!v) setFeedbackInsight(null); }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">{t("insights.feedbackTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{t("insights.feedbackDesc")}</p>
            <div className="text-xs text-card-foreground bg-muted/50 rounded-lg p-2.5 border border-border">
              <span className="font-semibold">{feedbackInsight?.title}</span>: {feedbackInsight?.description}
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("insights.quickReasons")}</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REASONS.map(reason => (
                  <button key={reason} onClick={() => submitFeedback(reason)} className="text-xs px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-accent/50 transition-colors text-card-foreground">
                    {reason}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">{t("insights.writeReason")}</p>
              <Textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder={t("insights.writeReasonPlaceholder")} className="min-h-[60px] text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFeedbackInsight(null)}>{t("common.cancel")}</Button>
            <Button size="sm" onClick={() => submitFeedback(feedbackText)} disabled={!feedbackText.trim()}>{t("insights.savePref")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

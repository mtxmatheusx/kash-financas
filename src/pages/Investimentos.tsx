import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageTransition, staggerContainer, staggerItem, slideUp, fadeIn } from "@/components/PageTransition";
import { SummaryBar } from "@/components/SummaryBar";
import { useInvestments } from "@/hooks/useInvestments";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useAccount } from "@/contexts/AccountContext";
import { Plus, Trash2, PieChart, Search, TrendingUp, TrendingDown, Pencil, X, Check, Globe, FolderOpen, Percent } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CurrencyInput } from "@/components/CurrencyInput";
import { usePreferences } from "@/contexts/PreferencesContext";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const INVEST_TYPE_KEYS = [
  { value: 'Renda Fixa', tKey: 'cat.invest.fixedIncome' as const },
  { value: 'Renda Variável', tKey: 'cat.invest.variableIncome' as const },
  { value: 'Fundos', tKey: 'cat.invest.funds' as const },
  { value: 'Cripto', tKey: 'cat.invest.crypto' as const },
  { value: 'Imóveis', tKey: 'cat.invest.realEstate' as const },
  { value: 'Outros', tKey: 'cat.invest.other' as const },
];
const TYPES = INVEST_TYPE_KEYS.map(c => c.value);
const TYPE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--fin-income))',
  'hsl(var(--fin-investment))',
  'hsl(var(--fin-pending))',
  'hsl(var(--fin-expense))',
  'hsl(var(--muted-foreground))',
];

const COUNTRY_OPTIONS = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", currency: "BRL (R$)" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD ($)" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR (€)" },
  { code: "ES", name: "España", flag: "🇪🇸", currency: "EUR (€)" },
  { code: "MX", name: "México", flag: "🇲🇽", currency: "MXN ($)" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS ($)" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", currency: "COP ($)" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP (£)" },
  { code: "DE", name: "Deutschland", flag: "🇩🇪", currency: "EUR (€)" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR (€)" },
  { code: "JP", name: "日本", flag: "🇯🇵", currency: "JPY (¥)" },
  { code: "CL", name: "Chile", flag: "🇨🇱", currency: "CLP ($)" },
];

const STORAGE_KEY_COUNTRIES = "invest-selected-countries";

const PORTFOLIO_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--fin-income))',
  'hsl(var(--fin-investment))',
  'hsl(var(--fin-pending))',
  'hsl(var(--fin-expense))',
  'hsl(var(--fin-goals))',
  'hsl(var(--muted-foreground))',
];

const Investimentos: React.FC = () => {
  const { formatMoney: formatBRL, t } = usePreferences();
  const { investments, create, update, remove, total, loading } = useInvestments();
  const { portfolios, create: createPortfolio, remove: removePortfolio } = usePortfolios();
  const { account } = useAccount();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: TYPES[0], amount: '', date: new Date().toISOString().slice(0, 10), country: '', portfolio_id: '' });
  const [amountCents, setAmountCents] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editCents, setEditCents] = useState(0);

  // Portfolio form
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ name: '', description: '' });

  // Filter by portfolio
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('all');

  // Multi-country filter
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COUNTRIES);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showCountryFilter, setShowCountryFilter] = useState(false);

  const toggleCountry = (code: string) => {
    setSelectedCountries(prev => {
      const next = prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code];
      localStorage.setItem(STORAGE_KEY_COUNTRIES, JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = investments.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.type.toLowerCase().includes(search.toLowerCase())
    );
    if (selectedCountries.length > 0) {
      list = list.filter(i => i.country && selectedCountries.includes(i.country));
    }
    if (selectedPortfolio !== 'all') {
      if (selectedPortfolio === 'none') {
        list = list.filter(i => !i.portfolio_id);
      } else {
        list = list.filter(i => i.portfolio_id === selectedPortfolio);
      }
    }
    return list;
  }, [investments, search, selectedCountries, selectedPortfolio]);

  const totalInvested = useMemo(() => filtered.reduce((s, i) => s + i.amount, 0), [filtered]);
  const filteredTotal = useMemo(() => filtered.reduce((s, i) => s + i.current_value, 0), [filtered]);
  const totalGain = filteredTotal - totalInvested;
  const gainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100) : 0;

  // Pie data by type with percentages
  const pieData = useMemo(() => {
    const byType: Record<string, number> = {};
    filtered.forEach(i => { byType[i.type] = (byType[i.type] || 0) + i.current_value; });
    const total = Object.values(byType).reduce((s, v) => s + v, 0);
    return Object.entries(byType).map(([name, value]) => ({
      name,
      value,
      pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0.0',
    }));
  }, [filtered]);

  // Portfolio allocation data
  const portfolioAllocation = useMemo(() => {
    const totalValue = investments.reduce((s, i) => s + i.current_value, 0);
    const byPortfolio: Record<string, { name: string; value: number }> = {};

    // Group by portfolio
    investments.forEach(inv => {
      const pid = inv.portfolio_id || '__none__';
      const pName = portfolios.find(p => p.id === pid)?.name || t("investment.noPortfolio");
      if (!byPortfolio[pid]) byPortfolio[pid] = { name: pName, value: 0 };
      byPortfolio[pid].value += inv.current_value;
    });

    return Object.entries(byPortfolio).map(([id, { name, value }]) => ({
      id,
      name,
      value,
      pct: totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : '0.0',
    }));
  }, [investments, portfolios, t]);

  const handleSubmit = () => {
    const amount = amountCents / 100;
    if (!form.name || !amount) return;
    create({
      name: form.name, type: form.type, amount, current_value: amount,
      date: form.date, account_type: account.type,
      country: form.country || undefined,
      portfolio_id: form.portfolio_id || undefined,
    });
    setForm({ name: '', type: TYPES[0], amount: '', date: new Date().toISOString().slice(0, 10), country: '', portfolio_id: '' });
    setAmountCents(0);
    setShowForm(false);
  };

  const handleCreatePortfolio = () => {
    if (!portfolioForm.name.trim()) return;
    createPortfolio({
      name: portfolioForm.name.trim(),
      description: portfolioForm.description.trim(),
      account_type: account.type,
    });
    setPortfolioForm({ name: '', description: '' });
    setShowPortfolioForm(false);
  };

  const openCreate = () => {
    setForm({ name: '', type: TYPES[0], amount: '', date: new Date().toISOString().slice(0, 10), country: '', portfolio_id: '' });
    setAmountCents(0);
    setShowForm(true);
  };

  const startEdit = (inv: typeof investments[0]) => {
    setEditingId(inv.id);
    const cents = Math.round(inv.current_value * 100);
    setEditCents(cents);
    const digits = String(cents).padStart(3, '0');
    const intPart = digits.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
    const decPart = digits.slice(-2);
    setEditValue(`${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decPart}`);
  };

  const confirmEdit = (inv: typeof investments[0]) => {
    const newVal = editCents / 100;
    if (newVal > 0) update(inv.id, { current_value: newVal });
    setEditingId(null);
    setEditValue('');
    setEditCents(0);
  };

  const getCountryFlag = (code?: string) => COUNTRY_OPTIONS.find(c => c.code === code)?.flag;

  return (
    <PageTransition>
      <div className="space-y-3 md:space-y-5">
        <motion.div {...fadeIn(0)} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-fin-investment/10 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-fin-investment" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{t("investment.title")}</h1>
              <p className="text-xs text-muted-foreground">{t("investment.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setShowCountryFilter(!showCountryFilter)} className="gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {selectedCountries.length > 0
                ? `${selectedCountries.map(c => getCountryFlag(c)).join(' ')} (${selectedCountries.length})`
                : t("investment.allCountries")}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPortfolioForm(true)} className="gap-1.5">
              <FolderOpen className="w-3.5 h-3.5" /> {t("investment.newPortfolio")}
            </Button>
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> {t("investment.new")}
            </Button>
          </div>
        </motion.div>

        {/* Country filter chips */}
        {showCountryFilter && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t("investment.filterByCountry")}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {COUNTRY_OPTIONS.map(c => {
                const isSelected = selectedCountries.includes(c.code);
                return (
                  <button key={c.code} onClick={() => toggleCountry(c.code)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/30"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    )}>
                    <span className="text-lg">{c.flag}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.currency}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
            {selectedCountries.length > 0 && (
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => {
                setSelectedCountries([]);
                localStorage.setItem(STORAGE_KEY_COUNTRIES, '[]');
              }}>
                {t("investment.allCountries")}
              </Button>
            )}
          </motion.div>
        )}

        {/* Portfolio filter tabs */}
        {portfolios.length > 0 && (
          <motion.div {...fadeIn(0.05)} className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setSelectedPortfolio('all')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                selectedPortfolio === 'all'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}>
              {t("investment.allPortfolios")}
            </button>
            {portfolios.map(p => (
              <div key={p.id} className="flex items-center gap-0.5">
                <button onClick={() => setSelectedPortfolio(p.id)}
                  className={cn("px-3 py-1.5 rounded-l-lg text-xs font-medium border transition-all",
                    selectedPortfolio === p.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  )}>
                  <FolderOpen className="w-3 h-3 inline mr-1" />
                  {p.name}
                </button>
                <button onClick={() => removePortfolio(p.id)}
                  className="px-1.5 py-1.5 rounded-r-lg border border-l-0 border-border text-muted-foreground hover:text-fin-expense hover:bg-fin-expense/5 transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button onClick={() => setSelectedPortfolio('none')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                selectedPortfolio === 'none'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/50"
              )}>
              {t("investment.noPortfolio")}
            </button>
          </motion.div>
        )}

        <SummaryBar items={[
          { label: t("investment.totalInvested"), value: formatBRL(totalInvested), color: "investment", icon: PieChart },
          { label: t("investment.currentValue"), value: formatBRL(filteredTotal), color: "primary", icon: TrendingUp },
          { label: t("investment.yield"), value: `${gainPct >= 0 ? '+' : ''}${gainPct.toFixed(1)}%`, color: totalGain >= 0 ? "income" : "expense", icon: totalGain >= 0 ? TrendingUp : TrendingDown },
        ]} />

        <motion.div {...slideUp(0.1)} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t("investment.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-9 md:h-10" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Distribution chart + allocation */}
          <div className="lg:col-span-1 space-y-3">
            {pieData.length > 0 && (
              <motion.div {...slideUp(0.15)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  {t("investment.distribution")} <Percent className="w-3 h-3 inline ml-1" />
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsPie>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3} strokeWidth={0}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[TYPES.indexOf(pieData[i]?.name) % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl">
                          <p className="text-xs font-medium text-foreground">{d.name}</p>
                          <p className="text-xs font-mono-fin text-muted-foreground">{formatBRL(d.value)} ({d.pct}%)</p>
                        </div>
                      );
                    }} />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[TYPES.indexOf(d.name) % TYPE_COLORS.length] }} />
                        <span className="text-[10px] text-muted-foreground">{INVEST_TYPE_KEYS.find(k => k.value === d.name) ? t(INVEST_TYPE_KEYS.find(k => k.value === d.name)!.tKey) : d.name}</span>
                      </div>
                      <span className="text-[10px] font-mono-fin font-semibold text-foreground">{d.pct}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Portfolio allocation */}
            {portfolioAllocation.length > 1 && (
              <motion.div {...slideUp(0.2)} className="rounded-xl border border-border bg-card p-4 cockpit-glow">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  {t("investment.allocation")} — {t("investment.portfolios")}
                </h3>
                <div className="space-y-2">
                  {portfolioAllocation.map((pa, i) => (
                    <div key={pa.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground font-medium">{pa.name}</span>
                        <span className="text-[10px] font-mono-fin font-semibold text-foreground">{pa.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pa.pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: PORTFOLIO_COLORS[i % PORTFOLIO_COLORS.length] }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatBRL(pa.value)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <motion.div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${pieData.length > 0 || portfolioAllocation.length > 1 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            variants={staggerContainer} initial="initial" animate="animate"
          >
            {filtered.map(inv => {
              const gain = inv.current_value - inv.amount;
              const gPct = inv.amount > 0 ? ((gain / inv.amount) * 100).toFixed(1) : '0.0';
              const isEditing = editingId === inv.id;
              const countryInfo = COUNTRY_OPTIONS.find(c => c.code === inv.country);
              const portfolio = portfolios.find(p => p.id === inv.portfolio_id);
              return (
                <motion.div key={inv.id} variants={staggerItem}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  className="rounded-xl border border-border bg-card p-4 md:p-5 cockpit-glow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-card-foreground truncate">{inv.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <div className="w-1.5 h-1.5 rounded-full bg-fin-investment" style={{ boxShadow: '0 0 4px hsl(var(--fin-investment))' }} />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {INVEST_TYPE_KEYS.find(k => k.value === inv.type) ? t(INVEST_TYPE_KEYS.find(k => k.value === inv.type)!.tKey) : inv.type}
                        </p>
                        {countryInfo && (
                          <span className="text-[10px] text-muted-foreground ml-1">{countryInfo.flag} {countryInfo.currency}</span>
                        )}
                        {portfolio && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-md ml-1">
                            <FolderOpen className="w-2.5 h-2.5 inline mr-0.5" />{portfolio.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!isEditing && (
                        <button onClick={() => startEdit(inv)} className="text-muted-foreground hover:text-primary p-1 transition-colors" title={t("investment.updateValue")}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => remove(inv.id)} className="text-muted-foreground hover:text-fin-expense p-1 transition-colors" title={t("common.delete")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("investment.updateValue")}</label>
                      <div className="flex gap-1.5">
                        <CurrencyInput value={editValue} onValueChange={(formatted, cents) => { setEditValue(formatted); setEditCents(cents); }} className="text-sm h-8 flex-1" />
                        <Button size="sm" className="h-8 w-8 p-0" onClick={() => confirmEdit(inv)}><Check className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-bold font-mono-fin text-card-foreground tracking-tight">{formatBRL(inv.current_value)}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">{t("investment.invested")}: {formatBRL(inv.amount)}</span>
                        <span className={cn("text-xs font-bold font-mono-fin", gain >= 0 ? 'text-fin-income' : 'text-fin-expense')}>
                          {gain >= 0 ? '+' : ''}{gPct}%
                        </span>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <motion.div {...fadeIn(0.2)} className="col-span-full rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <PieChart className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t("investment.noInvestments")}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{t("investment.noInvestmentsHint")}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* New Investment Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader><DialogTitle>{t("investment.new")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.assetName")}</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t("investment.assetNamePlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.country")}</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">{t("investment.selectCountries")}</option>
                {COUNTRY_OPTIONS.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name} — {c.currency}</option>
                ))}
              </select>
            </div>
            {portfolios.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.portfolio")}</label>
                <select value={form.portfolio_id} onChange={e => setForm({ ...form, portfolio_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">{t("investment.noPortfolio")}</option>
                  {portfolios.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.type")}</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {INVEST_TYPE_KEYS.map(c => <option key={c.value} value={c.value}>{t(c.tKey)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.appliedAmount")}</label>
              <CurrencyInput value={form.amount} onValueChange={(formatted, cents) => { setForm({ ...form, amount: formatted }); setAmountCents(cents); }} />
              <p className="text-[10px] text-muted-foreground mt-1">{t("investment.appliedAmountHint")}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.applicationDate")}</label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">{t("common.cancel")}</Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">{t("investment.saveInvestment")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Portfolio Dialog */}
      <Dialog open={showPortfolioForm} onOpenChange={setShowPortfolioForm}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader><DialogTitle>{t("investment.newPortfolio")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.portfolioName")}</label>
              <Input value={portfolioForm.name} onChange={e => setPortfolioForm({ ...portfolioForm, name: e.target.value })} placeholder={t("investment.portfolioNamePlaceholder")} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t("investment.portfolioDescription")}</label>
              <Input value={portfolioForm.description} onChange={e => setPortfolioForm({ ...portfolioForm, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPortfolioForm(false)} className="w-full sm:w-auto">{t("common.cancel")}</Button>
            <Button onClick={handleCreatePortfolio} className="w-full sm:w-auto">{t("investment.savePortfolio")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default Investimentos;

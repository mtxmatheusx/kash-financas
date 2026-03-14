import React, { useState, useEffect, useCallback } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings, User, Building2, CreditCard, Save, Crown, ExternalLink,
  FileText, Landmark, Bell, Webhook, Smartphone, MapPin, Loader2, MessageCircle, QrCode, Bot,
  Globe, Coins,
} from "lucide-react";
import { ActiveDevices } from "@/components/ActiveDevices";
import { AmandaLinkSection } from "@/components/AmandaLinkSection";
import { WhatsAppSettingsPage } from "@/components/WhatsAppSettingsPage";
import { toast } from "sonner";
import { maskCPF, maskCNPJ, maskPhone, maskCEP, unmask } from "@/lib/masks";
import { usePreferences, CURRENCIES, LANGUAGES, type CurrencyCode, type LanguageCode } from "@/contexts/PreferencesContext";

interface UserSettings {
  full_name: string;
  phone: string;
  document_type: string;
  document_number: string;
  company_name: string;
  state_registration: string;
  city_registration: string;
  tax_regime: string;
  zip_code: string;
  address: string;
  address_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state: string;
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  pix_key: string;
  pix_key_type: string;
  notify_whatsapp: boolean;
  notify_email: boolean;
  notify_due_dates: boolean;
  notify_due_days_before: number;
  notification_time: string;
}

const defaultSettings: UserSettings = {
  full_name: "", phone: "",
  document_type: "cpf", document_number: "", company_name: "",
  state_registration: "", city_registration: "", tax_regime: "",
  zip_code: "", address: "", address_number: "", address_complement: "",
  neighborhood: "", city: "", state: "",
  bank_name: "", bank_agency: "", bank_account: "", pix_key: "", pix_key_type: "",
  notify_whatsapp: true, notify_email: true, notify_due_dates: true, notify_due_days_before: 3, notification_time: "08:00",
};

/* ── Extracted outside render to avoid re-creation on every keystroke ── */
const SettingsCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-border bg-card p-5 md:p-6 space-y-5 ${className}`}>{children}</div>
);

const SettingsField: React.FC<{ icon?: React.ElementType; label: string; hint?: string; children: React.ReactNode }> = ({
  icon: Icon, label, hint, children,
}) => (
  <div>
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      {Icon && <Icon className="w-3.5 h-3.5" />} {label}
    </label>
    {children}
    {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const Configuracoes: React.FC = () => {
  const { user, profile, isPremium, isTrialing, trialDaysLeft, subscriptionEnd } = useAuth();
  const { currency, setCurrency, language, setLanguage, t } = usePreferences();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);






  const handleSyncData = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
        body: { action: "sync" },
      });
      if (error) throw error;
      toast.success(data?.message || "Dados sincronizados com sucesso!");
    } catch {
      toast.error("Erro ao sincronizar. Tente novamente.");
    }
    setSaving(false);
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const d = data as any;
        setSettings((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(prev).map((k) => [k, d[k] ?? (prev as any)[k]])
          ),
        }));
      }
      setLoaded(true);
    })();
  }, [user]);

  const update = useCallback((key: keyof UserSettings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value })), []);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = { user_id: user.id, ...settings };
    const { error } = await supabase
      .from("user_settings")
      .upsert(payload as any, { onConflict: "user_id" });
    if (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    } else {
      toast.success("Configurações salvas!");
    }
    setSaving(false);
  };

  const fetchCep = useCallback(async (cep: string) => {
    const digits = unmask(cep);
    if (digits.length !== 8) return;
    setFetchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setSettings((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
        toast.success("Endereço preenchido automaticamente!");
      }
    } catch {
      // silently fail
    }
    setFetchingCep(false);
  }, []);

  if (!loaded) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
        </div>
      </PageTransition>
    );
  }

  const documentMask = settings.document_type === "cnpj" ? maskCNPJ : maskCPF;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 font-display-fin">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" /> {t("settings.title")}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {t("settings.subtitle")}
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-6 mb-5">
            <TabsTrigger value="profile" className="gap-1.5 text-xs">
              <User className="w-3.5 h-3.5 hidden sm:block" /> {t("settings.profile")}
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 hidden sm:block" /> {t("settings.company")}
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5 hidden sm:block" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 text-xs">
              <Webhook className="w-3.5 h-3.5 hidden sm:block" /> {t("settings.integrations")}
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs">
              <Bell className="w-3.5 h-3.5 hidden sm:block" /> {t("settings.alerts")}
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-1.5 text-xs">
              <Crown className="w-3.5 h-3.5 hidden sm:block" /> {t("settings.plan")}
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ Meu Perfil ═══════════ */}
          <TabsContent value="profile">
            <SettingsCard>
              <SettingsField icon={User} label={t("settings.fullName")}>
                <Input
                  value={settings.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder={t("settings.fullName")}
                  maxLength={120}
                />
              </SettingsField>

              <SettingsField icon={Smartphone} label={t("settings.phone")} hint={t("settings.phoneHint")}>
                <Input
                  value={settings.phone}
                  onChange={(e) => update("phone", maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  inputMode="tel"
                />
              </SettingsField>

              <div className="pt-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-1">{t("settings.email")}</p>
                <p className="text-sm font-medium text-foreground">{profile?.email || "—"}</p>
              </div>

              {/* Preferences */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> {t("settings.preferences")}
                </h3>

                <SettingsField icon={Coins} label={t("settings.currency")} hint={t("settings.currencyHint")}>
                  <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>

                <SettingsField icon={Globe} label={t("settings.language")} hint={t("settings.languageHint")}>
                  <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SettingsField>
              </div>
            </SettingsCard>
          </TabsContent>

          {/* ═══════════ Dados da Empresa ═══════════ */}
          <TabsContent value="company">
            <SettingsCard>
              <SettingsField icon={FileText} label={t("settings.docType")}>
                <Select value={settings.document_type} onValueChange={(v) => update("document_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF — Pessoa Física</SelectItem>
                    <SelectItem value="cnpj">CNPJ — Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </SettingsField>

              <SettingsField icon={FileText} label={settings.document_type === "cnpj" ? "CNPJ" : "CPF"}>
                <Input
                  value={settings.document_number}
                  onChange={(e) => update("document_number", documentMask(e.target.value))}
                  placeholder={settings.document_type === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                  maxLength={18}
                />
              </SettingsField>

              {settings.document_type === "cnpj" && (
                <>
                  <SettingsField icon={Building2} label={t("settings.companyName")}>
                    <Input value={settings.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder={t("settings.companyName")} maxLength={200} />
                  </SettingsField>
                  <div className="grid grid-cols-2 gap-3">
                    <SettingsField icon={FileText} label={t("settings.stateReg")}>
                      <Input value={settings.state_registration} onChange={(e) => update("state_registration", e.target.value)} placeholder="IE" maxLength={20} />
                    </SettingsField>
                    <SettingsField icon={FileText} label={t("settings.cityReg")}>
                      <Input value={settings.city_registration} onChange={(e) => update("city_registration", e.target.value)} placeholder="IM" maxLength={20} />
                    </SettingsField>
                  </div>
                  <SettingsField icon={FileText} label={t("settings.taxRegime")}>
                    <Select value={settings.tax_regime} onValueChange={(v) => update("tax_regime", v)}>
                      <SelectTrigger><SelectValue placeholder={t("common.search")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mei">MEI</SelectItem>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                </>
              )}

              {/* Endereço */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> {t("settings.address")}
                </h3>

                <SettingsField icon={MapPin} label={t("settings.zipCode")} hint={t("settings.zipHint")}>
                  <div className="relative">
                    <Input
                      value={settings.zip_code}
                      onChange={(e) => {
                        const masked = maskCEP(e.target.value);
                        update("zip_code", masked);
                        if (unmask(masked).length === 8) fetchCep(masked);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      inputMode="numeric"
                    />
                    {fetchingCep && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                  </div>
                </SettingsField>

                <SettingsField label={t("settings.street")}>
                  <Input value={settings.address} onChange={(e) => update("address", e.target.value)} placeholder={t("settings.street")} maxLength={200} />
                </SettingsField>

                <div className="grid grid-cols-2 gap-3">
                  <SettingsField label={t("settings.number")}>
                    <Input value={settings.address_number} onChange={(e) => update("address_number", e.target.value)} placeholder="Nº" maxLength={10} />
                  </SettingsField>
                  <SettingsField label={t("settings.complement")}>
                    <Input value={settings.address_complement} onChange={(e) => update("address_complement", e.target.value)} placeholder={t("settings.complement")} maxLength={100} />
                  </SettingsField>
                </div>

                <SettingsField label={t("settings.neighborhood")}>
                  <Input value={settings.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder={t("settings.neighborhood")} maxLength={100} />
                </SettingsField>

                <div className="grid grid-cols-2 gap-3">
                  <SettingsField label={t("settings.city")}>
                    <Input value={settings.city} onChange={(e) => update("city", e.target.value)} placeholder={t("settings.city")} maxLength={100} />
                  </SettingsField>
                  <SettingsField label={t("settings.stateAbbr")}>
                    <Input value={settings.state} onChange={(e) => update("state", e.target.value)} placeholder={t("settings.stateAbbr")} maxLength={2} className="uppercase" />
                  </SettingsField>
                </div>
              </div>

              {/* Banking */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-primary" /> {t("settings.bankData")}
                </h3>

                <SettingsField icon={Landmark} label={t("settings.bank")}>
                  <Input value={settings.bank_name} onChange={(e) => update("bank_name", e.target.value)} placeholder={t("settings.bank")} maxLength={100} />
                </SettingsField>
                <div className="grid grid-cols-2 gap-3">
                  <SettingsField icon={Landmark} label={t("settings.agency")}>
                    <Input value={settings.bank_agency} onChange={(e) => update("bank_agency", e.target.value)} placeholder="0000" maxLength={10} />
                  </SettingsField>
                  <SettingsField icon={CreditCard} label={t("settings.account")}>
                    <Input value={settings.bank_account} onChange={(e) => update("bank_account", e.target.value)} placeholder="00000-0" maxLength={20} />
                  </SettingsField>
                </div>
                <SettingsField icon={Smartphone} label={t("settings.pixKeyType")}>
                  <Select value={settings.pix_key_type} onValueChange={(v) => update("pix_key_type", v)}>
                    <SelectTrigger><SelectValue placeholder={t("common.search")} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">{t("settings.phone")}</SelectItem>
                      <SelectItem value="random">{t("settings.pixKey")}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsField>
                <SettingsField icon={Smartphone} label={t("settings.pixKey")}>
                  <Input value={settings.pix_key} onChange={(e) => update("pix_key", e.target.value)} placeholder={t("settings.pixKey")} maxLength={100} />
                </SettingsField>
              </div>
            </SettingsCard>
          </TabsContent>

          {/* ═══════════ Integrações ═══════════ */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* Vincular Assistente Amanda */}
              <AmandaLinkSection userId={user?.id} />

              <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Webhook className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display-fin">{t("settings.automationCenter")}</h3>
                    <p className="text-sm text-muted-foreground">{t("settings.automationDesc")}</p>
                  </div>
                </div>
                <Button onClick={handleSyncData} disabled={saving} className="w-full gap-2 bg-primary hover:bg-destructive/80 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                  {t("settings.syncData")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ Notificações ═══════════ */}
          <TabsContent value="notifications">
            <SettingsCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.whatsappAlerts")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.whatsappAlertsDesc")}</p>
                </div>
                <Switch checked={settings.notify_whatsapp} onCheckedChange={(v) => update("notify_whatsapp", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.emailAlerts")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.emailAlertsDesc")}</p>
                </div>
                <Switch checked={settings.notify_email} onCheckedChange={(v) => update("notify_email", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t("settings.dueReminder")}</p>
                  <p className="text-xs text-muted-foreground">{t("settings.dueReminderDesc")}</p>
                </div>
                <Switch checked={settings.notify_due_dates} onCheckedChange={(v) => update("notify_due_dates", v)} />
              </div>
              {settings.notify_due_dates && (
                <SettingsField icon={Bell} label={t("settings.daysBefore")}>
                  <Select value={String(settings.notify_due_days_before)} onValueChange={(v) => update("notify_due_days_before", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 {t("settings.day")}</SelectItem>
                      <SelectItem value="2">2 {t("settings.days")}</SelectItem>
                      <SelectItem value="3">3 {t("settings.days")}</SelectItem>
                      <SelectItem value="5">5 {t("settings.days")}</SelectItem>
                      <SelectItem value="7">7 {t("settings.days")}</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingsField>
              )}

              <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground font-display-fin">{t("settings.aiAssistant")}</h3>
                    <p className="text-xs text-muted-foreground">{t("settings.aiAssistantDesc")}</p>
                  </div>
                </div>
                <Select
                  value={settings.notification_time}
                  onValueChange={async (v) => {
                    update("notification_time", v);
                    if (!user) return;
                    const { error } = await supabase
                      .from("user_settings")
                      .upsert({ user_id: user.id, notification_time: v } as any, { onConflict: "user_id" });
                    if (error) {
                      toast.error("Error");
                    } else {
                      toast.success("✨");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("settings.selectTime")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => {
                      const h = String(i + 7).padStart(2, "0");
                      return <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </SettingsCard>
          </TabsContent>

          {/* ═══════════ Assinatura ═══════════ */}
          <TabsContent value="subscription">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div
                className="p-6 md:p-8"
                style={{
                  background: isPremium
                    ? "linear-gradient(135deg, hsl(var(--primary) / 0.12) 0%, hsl(258 60% 52% / 0.10) 100%)"
                    : undefined,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/15">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display-fin">
                      {isPremium ? t("settings.premiumActive") : t("settings.freePlan")}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isTrialing && trialDaysLeft !== null
                        ? t("settings.trialDays").replace("{count}", String(trialDaysLeft))
                        : isPremium && subscriptionEnd
                          ? t("settings.renewsAt").replace("{date}", new Date(subscriptionEnd).toLocaleDateString())
                          : t("settings.basicFeatures")}
                    </p>
                  </div>
                </div>

                {isPremium && (
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {[t("settings.unlimitedReports"), t("settings.aiAgent"), t("settings.integrationsLabel")].map((f) => (
                      <div key={f} className="text-center py-2 px-1 rounded-lg bg-background/50 border border-border">
                        <p className="text-[11px] font-medium text-foreground">{f}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border">
                {isPremium ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => toast.info("Portal coming soon")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("settings.managePayments")}
                  </Button>
                ) : (
                  <Button className="w-full gap-2" onClick={() => window.location.href = "/upgrade"}>
                    <Crown className="w-4 h-4" />
                    {t("settings.upgradePremium")}
                  </Button>
                )}
              </div>
            </div>

            {/* Active Devices */}
            <div className="mt-6">
              <ActiveDevices />
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
          <Save className="w-4 h-4" />
          {saving ? t("common.saving") : t("settings.saveSettings")}
        </Button>
      </div>
    </PageTransition>
  );
};

export default Configuracoes;

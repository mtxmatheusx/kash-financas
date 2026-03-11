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
} from "lucide-react";
import { toast } from "sonner";
import { maskCPF, maskCNPJ, maskPhone, maskCEP, unmask } from "@/lib/masks";
import { usePreferences, CURRENCIES, LANGUAGES, type CurrencyCode, type LanguageCode } from "@/contexts/PreferencesContext";
import { Globe, Coins } from "lucide-react";

interface UserSettings {
  // Profile
  full_name: string;
  phone: string;
  // Fiscal
  document_type: string;
  document_number: string;
  company_name: string;
  state_registration: string;
  city_registration: string;
  tax_regime: string;
  // Address
  zip_code: string;
  address: string;
  address_number: string;
  address_complement: string;
  neighborhood: string;
  city: string;
  state: string;
  // Banking
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  pix_key: string;
  pix_key_type: string;
  // Notifications
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

const Configuracoes: React.FC = () => {
  const { user, profile, isPremium, isTrialing, trialDaysLeft, subscriptionEnd } = useAuth();
  const { currency, setCurrency, language, setLanguage } = usePreferences();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const handleGenerateQr = async () => {
    setQrLoading(true);
    setQrCodeImage(null);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
        body: { action: "generate_qr" },
      });
      if (error) throw error;
      if (data?.qrCode || data?.base64) {
        const img = data.qrCode || data.base64;
        setQrCodeImage(img.startsWith("data:") ? img : `data:image/png;base64,${img}`);
        toast.success("QR Code gerado! Escaneie com seu celular.");
      } else {
        toast.error("Não foi possível gerar o QR Code.");
      }
    } catch {
      toast.error("Erro ao gerar QR Code. Tente novamente.");
    }
    setQrLoading(false);
  };

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

  const update = (key: keyof UserSettings, value: any) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

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

  const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`rounded-xl border border-border bg-card p-5 md:p-6 space-y-5 ${className}`}>{children}</div>
  );

  const Field: React.FC<{ icon?: React.ElementType; label: string; hint?: string; children: React.ReactNode }> = ({
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

  const documentMask = settings.document_type === "cnpj" ? maskCNPJ : maskCPF;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2 font-display-fin">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Configurações
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Perfil, dados da empresa, integrações e assinatura
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-5">
            <TabsTrigger value="profile" className="gap-1.5 text-xs">
              <User className="w-3.5 h-3.5 hidden sm:block" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 hidden sm:block" /> Empresa
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 text-xs">
              <Webhook className="w-3.5 h-3.5 hidden sm:block" /> Integrações
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs">
              <Bell className="w-3.5 h-3.5 hidden sm:block" /> Alertas
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-1.5 text-xs">
              <Crown className="w-3.5 h-3.5 hidden sm:block" /> Plano
            </TabsTrigger>
          </TabsList>

          {/* ═══════════ Meu Perfil ═══════════ */}
          <TabsContent value="profile">
            <Card>
              <Field icon={User} label="Nome Completo">
                <Input
                  value={settings.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={120}
                />
              </Field>

              <Field icon={Smartphone} label="Telefone / WhatsApp" hint="Usado para notificações e agente IA">
                <Input
                  value={settings.phone}
                  onChange={(e) => update("phone", maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  inputMode="tel"
                />
              </Field>

              <div className="pt-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-1">E-mail da conta</p>
                <p className="text-sm font-medium text-foreground">{profile?.email || "—"}</p>
              </div>

              {/* Preferences */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-primary" /> Preferências
                </h3>

                <Field icon={Coins} label="Moeda" hint="Formato de exibição dos valores monetários">
                  <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field icon={Globe} label="Idioma" hint="Idioma da interface (em breve)">
                  <Select value={language} onValueChange={(v) => setLanguage(v as LanguageCode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.code} value={l.code}>{l.flag} {l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════ Dados da Empresa ═══════════ */}
          <TabsContent value="company">
            <Card>
              <Field icon={FileText} label="Tipo de Documento">
                <Select value={settings.document_type} onValueChange={(v) => update("document_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF — Pessoa Física</SelectItem>
                    <SelectItem value="cnpj">CNPJ — Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field icon={FileText} label={settings.document_type === "cnpj" ? "CNPJ" : "CPF"}>
                <Input
                  value={settings.document_number}
                  onChange={(e) => update("document_number", documentMask(e.target.value))}
                  placeholder={settings.document_type === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                  maxLength={18}
                />
              </Field>

              {settings.document_type === "cnpj" && (
                <>
                  <Field icon={Building2} label="Razão Social">
                    <Input value={settings.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Razão social" maxLength={200} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field icon={FileText} label="Inscrição Estadual">
                      <Input value={settings.state_registration} onChange={(e) => update("state_registration", e.target.value)} placeholder="IE" maxLength={20} />
                    </Field>
                    <Field icon={FileText} label="Inscrição Municipal">
                      <Input value={settings.city_registration} onChange={(e) => update("city_registration", e.target.value)} placeholder="IM" maxLength={20} />
                    </Field>
                  </div>
                  <Field icon={FileText} label="Regime Tributário">
                    <Select value={settings.tax_regime} onValueChange={(v) => update("tax_regime", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mei">MEI</SelectItem>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="real">Lucro Real</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}

              {/* Endereço */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" /> Endereço
                </h3>

                <Field icon={MapPin} label="CEP" hint="Digite o CEP para preencher automaticamente">
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
                </Field>

                <Field label="Logradouro">
                  <Input value={settings.address} onChange={(e) => update("address", e.target.value)} placeholder="Rua, Avenida..." maxLength={200} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Número">
                    <Input value={settings.address_number} onChange={(e) => update("address_number", e.target.value)} placeholder="Nº" maxLength={10} />
                  </Field>
                  <Field label="Complemento">
                    <Input value={settings.address_complement} onChange={(e) => update("address_complement", e.target.value)} placeholder="Sala, Andar..." maxLength={100} />
                  </Field>
                </div>

                <Field label="Bairro">
                  <Input value={settings.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Bairro" maxLength={100} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Cidade">
                    <Input value={settings.city} onChange={(e) => update("city", e.target.value)} placeholder="Cidade" maxLength={100} />
                  </Field>
                  <Field label="UF">
                    <Input value={settings.state} onChange={(e) => update("state", e.target.value)} placeholder="SP" maxLength={2} className="uppercase" />
                  </Field>
                </div>
              </div>

              {/* Banking */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-primary" /> Dados Bancários
                </h3>

                <Field icon={Landmark} label="Banco">
                  <Input value={settings.bank_name} onChange={(e) => update("bank_name", e.target.value)} placeholder="Ex: Nubank, Itaú" maxLength={100} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field icon={Landmark} label="Agência">
                    <Input value={settings.bank_agency} onChange={(e) => update("bank_agency", e.target.value)} placeholder="0000" maxLength={10} />
                  </Field>
                  <Field icon={CreditCard} label="Conta">
                    <Input value={settings.bank_account} onChange={(e) => update("bank_account", e.target.value)} placeholder="00000-0" maxLength={20} />
                  </Field>
                </div>
                <Field icon={Smartphone} label="Tipo da Chave PIX">
                  <Select value={settings.pix_key_type} onValueChange={(v) => update("pix_key_type", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="random">Chave aleatória</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field icon={Smartphone} label="Chave PIX">
                  <Input value={settings.pix_key} onChange={(e) => update("pix_key", e.target.value)} placeholder="Sua chave PIX" maxLength={100} />
                </Field>
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════ Integrações ═══════════ */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* Central de Automação */}
              <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Webhook className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground font-display-fin">Central de Automação</h3>
                    <p className="text-sm text-muted-foreground">
                      Sua conta já está conectada de forma segura aos nossos servidores.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSyncData}
                  disabled={saving}
                  className="w-full gap-2 bg-primary hover:bg-destructive/80 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Webhook className="w-4 h-4" />}
                  Sincronizar Dados
                </Button>
              </div>

              {/* WhatsApp QR Code Connection */}
              <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex p-3 rounded-2xl bg-fin-income/10 mb-2">
                    <MessageCircle className="w-8 h-8 text-fin-income" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-display-fin">
                    Conecte seu WhatsApp em 1 segundo
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Escaneie o QR Code abaixo com o seu celular para automatizar as cobranças usando o seu próprio número.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="w-64 h-64 rounded-xl bg-background border border-border flex items-center justify-center overflow-hidden p-2">
                    {qrLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs text-muted-foreground">Gerando QR Code...</p>
                      </div>
                    ) : qrCodeImage ? (
                      <img src={qrCodeImage} alt="QR Code WhatsApp" className="w-full h-full object-contain rounded-lg" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center px-4">
                        <QrCode className="w-12 h-12 text-muted-foreground/30" />
                        <p className="text-xs text-muted-foreground">
                          Clique no botão abaixo para gerar o QR Code
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    className="w-full gap-2 bg-fin-income/90 hover:bg-fin-income text-primary-foreground"
                    onClick={handleGenerateQr}
                    disabled={qrLoading}
                  >
                    {qrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    {qrCodeImage ? "Atualizar QR Code" : "Gerar QR Code de Conexão"}
                  </Button>
                  {qrCodeImage && (
                    <p className="text-[10px] text-muted-foreground text-center">
                      O QR Code expira em alguns minutos. Clique em "Atualizar" se necessário.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ Notificações ═══════════ */}
          <TabsContent value="notifications">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Receba notificações no WhatsApp</p>
                </div>
                <Switch checked={settings.notify_whatsapp} onCheckedChange={(v) => update("notify_whatsapp", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas via E-mail</p>
                  <p className="text-xs text-muted-foreground">Receba notificações por e-mail</p>
                </div>
                <Switch checked={settings.notify_email} onCheckedChange={(v) => update("notify_email", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Lembrete de vencimentos</p>
                  <p className="text-xs text-muted-foreground">Avise antes de contas vencerem</p>
                </div>
                <Switch checked={settings.notify_due_dates} onCheckedChange={(v) => update("notify_due_dates", v)} />
              </div>
              {settings.notify_due_dates && (
                <Field icon={Bell} label="Dias antes do vencimento">
                  <Select value={String(settings.notify_due_days_before)} onValueChange={(v) => update("notify_due_days_before", Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="2">2 dias</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {/* Assistente Financeiro de IA — autosave notification_time */}
              <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground font-display-fin">Assistente Financeiro de IA</h3>
                    <p className="text-xs text-muted-foreground">
                      A que horas você deseja receber seu resumo de caixa no WhatsApp?
                    </p>
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
                      toast.error("Erro ao atualizar horário.");
                    } else {
                      toast.success("Horário atualizado com sucesso ✨");
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => {
                      const h = String(i + 7).padStart(2, "0");
                      return <SelectItem key={h} value={`${h}:00`}>{`${h}:00`}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          {/* ═══════════ Assinatura ═══════════ */}
          <TabsContent value="subscription">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Status banner */}
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
                      {isPremium ? "Plano Premium Ativo" : "Plano Gratuito"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {isTrialing && trialDaysLeft !== null
                        ? `Período de teste — ${trialDaysLeft} dia${trialDaysLeft !== 1 ? "s" : ""} restante${trialDaysLeft !== 1 ? "s" : ""}`
                        : isPremium && subscriptionEnd
                          ? `Renova em ${new Date(subscriptionEnd).toLocaleDateString("pt-BR")}`
                          : "Recursos básicos disponíveis"}
                    </p>
                  </div>
                </div>

                {isPremium && (
                  <div className="grid grid-cols-3 gap-3 mt-5">
                    {["Relatórios ilimitados", "Agente IA", "Integrações"].map((f) => (
                      <div key={f} className="text-center py-2 px-1 rounded-lg bg-background/50 border border-border">
                        <p className="text-[11px] font-medium text-foreground">{f}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="p-6 border-t border-border">
                {isPremium ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => toast.info("Portal de pagamentos será integrado em breve!")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Gerenciar Pagamentos
                  </Button>
                ) : (
                  <Button
                    className="w-full gap-2"
                    onClick={() => window.location.href = "/upgrade"}
                  >
                    <Crown className="w-4 h-4" />
                    Fazer Upgrade para Premium
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save button (visible on all tabs except subscription) */}
        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </PageTransition>
  );
};

export default Configuracoes;

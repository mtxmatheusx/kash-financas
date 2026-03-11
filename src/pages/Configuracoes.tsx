import React, { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings, FileText, Landmark, Plug, Bell, Save, Building2, CreditCard, Webhook, Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface UserSettings {
  document_type: string;
  document_number: string;
  company_name: string;
  state_registration: string;
  city_registration: string;
  tax_regime: string;
  bank_name: string;
  bank_agency: string;
  bank_account: string;
  pix_key: string;
  pix_key_type: string;
  n8n_webhook_url: string;
  evolution_api_url: string;
  evolution_api_key: string;
  evolution_instance: string;
  notify_whatsapp: boolean;
  notify_email: boolean;
  notify_due_dates: boolean;
  notify_due_days_before: number;
}

const defaultSettings: UserSettings = {
  document_type: "cpf",
  document_number: "",
  company_name: "",
  state_registration: "",
  city_registration: "",
  tax_regime: "",
  bank_name: "",
  bank_agency: "",
  bank_account: "",
  pix_key: "",
  pix_key_type: "",
  n8n_webhook_url: "",
  evolution_api_url: "",
  evolution_api_key: "",
  evolution_instance: "",
  notify_whatsapp: true,
  notify_email: true,
  notify_due_dates: true,
  notify_due_days_before: 3,
};

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setSettings({
          document_type: data.document_type || "cpf",
          document_number: data.document_number || "",
          company_name: data.company_name || "",
          state_registration: data.state_registration || "",
          city_registration: data.city_registration || "",
          tax_regime: data.tax_regime || "",
          bank_name: data.bank_name || "",
          bank_agency: data.bank_agency || "",
          bank_account: data.bank_account || "",
          pix_key: data.pix_key || "",
          pix_key_type: data.pix_key_type || "",
          n8n_webhook_url: data.n8n_webhook_url || "",
          evolution_api_url: data.evolution_api_url || "",
          evolution_api_key: data.evolution_api_key || "",
          evolution_instance: data.evolution_instance || "",
          notify_whatsapp: data.notify_whatsapp ?? true,
          notify_email: data.notify_email ?? true,
          notify_due_dates: data.notify_due_dates ?? true,
          notify_due_days_before: data.notify_due_days_before ?? 3,
        });
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

  if (!loaded) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Carregando...</div>
      </PageTransition>
    );
  }

  const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">{children}</div>
  );

  const FieldLabel: React.FC<{ icon: React.ElementType; children: React.ReactNode }> = ({ icon: Icon, children }) => (
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      <Icon className="w-3.5 h-3.5" /> {children}
    </label>
  );

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" /> Configurações
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Gerencie dados fiscais, bancários, integrações e notificações
          </p>
        </div>

        <Tabs defaultValue="fiscal" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="fiscal" className="gap-1 text-xs">
              <FileText className="w-3.5 h-3.5 hidden sm:block" /> Fiscal
            </TabsTrigger>
            <TabsTrigger value="banking" className="gap-1 text-xs">
              <Landmark className="w-3.5 h-3.5 hidden sm:block" /> Bancário
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1 text-xs">
              <Plug className="w-3.5 h-3.5 hidden sm:block" /> Integrações
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 text-xs">
              <Bell className="w-3.5 h-3.5 hidden sm:block" /> Alertas
            </TabsTrigger>
          </TabsList>

          {/* Dados Fiscais */}
          <TabsContent value="fiscal">
            <SectionCard>
              <div>
                <FieldLabel icon={FileText}>Tipo de Documento</FieldLabel>
                <Select value={settings.document_type} onValueChange={(v) => update("document_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF (Pessoa Física)</SelectItem>
                    <SelectItem value="cnpj">CNPJ (Pessoa Jurídica)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel icon={FileText}>
                  {settings.document_type === "cnpj" ? "CNPJ" : "CPF"}
                </FieldLabel>
                <Input
                  value={settings.document_number}
                  onChange={(e) => update("document_number", e.target.value)}
                  placeholder={settings.document_type === "cnpj" ? "00.000.000/0000-00" : "000.000.000-00"}
                  maxLength={20}
                />
              </div>
              {settings.document_type === "cnpj" && (
                <>
                  <div>
                    <FieldLabel icon={Building2}>Razão Social</FieldLabel>
                    <Input
                      value={settings.company_name}
                      onChange={(e) => update("company_name", e.target.value)}
                      placeholder="Razão social da empresa"
                      maxLength={200}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel icon={FileText}>Inscrição Estadual</FieldLabel>
                      <Input
                        value={settings.state_registration}
                        onChange={(e) => update("state_registration", e.target.value)}
                        placeholder="IE"
                        maxLength={20}
                      />
                    </div>
                    <div>
                      <FieldLabel icon={FileText}>Inscrição Municipal</FieldLabel>
                      <Input
                        value={settings.city_registration}
                        onChange={(e) => update("city_registration", e.target.value)}
                        placeholder="IM"
                        maxLength={20}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel icon={FileText}>Regime Tributário</FieldLabel>
                    <Select value={settings.tax_regime} onValueChange={(v) => update("tax_regime", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples">Simples Nacional</SelectItem>
                        <SelectItem value="presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="real">Lucro Real</SelectItem>
                        <SelectItem value="mei">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </SectionCard>
          </TabsContent>

          {/* Dados Bancários */}
          <TabsContent value="banking">
            <SectionCard>
              <div>
                <FieldLabel icon={Landmark}>Banco</FieldLabel>
                <Input
                  value={settings.bank_name}
                  onChange={(e) => update("bank_name", e.target.value)}
                  placeholder="Ex: Nubank, Itaú, Bradesco"
                  maxLength={100}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel icon={Landmark}>Agência</FieldLabel>
                  <Input
                    value={settings.bank_agency}
                    onChange={(e) => update("bank_agency", e.target.value)}
                    placeholder="0000"
                    maxLength={10}
                  />
                </div>
                <div>
                  <FieldLabel icon={CreditCard}>Conta</FieldLabel>
                  <Input
                    value={settings.bank_account}
                    onChange={(e) => update("bank_account", e.target.value)}
                    placeholder="00000-0"
                    maxLength={20}
                  />
                </div>
              </div>
              <div>
                <FieldLabel icon={Smartphone}>Tipo da Chave PIX</FieldLabel>
                <Select value={settings.pix_key_type} onValueChange={(v) => update("pix_key_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel icon={Smartphone}>Chave PIX</FieldLabel>
                <Input
                  value={settings.pix_key}
                  onChange={(e) => update("pix_key", e.target.value)}
                  placeholder="Sua chave PIX"
                  maxLength={100}
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* Integrações */}
          <TabsContent value="integrations">
            <SectionCard>
              <p className="text-xs text-muted-foreground">
                Configure suas integrações externas. Os dados são salvos de forma segura.
              </p>

              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Webhook className="w-4 h-4 text-primary" /> N8N
                </h3>
                <div>
                  <FieldLabel icon={Webhook}>Webhook URL</FieldLabel>
                  <Input
                    value={settings.n8n_webhook_url}
                    onChange={(e) => update("n8n_webhook_url", e.target.value)}
                    placeholder="https://seu-n8n.com/webhook/..."
                    maxLength={500}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    URL do webhook N8N para automações
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-primary" /> Evolution API (WhatsApp)
                </h3>
                <div className="space-y-3">
                  <div>
                    <FieldLabel icon={Plug}>URL da API</FieldLabel>
                    <Input
                      value={settings.evolution_api_url}
                      onChange={(e) => update("evolution_api_url", e.target.value)}
                      placeholder="https://api.evolution.com"
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Plug}>API Key</FieldLabel>
                    <Input
                      type="password"
                      value={settings.evolution_api_key}
                      onChange={(e) => update("evolution_api_key", e.target.value)}
                      placeholder="Sua chave da Evolution API"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={Plug}>Nome da Instância</FieldLabel>
                    <Input
                      value={settings.evolution_instance}
                      onChange={(e) => update("evolution_instance", e.target.value)}
                      placeholder="Nome da instância WhatsApp"
                      maxLength={100}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* Notificações */}
          <TabsContent value="notifications">
            <SectionCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas via WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Receba notificações no WhatsApp</p>
                </div>
                <Switch
                  checked={settings.notify_whatsapp}
                  onCheckedChange={(v) => update("notify_whatsapp", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Alertas via E-mail</p>
                  <p className="text-xs text-muted-foreground">Receba notificações por e-mail</p>
                </div>
                <Switch
                  checked={settings.notify_email}
                  onCheckedChange={(v) => update("notify_email", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Lembrete de vencimentos</p>
                  <p className="text-xs text-muted-foreground">Avise antes de contas vencerem</p>
                </div>
                <Switch
                  checked={settings.notify_due_dates}
                  onCheckedChange={(v) => update("notify_due_dates", v)}
                />
              </div>

              {settings.notify_due_dates && (
                <div>
                  <FieldLabel icon={Bell}>Dias antes do vencimento</FieldLabel>
                  <Select
                    value={String(settings.notify_due_days_before)}
                    onValueChange={(v) => update("notify_due_days_before", Number(v))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="2">2 dias</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
          <Save className="w-4 h-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </PageTransition>
  );
};

export default Configuracoes;

import React, { useState } from "react";
import { MessageCircle, CheckCircle2, Smartphone, Zap, BarChart3, Clock, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
    <Icon className="w-5 h-5 text-primary mx-auto" />
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const StepCard: React.FC<{ step: number; title: string; desc: string }> = ({ step, title, desc }) => (
  <div className="flex gap-3 items-start">
    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
      {step}
    </div>
    <div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  </div>
);

export const WhatsAppSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrBase64, setQrBase64] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
        body: { action: "generate_qr" },
      });
      if (error) throw error;

      if (data?.base64) {
        setQrBase64(data.base64);
      } else if (data?.instance?.status === "open") {
        setConnected(true);
        toast.success("WhatsApp já está conectado!");
      }
    } catch (err) {
      console.error("QR generation failed:", err);
      toast.error("Erro ao gerar QR Code. Tente novamente.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#25D366]/10">
          <MessageCircle className="w-7 h-7 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display-fin">Assistente WhatsApp</h2>
          <p className="text-sm text-muted-foreground">Registre transações enviando mensagens pelo WhatsApp.</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Status da Conexão</h3>
          <Badge variant={connected ? "default" : "secondary"} className={connected ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : ""}>
            {connected ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" /> Conectado</>
            ) : (
              "Desconectado"
            )}
          </Badge>
        </div>

        {/* QR Code Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex justify-center">
            <div className="w-52 h-52 rounded-xl bg-background border border-border flex items-center justify-center p-3">
              {loading ? (
                <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
              ) : qrBase64 ? (
                <img src={qrBase64} alt="QR Code WhatsApp" className="w-full h-full object-contain" />
              ) : (
                <div className="text-sm text-muted-foreground text-center">
                  Clique em "Vincular" para gerar o QR Code
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <StepCard step={1} title="Gere o QR Code" desc="Clique no botão abaixo para gerar o código de conexão." />
            <StepCard step={2} title="Escaneie com WhatsApp" desc="Abra WhatsApp > Aparelhos conectados > Conectar aparelho." />
            <StepCard step={3} title="Comece a registrar" desc="Envie mensagens como 'Almoço R$35' ou 'Recebi salário R$5000'." />
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white"
            onClick={handleConnect}
            disabled={loading || !user?.id}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            {connected ? "Reconectar" : "Vincular WhatsApp"}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            A conexão é feita diretamente pelo nosso servidor seguro via Evolution API.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={MessageSquare} label="Mensagens" value="0" />
        <StatCard icon={BarChart3} label="Lançamentos" value="0" />
        <StatCard icon={Clock} label="Último registro" value="—" />
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Como funciona
        </h3>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary font-bold">→</span>
            <p><strong className="text-foreground">Despesa:</strong> "Almoço R$35" ou "Uber R$18,50 transporte"</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary font-bold">→</span>
            <p><strong className="text-foreground">Receita:</strong> "Recebi freelance R$2000" ou "Salário R$5500"</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary font-bold">→</span>
            <p><strong className="text-foreground">Consulta:</strong> "Quanto gastei esse mês?" ou "Resumo de hoje"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

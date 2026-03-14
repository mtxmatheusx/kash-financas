import React, { useState } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Smartphone,
  Zap,
  BarChart3,
  Clock,
  MessageSquare,
  Loader2,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "disconnected" | "loading" | "waiting" | "connected";

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-border bg-card p-4 text-center space-y-1">
    <Icon className="w-5 h-5 text-primary mx-auto" />
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const StepCard: React.FC<{ step: number; title: string; desc: string }> = ({
  step,
  title,
  desc,
}) => (
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
  const [status, setStatus] = useState<Status>("disconnected");
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const handleConnect = async () => {
    if (status === "connected") {
      setStatus("disconnected");
      setQrUrl(null);
      return;
    }

    setStatus("loading");

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-connect", {
        body: { action: "generate_qr" },
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast.error("Erro ao conectar ao WhatsApp. Tente novamente.");
        setStatus("disconnected");
        return;
      }

      const isConnected = Boolean(
        data?.connected ||
          data?.status === "open" ||
          data?.raw?.instance?.status === "open" ||
          data?.raw?.instance?.state === "open"
      );

      if (isConnected) {
        setStatus("connected");
        setQrUrl(null);
        toast.success("WhatsApp já está conectado!");
        return;
      }

      const qr = data?.base64 || data?.code;
      if (qr) {
        setQrUrl(qr);
        setStatus("waiting");
      } else {
        console.error("No QR code data received:", data);
        toast.error("Não foi possível gerar o QR Code. Verifique a configuração.");
        setStatus("disconnected");
      }
    } catch (err) {
      console.error("WhatsApp connection error:", err);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
      setStatus("disconnected");
    }
  };

  const statusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Conectado
          </Badge>
        );
      case "waiting":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">
            <QrCode className="w-3 h-3 mr-1" /> Aguardando
          </Badge>
        );
      case "loading":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Conectando...
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconectado</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#25D366]/10">
          <MessageCircle className="w-7 h-7 text-[#25D366]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground font-display-fin">
            Assistente WhatsApp
          </h2>
          <p className="text-sm text-muted-foreground">
            Registre transações enviando mensagens pelo WhatsApp.
          </p>
        </div>
      </div>

      {/* Connection Card */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Status da Conexão</h3>
          {statusBadge()}
        </div>

        {/* Connected state */}
        {status === "connected" && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-semibold text-foreground">WhatsApp conectado!</p>
              <p className="text-sm text-muted-foreground">
                Envie mensagens para registrar receitas e despesas.
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
          </div>
        )}

        {/* Disconnected state — show steps */}
        {status === "disconnected" && (
          <div className="space-y-4">
            <StepCard
              step={1}
              title="Gere o QR Code"
              desc="Clique no botão abaixo para gerar o código de conexão."
            />
            <StepCard
              step={2}
              title="Escaneie com WhatsApp"
              desc="Abra WhatsApp > Aparelhos conectados > Conectar aparelho."
            />
            <StepCard
              step={3}
              title="Comece a registrar"
              desc="Envie mensagens como 'Almoço R$35' ou 'Recebi salário R$5000'."
            />
          </div>
        )}

        {/* Waiting state — QR Code + instructions */}
        {status === "waiting" && qrUrl && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <div className="w-52 h-52 rounded-xl bg-background border border-border flex items-center justify-center p-3">
                <img
                  src={qrUrl}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // If even fallback fails, regenerate
                    const target = e.target as HTMLImageElement;
                    target.src = generateFallbackQr();
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <StepCard
                step={1}
                title="Abra o WhatsApp"
                desc="No seu celular, abra o aplicativo WhatsApp."
              />
              <StepCard
                step={2}
                title="Aparelhos conectados"
                desc="Vá em Configurações > Aparelhos conectados > Conectar aparelho."
              />
              <StepCard
                step={3}
                title="Escaneie o QR Code"
                desc="Aponte a câmera para o código ao lado e aguarde a conexão."
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1ebe5a] text-white"
            onClick={handleConnect}
            disabled={status === "loading" || !user?.id}
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            {status === "connected"
              ? "Reconectar"
              : status === "waiting"
              ? "Gerar novo QR Code"
              : "Vincular WhatsApp"}
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
            <p>
              <strong className="text-foreground">Despesa:</strong> "Almoço R$35" ou "Uber
              R$18,50 transporte"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary font-bold">→</span>
            <p>
              <strong className="text-foreground">Receita:</strong> "Recebi freelance R$2000"
              ou "Salário R$5500"
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-mono text-primary font-bold">→</span>
            <p>
              <strong className="text-foreground">Consulta:</strong> "Quanto gastei esse mês?"
              ou "Resumo de hoje"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

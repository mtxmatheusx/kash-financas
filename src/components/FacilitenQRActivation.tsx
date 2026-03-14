import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Moon, Smartphone, Send, CheckCircle2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WHATSAPP_NUMBER = "5511954223325";

const FacilitenQRActivation = () => {
  const [userName, setUserName] = useState("");
  const [qrCodeURL, setQRCodeURL] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      const message = `AtivarFaciliten: ${userName || "Novo Usuario"}`;
      const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      const qrDataURL = await QRCode.toDataURL(whatsappURL, {
        width: 280,
        margin: 2,
        color: { dark: "#059669", light: "#ffffff" },
      });

      setQRCodeURL(qrDataURL);
    };

    generateQR();
  }, [userName]);

  const activationMessage = `AtivarFaciliten: ${userName || "Novo Usuario"}`;

  return (
    <Card className="max-w-md mx-auto p-6 md:p-8 space-y-6 border-border bg-card">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 mx-auto">
          <Moon className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground font-display-fin">
          Ativar Faciliten 🌙
        </h2>
        <p className="text-sm text-muted-foreground">
          Sua assistente financeira Luna te espera!
        </p>
      </div>

      {/* Input Nome */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Seu Nome Completo
        </label>
        <Input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Digite seu nome"
        />
      </div>

      {/* QR Code */}
      {qrCodeURL && (
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-xl border border-border bg-white p-3">
            <img
              src={qrCodeURL}
              alt="QR Code Faciliten"
              className="w-56 h-56 object-contain"
            />
          </div>
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="w-3 h-3" />
            Escaneie para ativar
          </Badge>
        </div>
      )}

      {/* Instruções */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-500" />
          Como ativar
        </h3>
        <ol className="space-y-2 text-xs text-muted-foreground">
          {[
            "Escaneie o QR Code com seu celular",
            "WhatsApp abrirá automaticamente",
            'Toque em "Enviar" na mensagem',
            "Luna ativará seu perfil na hora!",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Preview Mensagem */}
      <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Send className="w-3 h-3" />
          Mensagem que será enviada:
        </p>
        <p className="text-sm font-mono text-foreground bg-background px-3 py-2 rounded-lg border border-border">
          {activationMessage}
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] text-muted-foreground">
        🌙 Luna • IA Consultora Financeira • 100% Seguro
      </p>
    </Card>
  );
};

export default FacilitenQRActivation;

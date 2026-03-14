import React, { useState } from "react";
import { MessageCircle, X, QrCode, CheckCircle2, Zap } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5511954223325";
const STORAGE_KEY = "whatsappConnectBannerHidden";

export const WhatsAppConnectBanner: React.FC = () => {
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");
  const [expanded, setExpanded] = useState(false);
  const [connected] = useState(false);

  if (hidden) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Conectar WhatsApp")}`;

  const handleClose = () => {
    setHidden(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <div className="relative w-full rounded-2xl border border-border overflow-hidden bg-gradient-to-r from-[hsl(220,70%,50%)] to-[hsl(270,60%,50%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />

      <div className="relative p-4 md:p-5">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Registre gastos por WhatsApp
            </h3>
            <p className="text-xs text-white/70 leading-relaxed mt-0.5">
              Envie mensagens para lançar receitas e despesas automaticamente.
            </p>
          </div>

          {/* Action */}
          {connected ? (
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-semibold text-emerald-200">Conectado</span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 gap-1.5 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl text-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              {expanded ? "Fechar" : "Conectar"}
            </Button>
          )}
        </div>

        {/* Expanded QR Code */}
        {expanded && !connected && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-36 h-36 rounded-xl bg-white p-2 shrink-0">
              <QRCodeSVG value={whatsappUrl} size={128} bgColor="white" fgColor="#1a1a2e" level="M" />
            </div>
            <div className="text-center sm:text-left space-y-2">
              <p className="text-xs text-white/80">
                Escaneie o QR Code ou clique abaixo para vincular seu WhatsApp.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5a] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Abrir no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Fechar"
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

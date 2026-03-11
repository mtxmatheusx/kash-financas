import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = "SEU_NUMERO";
const STORAGE_KEY = "whatsappAlertBannerHidden";

export const WhatsAppAlertBanner: React.FC = () => {
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

  if (hidden) return null;

  const handleClose = () => {
    setHidden(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card/80 backdrop-blur-md p-5 md:p-6 overflow-hidden">
      {/* Subtle green glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-fin-income/5 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Icon */}
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-fin-income/10 border border-fin-income/20 shrink-0">
          <MessageCircle className="w-5 h-5 text-fin-income" />
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm md:text-base font-bold text-foreground leading-tight">
            Disparo por Voz no WhatsApp
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Automatize seus registros — envie um áudio e a Faciliten lança receitas e despesas por você.
          </p>
        </div>

        {/* CTA */}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5a] shadow-lg shadow-[#25D366]/20 transition-all duration-200 whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4" />
          Ativar no WhatsApp
        </a>
      </div>

      {/* Close */}
      <button
        onClick={handleClose}
        aria-label="Fechar banner"
        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

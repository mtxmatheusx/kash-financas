import React from "react";
import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "SEU_NUMERO"; // ← Substitua pelo seu número com DDI (ex: 5511999999999)

export const WhatsAppAlertBanner: React.FC = () => (
  <div className="w-full flex items-center gap-3 rounded-lg border border-[hsl(145_90%_48%/0.3)] bg-[hsl(225_28%_7%/0.7)] backdrop-blur-md p-4">
    <MessageCircle className="w-5 h-5 shrink-0 text-fin-income" />
    <p className="flex-1 text-sm text-foreground/85 font-medium">
      <span className="font-semibold text-foreground">Dica:</span> É mais rápido registrar isso enviando um áudio para a Kash no WhatsApp.
    </p>
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="shrink-0 text-sm font-semibold text-fin-income underline underline-offset-2 hover:brightness-125 transition-all whitespace-nowrap"
    >
      Abrir conversa no WhatsApp ↗
    </a>
  </div>
);

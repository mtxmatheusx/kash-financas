import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MessageCircle, Smartphone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER = "5511954223325";

function isMobile() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

interface Props {
  userId?: string;
}

export const AmandaLinkSection: React.FC<Props> = ({ userId }) => {
  const whatsappUrl = useMemo(() => {
    const msg = `AtivarFaciliten:${userId ?? ""}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [userId]);

  const handleOpen = () => {
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-fin-income/10 mb-2">
          <MessageCircle className="w-8 h-8 text-fin-income" />
        </div>
        <h3 className="text-lg font-bold text-foreground font-display-fin">
          Vincular Assistente Amanda
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Vincule seu WhatsApp a esta conta para que a Amanda reconheça seu perfil.
        </p>
      </div>

      {/* QR Code for desktop */}
      {!isMobile() && userId && (
        <div className="flex justify-center">
          <div className="w-56 h-56 rounded-xl bg-background border border-border flex items-center justify-center p-3">
            <QRCodeSVG
              value={whatsappUrl}
              size={200}
              bgColor="transparent"
              fgColor="hsl(var(--foreground))"
              level="M"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          className="w-full gap-2 bg-fin-income/90 hover:bg-fin-income text-primary-foreground"
          onClick={handleOpen}
          disabled={!userId}
        >
          {isMobile() ? (
            <Smartphone className="w-4 h-4" />
          ) : (
            <ExternalLink className="w-4 h-4" />
          )}
          {isMobile() ? "Abrir no WhatsApp" : "Vincular Assistente Amanda"}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center">
          Escaneie o QR Code ou clique no botão para vincular seu WhatsApp ao Faciliten.
        </p>
      </div>
    </div>
  );
};

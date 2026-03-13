import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AudioLines } from "lucide-react";
import { fadeUp } from "./LandingAnimations";

/* ── WhatsApp SVG ── */
export const WhatsAppIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── Chat bubble components ── */
const UserBubble: React.FC<{ children: React.ReactNode; time: string }> = ({ children, time }) => (
  <div className="flex justify-end">
    <div className="relative bg-[hsl(142,40%,20%)] rounded-lg rounded-tr-none px-2.5 py-1.5 max-w-[82%] shadow-sm">
      <p className="text-[11px] text-[hsl(0,0%,90%)] leading-[1.4]">{children}</p>
      <p className="text-[7px] text-[hsl(0,0%,50%)] text-right mt-0.5 -mb-0.5">{time}</p>
    </div>
  </div>
);

const BotBubble: React.FC<{ children: React.ReactNode; time: string }> = ({ children, time }) => (
  <div className="flex justify-start">
    <div className="relative bg-[hsl(210,5%,15%)] rounded-lg rounded-tl-none px-2.5 py-1.5 max-w-[88%] shadow-sm">
      <div className="text-[11px] text-[hsl(0,0%,90%)] leading-[1.4] whitespace-pre-line">{children}</div>
      <p className="text-[7px] text-[hsl(0,0%,50%)] text-right mt-0.5 -mb-0.5">{time}</p>
    </div>
  </div>
);

const WaHeader: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className={cn(
    "bg-[hsl(210,8%,14%)] flex items-center gap-2.5 border-b border-[hsl(0,0%,12%)]",
    compact ? "px-3 pt-8 pb-2" : "px-3.5 pt-9 pb-2.5"
  )}>
    <div className="w-8 h-8 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center shrink-0">
      <WhatsAppIcon className="w-4 h-4 text-white" />
    </div>
    <div className="min-w-0">
      <p className={cn("font-semibold text-white", compact ? "text-[11px]" : "text-xs")}>Faciliten Copiloto</p>
      <p className="text-[9px] text-[hsl(142,70%,55%)]">online</p>
    </div>
  </div>
);

const WaInputBar: React.FC = () => (
  <div className="px-2 pb-2 pt-1 shrink-0">
    <div className="flex items-center gap-2 bg-[hsl(210,5%,15%)] rounded-full px-3 py-1.5">
      <span className="text-[10px] text-[hsl(0,0%,40%)] flex-1">Mensagem</span>
      <div className="w-6 h-6 rounded-full bg-[hsl(142,70%,45%)] flex items-center justify-center">
        <AudioLines className="w-3 h-3 text-white" aria-hidden="true" />
      </div>
    </div>
  </div>
);

/* ── Chat content shared between mobile and desktop ── */
const ChatContent: React.FC<{ t: (k: any) => string; compact?: boolean }> = ({ t, compact }) => (
  <>
    <UserBubble time="10:32">🎤 {t("mockup.userMsg1")}</UserBubble>
    <BotBubble time="10:32">
      {t("mockup.botMsg1Short")}
      {"\n"}{t("mockup.botMsg1Detail")}
    </BotBubble>
    <UserBubble time="10:33">{t("mockup.userMsg2")}</UserBubble>
    <BotBubble time="10:33">{t("mockup.botMsg2")}</BotBubble>
  </>
);

/* ── iPhone frame shared elements ── */
const IPhoneFrame: React.FC<{
  children: React.ReactNode;
  width: string;
  height: string;
  borderRadius: string;
  innerRadius: string;
  islandWidth: string;
  islandHeight: string;
  islandTop: string;
}> = ({ children, width, height, borderRadius, innerRadius, islandWidth, islandHeight, islandTop }) => (
  <div
    className={`relative ${width} ${height} border-[3px] border-[hsl(0,0%,18%)] bg-[hsl(0,0%,5%)] overflow-hidden`}
    style={{ borderRadius, boxShadow: "0 0 0 1px hsl(0 0% 28%), 0 25px 80px -15px rgba(0,0,0,0.85), inset 0 1px 0 0 hsl(0 0% 30%)" }}
  >
    {/* Edge reflection */}
    <div className="absolute inset-0 pointer-events-none z-30"
      style={{ borderRadius, background: "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.05) 100%)" }}
    />
    {/* Dynamic Island */}
    <div className={`absolute ${islandTop} left-1/2 -translate-x-1/2 ${islandWidth} ${islandHeight} bg-[hsl(0,0%,2%)] rounded-full z-20`} />
    {/* Screen */}
    <div className="absolute inset-[3px] overflow-hidden bg-[hsl(210,8%,7%)] flex flex-col" style={{ borderRadius: innerRadius }}>
      {children}
    </div>
    {/* Home indicator */}
    <div className="absolute bottom-[7px] left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-[hsl(0,0%,30%)] rounded-full z-20" />
  </div>
);

/* ── Mobile WhatsApp Preview ── */
export const MobileWhatsAppPreview: React.FC<{ t: (k: any) => string }> = ({ t }) => (
  <motion.div {...fadeUp(0.4)} className="mt-10 mx-auto lg:hidden flex justify-center">
    <IPhoneFrame width="w-[220px]" height="h-[470px]" borderRadius="44px" innerRadius="41px" islandWidth="w-[72px]" islandHeight="h-[20px]" islandTop="top-[8px]">
      <WaHeader compact />
      <div className="flex-1 p-2.5 space-y-1.5 overflow-hidden bg-[hsl(210,5%,8%)]">
        <ChatContent t={t} compact />
      </div>
      <WaInputBar />
    </IPhoneFrame>
  </motion.div>
);

/* ── Desktop iPhone Mockup ── */
export const IPhoneMockup: React.FC<{ t: (k: any) => string }> = ({ t }) => (
  <motion.div
    initial={{ opacity: 0, x: 40, rotateY: -8 }}
    whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
    className="relative flex items-center justify-center"
  >
    <div className="absolute w-[320px] h-[500px] rounded-full blur-[80px] bg-[hsl(var(--landing-neon)/0.08)]" />
    <IPhoneFrame width="w-[270px]" height="h-[570px]" borderRadius="48px" innerRadius="45px" islandWidth="w-[84px]" islandHeight="h-[24px]" islandTop="top-[10px]">
      <WaHeader />
      <div className="flex-1 p-3 space-y-2 overflow-hidden bg-[hsl(210,5%,8%)]">
        <ChatContent t={t} />
      </div>
      <WaInputBar />
    </IPhoneFrame>
  </motion.div>
);

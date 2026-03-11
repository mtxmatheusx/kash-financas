import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, RefreshCw, CheckCircle2, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneralDisclaimerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const SECTIONS = [
  {
    title: "Definições",
    icon: Scale,
    accent: "from-blue-500/20 to-blue-600/10",
    iconBg: "bg-blue-500/15 text-blue-500",
    items: [
      "**\"Plataforma\"** refere-se ao Faciliten e todos os seus recursos, incluindo os consultores de IA.",
      "**\"Consultor\"** refere-se aos assistentes virtuais baseados em inteligência artificial.",
      "**\"Usuário\"** refere-se a qualquer pessoa que utilize os serviços dos consultores virtuais.",
    ],
  },
  {
    title: "Natureza do Serviço",
    icon: AlertTriangle,
    accent: "from-amber-500/20 to-amber-600/10",
    iconBg: "bg-amber-500/15 text-amber-500",
    items: [
      "Os consultores fornecem informações de caráter **educacional e informativo**, não constituindo aconselhamento profissional certificado.",
      "As análises e recomendações são geradas por **inteligência artificial** e podem conter imprecisões.",
      "Toda **decisão tomada com base nas informações** fornecidas é de exclusiva responsabilidade do usuário.",
    ],
  },
  {
    title: "Isenção de Responsabilidade",
    icon: ShieldCheck,
    accent: "from-red-500/20 to-red-600/10",
    iconBg: "bg-red-500/15 text-red-500",
    items: [
      "O Faciliten **não se responsabiliza** por quaisquer danos diretos, indiretos ou consequenciais decorrentes do uso.",
      "A plataforma **não garante** a precisão ou atualidade das informações fornecidas pelos consultores.",
      "O Faciliten **não é responsável** por perda de dados ou prejuízos financeiros resultantes das interações.",
    ],
  },
  {
    title: "Disposições Gerais",
    icon: RefreshCw,
    accent: "from-emerald-500/20 to-emerald-600/10",
    iconBg: "bg-emerald-500/15 text-emerald-500",
    items: [
      "O Faciliten reserva-se o direito de **atualizar este termo** periodicamente, notificando sobre alterações significativas.",
      "O uso continuado dos consultores após alterações implica na **aceitação automática** dos novos termos.",
    ],
  },
];

export const GeneralDisclaimer: React.FC<GeneralDisclaimerProps> = ({ onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
      className="absolute inset-0 z-50 flex flex-col bg-background rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with gradient accent */}
      <div className="relative px-5 pt-6 pb-4 text-center shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-transparent" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/10">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground tracking-tight">Termo de Responsabilidade</h3>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">
            Leia e aceite os termos para utilizar os consultores de IA
          </p>
        </motion.div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 space-y-2.5 pb-3">
          {SECTIONS.map((section, si) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={si}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + si * 0.07 }}
                className="rounded-xl border border-border/50 overflow-hidden"
              >
                {/* Section header */}
                <div className={`flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r ${section.accent} to-transparent`}>
                  <div className={`w-7 h-7 rounded-lg ${section.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-[12px] font-bold text-foreground">{section.title}</h4>
                </div>
                {/* Section items */}
                <div className="px-3.5 py-2.5 space-y-1.5">
                  {section.items.map((item, ii) => (
                    <p key={ii} className="text-[11px] text-muted-foreground leading-[1.65] pl-1">
                      {item.split("**").map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="font-semibold text-foreground/90">{part}</strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Sticky footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 pb-5 pt-3 space-y-3 border-t border-border/40 shrink-0 bg-background"
      >
        <label
          className={`flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-all select-none active:scale-[0.99] ${
            accepted
              ? "border-primary/30 bg-primary/5"
              : "border-border/50 bg-muted/20 hover:bg-muted/40"
          }`}
        >
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5 shrink-0 h-5 w-5 rounded-md"
          />
          <span className="text-[11px] text-foreground leading-relaxed">
            Declaro que li e compreendi os termos acima e aceito as condições de uso dos consultores de IA do Faciliten.
          </span>
        </label>
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1 h-11 text-xs rounded-xl" onClick={onDecline}>
            Voltar
          </Button>
          <Button
            className="flex-1 h-11 gap-1.5 text-xs font-semibold rounded-xl shadow-lg shadow-primary/20 disabled:shadow-none transition-shadow"
            disabled={!accepted}
            onClick={onAccept}
          >
            <CheckCircle2 className="w-4 h-4" />
            Aceitar e continuar
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

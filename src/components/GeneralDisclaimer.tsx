import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GeneralDisclaimerProps {
  onAccept: () => void;
  onDecline: () => void;
}

const SECTIONS = [
  {
    title: "1. Definições",
    icon: Scale,
    items: [
      "**\"Plataforma\"** refere-se ao Faciliten e todos os seus recursos, incluindo os consultores de IA.",
      "**\"Consultor\"** refere-se aos assistentes virtuais baseados em inteligência artificial disponíveis na plataforma.",
      "**\"Usuário\"** refere-se a qualquer pessoa que utilize os serviços dos consultores virtuais.",
    ],
  },
  {
    title: "2. Natureza do Serviço",
    icon: AlertTriangle,
    items: [
      "Os consultores virtuais fornecem informações de caráter **educacional e informativo**, não constituindo aconselhamento profissional certificado.",
      "As análises, sugestões e recomendações são geradas por **inteligência artificial** e podem conter imprecisões ou erros.",
      "Toda e qualquer **decisão tomada com base nas informações** fornecidas é de exclusiva responsabilidade do usuário.",
    ],
  },
  {
    title: "3. Isenção de Responsabilidade",
    icon: ShieldCheck,
    items: [
      "O Faciliten **não se responsabiliza** por quaisquer danos diretos, indiretos, incidentais ou consequenciais decorrentes do uso dos consultores.",
      "A plataforma **não garante** a precisão, completude ou atualidade das informações fornecidas pelos consultores virtuais.",
      "O Faciliten **não é responsável** por perda de dados, informações ou prejuízos financeiros resultantes das interações com os consultores.",
    ],
  },
  {
    title: "4. Disposições Gerais",
    icon: RefreshCw,
    items: [
      "O Faciliten reserva-se o direito de **atualizar este termo** periodicamente, notificando os usuários sobre alterações significativas.",
      "O uso continuado dos consultores após alterações implica na **aceitação automática** dos novos termos.",
    ],
  },
];

export const GeneralDisclaimer: React.FC<GeneralDisclaimerProps> = ({ onAccept, onDecline }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-50 flex flex-col bg-background backdrop-blur-sm rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header — compact */}
      <div className="px-5 pt-5 pb-3 text-center space-y-1.5 shrink-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground leading-tight">Termo de Responsabilidade</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[260px] mx-auto">
          Leia e aceite os termos abaixo antes de utilizar os consultores de IA.
        </p>
      </div>

      {/* Content — scrollable */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 space-y-3.5 pb-3">
          {SECTIONS.map((section, si) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={si}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + si * 0.06 }}
                className="rounded-xl border border-border/40 bg-muted/30 p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h4 className="text-[12px] font-bold text-foreground">{section.title}</h4>
                </div>
                <div className="space-y-1 pl-8">
                  {section.items.map((item, ii) => (
                    <p key={ii} className="text-[11px] text-muted-foreground leading-[1.6]">
                      {item.split("**").map((part, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} className="font-semibold text-foreground">{part}</strong>
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

      {/* Footer — always visible */}
      <div className="px-5 pb-5 pt-3 space-y-3 border-t border-border/40 shrink-0 bg-background">
        <label className="flex items-start gap-2.5 cursor-pointer p-2.5 rounded-xl border border-border/40 bg-muted/20 hover:bg-accent/30 transition-colors select-none active:scale-[0.99]">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5 shrink-0 h-5 w-5"
          />
          <span className="text-[11px] text-foreground leading-relaxed">
            Declaro que li e compreendi os termos acima e aceito as condições de uso dos consultores de IA do Faciliten.
          </span>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-11 text-xs" onClick={onDecline}>
            Voltar
          </Button>
          <Button
            size="sm"
            className="flex-1 h-11 gap-1.5 text-xs font-semibold"
            disabled={!accepted}
            onClick={onAccept}
          >
            <CheckCircle2 className="w-4 h-4" />
            Aceitar e continuar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

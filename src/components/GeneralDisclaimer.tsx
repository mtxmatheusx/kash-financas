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
      className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm rounded-2xl"
    >
      {/* Header */}
      <div className="px-4 pt-5 pb-3 text-center space-y-2 shrink-0">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-base font-bold text-foreground">Termo de Responsabilidade</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Leia e aceite os termos abaixo antes de utilizar os consultores de IA.
        </p>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pb-4">
          {SECTIONS.map((section, si) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={si}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + si * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="text-xs font-bold text-foreground">{section.title}</h4>
                </div>
                <div className="space-y-1.5 pl-6">
                  {section.items.map((item, ii) => (
                    <p key={ii} className="text-[11px] text-muted-foreground leading-relaxed">
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

      {/* Footer */}
      <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/50 shrink-0">
        <label className="flex items-start gap-3 cursor-pointer p-2 rounded-lg hover:bg-accent/30 transition-colors">
          <Checkbox
            checked={accepted}
            onCheckedChange={(v) => setAccepted(v === true)}
            className="mt-0.5 shrink-0"
          />
          <span className="text-xs text-foreground leading-relaxed">
            Declaro que li e compreendi os termos acima e aceito as condições de uso dos consultores de IA do Faciliten.
          </span>
        </label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onDecline}>
            Voltar
          </Button>
          <Button size="sm" className="flex-1 gap-1.5" disabled={!accepted} onClick={onAccept}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Aceitar e continuar
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

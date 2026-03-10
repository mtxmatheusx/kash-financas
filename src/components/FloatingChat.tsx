import React, { useState, FormEvent, useEffect } from "react";
import { Send, Bot, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/contexts/AccountContext";
import { cn } from "@/lib/utils";

type ConsultantType = "financial" | "sales";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
}

const consultantConfig = {
  financial: {
    label: "Consultor Financeiro",
    shortLabel: "Financeiro",
    subtitle: "Dicas para suas finanças",
    icon: Bot,
    fallback: "CF",
    placeholder: "Pergunte sobre investimentos, metas, orçamento...",
    greeting: "Olá! Sou seu consultor financeiro. Como posso te ajudar a organizar suas finanças hoje?",
    tips: [
      "Uma boa regra é a 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança/investimentos.",
      "Antes de investir, monte sua reserva de emergência equivalente a 6 meses de despesas fixas.",
      "Revise suas assinaturas mensais — muitas vezes pagamos por serviços que não usamos.",
      "Considere diversificar seus investimentos entre renda fixa e variável conforme seu perfil de risco.",
      "Defina metas financeiras SMART: Específicas, Mensuráveis, Atingíveis, Relevantes e com Prazo.",
      "Acompanhe seus gastos diariamente. Pequenos gastos recorrentes podem representar um grande valor ao final do mês.",
    ],
  },
  sales: {
    label: "Consultor de Vendas",
    shortLabel: "Vendas",
    subtitle: "Estratégias para seu negócio",
    icon: TrendingUp,
    fallback: "CV",
    placeholder: "Pergunte sobre vendas, custos, estratégias...",
    greeting: "Olá! Sou seu consultor de vendas. Como posso ajudar a impulsionar seu negócio hoje?",
    tips: [
      "Monitore seu fluxo de caixa semanalmente para antecipar períodos de baixa liquidez.",
      "Invista em marketing digital — o CAC tende a ser menor que no marketing tradicional.",
      "Considere implementar upselling e cross-selling para aumentar o ticket médio.",
      "Analise sua margem EBITDA regularmente — ela mostra a real eficiência operacional.",
      "Diversifique sua base de clientes. Nenhum cliente deveria representar mais de 20% da receita.",
      "Crie um funil de vendas bem definido e acompanhe as taxas de conversão.",
      "Revise periodicamente seus custos fixos e busque renegociar contratos com fornecedores.",
    ],
  },
};

function getAIResponse(message: string, type: ConsultantType): string {
  const config = consultantConfig[type];
  const lower = message.toLowerCase();

  if (lower.includes("reserva") || lower.includes("emergência")) {
    return type === "sales"
      ? "Para empresas, recomendo manter uma reserva de capital de giro equivalente a pelo menos 3 meses de custos operacionais fixos."
      : "A reserva de emergência ideal é de 6 a 12 meses das suas despesas fixas mensais. Comece com CDB com liquidez diária ou Tesouro Selic.";
  }
  if (lower.includes("investir") || lower.includes("investimento")) {
    return type === "sales"
      ? "Para o caixa da empresa, considere CDBs de curto prazo e fundos DI. Para crescimento, reinvista no negócio focando em áreas com maior ROI."
      : "Para começar a investir, primeiro defina seu perfil (conservador, moderado ou arrojado). Renda fixa é um bom ponto de partida.";
  }
  if (lower.includes("venda") || lower.includes("faturamento") || lower.includes("receita")) {
    return type === "sales"
      ? "Para aumentar o faturamento, foque em: 1) Retenção de clientes atuais, 2) Aumento do ticket médio via upsell, 3) Expansão para novos canais de venda."
      : "Para aumentar sua renda, considere: renda extra com freelancing, investimentos que geram renda passiva, ou desenvolvimento de novas habilidades.";
  }
  if (lower.includes("custo") || lower.includes("despesa") || lower.includes("gasto")) {
    return type === "sales"
      ? "Analise seus custos usando a classificação ABC: foque nos 20% de itens que representam 80% dos custos. Renegocie contratos e busque alternativas."
      : "Categorize seus gastos e identifique onde cortar. Gastos com alimentação fora e transporte costumam ter maior margem de economia.";
  }
  if (lower.includes("meta") || lower.includes("objetivo") || lower.includes("planej")) {
    return type === "sales"
      ? "Defina metas de vendas mensais, trimestrais e anuais. Use KPIs como taxa de conversão, CAC, LTV e margem de contribuição."
      : "Use o método SMART para suas metas financeiras. Ex: 'Economizar R$ 10.000 em 12 meses investindo R$ 834/mês em renda fixa'.";
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("boa")) {
    return config.greeting;
  }

  return config.tips[Math.floor(Math.random() * config.tips.length)];
}

const placeholderSuggestions: Record<ConsultantType, string[]> = {
  financial: [
    "Como montar uma reserva de emergência?",
    "Qual o melhor investimento para iniciantes?",
    "Como organizar minhas despesas mensais?",
  ],
  sales: [
    "Como aumentar meu faturamento?",
    "Estratégias para reduzir custos operacionais",
    "Como definir metas de vendas eficientes?",
  ],
};

export const FloatingChat: React.FC = () => {
  const { account } = useAccount();
  const [consultantType, setConsultantType] = useState<ConsultantType>(
    account.type === "business" ? "sales" : "financial"
  );
  const config = consultantConfig[consultantType];
  const ConsultantIcon = config.icon;

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: config.greeting, sender: "ai" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animatingPlaceholder, setAnimatingPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Animated placeholder
  useEffect(() => {
    const suggestions = placeholderSuggestions[consultantType];
    const currentSuggestion = suggestions[placeholderIndex % suggestions.length];
    let charIndex = 0;
    setAnimatingPlaceholder("");

    const typeInterval = setInterval(() => {
      if (charIndex <= currentSuggestion.length) {
        setAnimatingPlaceholder(currentSuggestion.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPlaceholderIndex((prev) => prev + 1);
        }, 2000);
      }
    }, 40);

    return () => clearInterval(typeInterval);
  }, [placeholderIndex, consultantType]);

  // Reset chat when switching consultant
  const switchConsultant = (type: ConsultantType) => {
    if (type === consultantType) return;
    setConsultantType(type);
    setMessages([
      { id: 1, content: consultantConfig[type].greeting, sender: "ai" },
    ]);
    setPlaceholderIndex(0);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, content: userMessage, sender: "user" },
    ]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const response = getAIResponse(userMessage, consultantType);
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, content: response, sender: "ai" },
      ]);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <ExpandableChat
      size="md"
      position="bottom-right"
      icon={
        <motion.div
          key={consultantType}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ConsultantIcon className="h-6 w-6" />
        </motion.div>
      }
    >
      <ExpandableChatHeader>
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={consultantType}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-9 w-9 rounded-full bg-primary flex items-center justify-center"
              >
                <ConsultantIcon className="h-4 w-4 text-primary-foreground" />
              </motion.div>
            </AnimatePresence>
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.p
                  key={consultantType}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold text-foreground"
                >
                  {config.label}
                </motion.p>
              </AnimatePresence>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">IA</span>
            </div>
          </div>

          {/* Consultant Type Selector */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["financial", "sales"] as const).map((type) => {
              const Icon = consultantConfig[type].icon;
              const isActive = consultantType === type;
              return (
                <button
                  key={type}
                  onClick={() => switchConsultant(type)}
                  className={cn(
                    "relative flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="consultant-selector"
                      className="absolute inset-0 bg-primary rounded-md"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {consultantConfig[type].shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList smooth>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <ChatBubble
                  variant={message.sender === "user" ? "sent" : "received"}
                  layout="ai"
                >
                  {message.sender === "ai" && (
                    <ChatBubbleAvatar fallback={config.fallback} />
                  )}
                  <ChatBubbleMessage variant={message.sender === "user" ? "sent" : "received"}>
                    {message.content}
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ChatBubble variant="received" layout="ai">
                <ChatBubbleAvatar fallback={config.fallback} />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            </motion.div>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 border border-border/50 focus-within:border-primary/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={animatingPlaceholder || config.placeholder}
              rows={1}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/60 min-h-[20px] max-h-[80px]"
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 rounded-lg shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          </div>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};

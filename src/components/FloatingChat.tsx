import React, { useState, FormEvent, useRef } from "react";
import { Bot, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant";
import { useAccount } from "@/contexts/AccountContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ConsultantType = "financial" | "sales";
type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const consultantConfig = {
  financial: {
    label: "Consultor Financeiro",
    shortLabel: "Financeiro",
    subtitle: "IA para suas finanças",
    icon: Bot,
    fallback: "CF",
    placeholder: "Pergunte sobre investimentos, metas, orçamento...",
    greeting: "Olá! 👋 Sou seu consultor financeiro com IA. Posso analisar seus gastos, simular investimentos e sugerir formas de economizar. O que gostaria de explorar?",
  },
  sales: {
    label: "Consultor de Vendas",
    shortLabel: "Vendas",
    subtitle: "IA para seu negócio",
    icon: TrendingUp,
    fallback: "CV",
    placeholder: "Pergunte sobre vendas, custos, estratégias...",
    greeting: "Olá! 📊 Sou seu consultor de vendas com IA. Posso analisar sua margem de lucro, calcular quanto você precisa vender e sugerir estratégias de crescimento. Como posso ajudar?",
  },
};

async function streamChat({
  messages,
  consultantType,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: Msg[];
  consultantType: ConsultantType;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, consultantType }),
    signal,
  });

  if (!resp.ok) {
    const data = await resp.json().catch(() => ({}));
    onError(data.error || "Erro ao conectar com IA");
    return;
  }

  if (!resp.body) { onError("Sem resposta"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

export const FloatingChat: React.FC = () => {
  const { account } = useAccount();
  const [consultantType, setConsultantType] = useState<ConsultantType>(
    account.type === "business" ? "sales" : "financial"
  );
  const config = consultantConfig[consultantType];

  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: config.greeting },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const switchConsultant = (type: ConsultantType) => {
    if (type === consultantType) return;
    abortRef.current?.abort();
    setConsultantType(type);
    setMessages([{ role: "assistant", content: consultantConfig[type].greeting }]);
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    const userMsg: Msg = { role: "user", content: userText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantSoFar = "";

    try {
      await streamChat({
        messages: updatedMessages,
        consultantType,
        signal: controller.signal,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          const current = assistantSoFar;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > updatedMessages.length) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: current } : m);
            }
            return [...prev, { role: "assistant", content: current }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch (e: any) {
      if (e.name !== "AbortError") {
        toast.error("Erro ao conectar com o consultor IA");
      }
      setIsLoading(false);
    }
  };

  return (
    <FloatingAiAssistant
      onSend={sendMessage}
      isLoading={isLoading}
      title={config.label}
      placeholder={config.placeholder}
      headerBadges={[
        { label: consultantType === "financial" ? "Financeiro" : "Vendas", variant: "primary" },
        { label: "IA", variant: "accent" },
      ]}
    >
      {/* Consultant Toggle */}
      <div className="px-4 pt-3 pb-1">
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
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="consultant-selector-glow"
                    className="absolute inset-0 rounded-md"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)',
                    }}
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

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessageList smooth>
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <ChatBubble
                  variant={message.role === "user" ? "sent" : "received"}
                  layout="ai"
                >
                  {message.role === "assistant" && (
                    <ChatBubbleAvatar fallback={config.fallback} />
                  )}
                  <ChatBubbleMessage variant={message.role === "user" ? "sent" : "received"}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </ChatBubbleMessage>
                </ChatBubble>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ChatBubble variant="received" layout="ai">
                <ChatBubbleAvatar fallback={config.fallback} />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            </motion.div>
          )}
        </ChatMessageList>
      </div>
    </FloatingAiAssistant>
  );
};

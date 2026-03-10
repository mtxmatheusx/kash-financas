import React, { useState, useRef, useCallback } from "react";
import { Bot, TrendingUp, Mic, MicOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { FloatingAiAssistant, type Attachment } from "@/components/ui/glowing-ai-chat-assistant";
import { TransactionConfirmCard, type ParsedTransaction } from "@/components/TransactionConfirmCard";
import { useAccount } from "@/contexts/AccountContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ConsultantType = "financial" | "sales";
type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-transaction`;

const consultantConfig = {
  financial: {
    label: "Consultor Financeiro",
    shortLabel: "Financeiro",
    icon: Bot,
    fallback: "CF",
    placeholder: "Pergunte sobre investimentos, metas, orçamento...",
    greeting: "Olá! 👋 Sou seu consultor financeiro com IA. Posso analisar seus gastos, simular investimentos e **registrar transações por você** — basta me dizer algo como \"gastei 50 de gasolina\" ou enviar um áudio! 🎙️",
  },
  sales: {
    label: "Consultor de Vendas",
    shortLabel: "Vendas",
    icon: TrendingUp,
    fallback: "CV",
    placeholder: "Pergunte sobre vendas, custos, estratégias...",
    greeting: "Olá! 📊 Sou seu consultor de vendas com IA. Além de estratégias, posso **registrar receitas e despesas** — diga \"recebi 5000 de freelance\" ou mande um áudio! 🎙️",
  },
};

async function streamChat({
  messages, consultantType, onDelta, onDone, onError, signal,
}: {
  messages: Msg[]; consultantType: ConsultantType;
  onDelta: (text: string) => void; onDone: () => void; onError: (err: string) => void; signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages, consultantType }),
    signal,
  });
  if (!resp.ok) { const d = await resp.json().catch(() => ({})); onError(d.error || "Erro ao conectar com IA"); return; }
  if (!resp.body) { onError("Sem resposta"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;
  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let ni: number;
    while ((ni = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, ni); buf = buf.slice(ni + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim() || !line.startsWith("data: ")) continue;
      const js = line.slice(6).trim();
      if (js === "[DONE]") { done = true; break; }
      try { const p = JSON.parse(js); const c = p.choices?.[0]?.delta?.content; if (c) onDelta(c); }
      catch { buf = line + "\n" + buf; break; }
    }
  }
  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw) continue; if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || !raw.trim() || !raw.startsWith("data: ")) continue;
      const js = raw.slice(6).trim(); if (js === "[DONE]") continue;
      try { const p = JSON.parse(js); const c = p.choices?.[0]?.delta?.content; if (c) onDelta(c); } catch {}
    }
  }
  onDone();
}

async function parseTransaction(message: string): Promise<ParsedTransaction | null> {
  try {
    const resp = await fetch(PARSE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ message }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.transaction || null;
  } catch { return null; }
}

export const FloatingChat: React.FC = () => {
  const { account } = useAccount();
  const { create } = useTransactions();
  const [consultantType, setConsultantType] = useState<ConsultantType>(
    account.type === "business" ? "sales" : "financial"
  );
  const config = consultantConfig[consultantType];
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: config.greeting }]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTx, setPendingTx] = useState<ParsedTransaction | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Speech-to-text
  const { isListening, transcript, start: startListening, stop: stopListening, isSupported: micSupported } = useSpeechToText({
    onResult: (text) => {
      // Auto-send the transcript
      sendMessage(text);
    },
    onError: (err) => toast.error(err),
  });

  const switchConsultant = (type: ConsultantType) => {
    if (type === consultantType) return;
    abortRef.current?.abort();
    setConsultantType(type);
    setMessages([{ role: "assistant", content: consultantConfig[type].greeting }]);
    setPendingTx(null);
  };

  const handleConfirmTx = useCallback(() => {
    if (!pendingTx) return;
    create({
      type: pendingTx.type,
      amount: pendingTx.amount,
      description: pendingTx.description,
      category: pendingTx.category,
      date: new Date().toISOString().slice(0, 10),
      status: pendingTx.status,
      account_type: account.type,
    });
    setMessages(prev => [...prev, {
      role: "assistant",
      content: `✅ **${pendingTx.type === "income" ? "Receita" : "Despesa"} registrada!**\n\n${pendingTx.description} — R$ ${pendingTx.amount.toFixed(2).replace(".", ",")} (${pendingTx.category})`,
    }]);
    toast.success(`${pendingTx.type === "income" ? "Receita" : "Despesa"} registrada!`);
    setPendingTx(null);
  }, [pendingTx, create, account.type]);

  const handleCancelTx = useCallback(() => {
    setMessages(prev => [...prev, { role: "assistant", content: "Ok, registro cancelado. 👍 Como posso ajudar?" }]);
    setPendingTx(null);
  }, []);

  const sendMessage = async (userText: string, _attachments?: Attachment[]) => {
    if (!userText.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: userText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantSoFar = "";

    // Fire both chat + parse in parallel
    const parsePromise = parseTransaction(userText.trim());

    try {
      await streamChat({
        messages: updatedMessages, consultantType, signal: controller.signal,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          const current = assistantSoFar;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > updatedMessages.length)
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: current } : m);
            return [...prev, { role: "assistant", content: current }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (err) => { toast.error(err); setIsLoading(false); },
      });
    } catch (e: any) {
      if (e.name !== "AbortError") toast.error("Erro ao conectar com o consultor IA");
      setIsLoading(false);
    }

    // Check parsed transaction
    const parsed = await parsePromise;
    if (parsed && parsed.amount > 0) {
      setPendingTx(parsed);
    }
  };

  return (
    <FloatingAiAssistant
      onSend={sendMessage}
      isLoading={isLoading}
      title={config.label}
      placeholder={isListening ? "🎙️ Ouvindo..." : config.placeholder}
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
                    style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)' }}
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

      {/* Mic button */}
      {micSupported && (
        <div className="px-4 pb-1">
          <button
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all",
              isListening
                ? "bg-fin-expense/15 text-fin-expense border border-fin-expense/30 animate-pulse"
                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50"
            )}
          >
            {isListening ? (
              <><MicOff className="w-3.5 h-3.5" /> Parar gravação{transcript && `: "${transcript}"`}</>
            ) : (
              <><Mic className="w-3.5 h-3.5" /> Enviar por áudio</>
            )}
          </button>
        </div>
      )}

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
                <ChatBubble variant={message.role === "user" ? "sent" : "received"} layout="ai">
                  {message.role === "assistant" && <ChatBubbleAvatar fallback={config.fallback} />}
                  <ChatBubbleMessage variant={message.role === "user" ? "sent" : "received"}>
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : message.content}
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

      {/* Pending transaction confirmation */}
      {pendingTx && (
        <TransactionConfirmCard
          transaction={pendingTx}
          onConfirm={handleConfirmTx}
          onCancel={handleCancelTx}
        />
      )}
    </FloatingAiAssistant>
  );
};

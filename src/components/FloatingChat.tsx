import React, { useState, useRef, useCallback, useEffect } from "react";
import { Bot, TrendingUp, Mic, MicOff, ImageIcon, Check, X, Send, Plus, Minus, BarChart3, Lightbulb, LineChart, Trash2, PieChart, Target, DollarSign, ShieldAlert, Wallet, CandlestickChart, UserCheck, TrendingDown, Receipt, Users, Megaphone, BadgeDollarSign } from "lucide-react";
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
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PROCESS_AUDIO_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-audio`;

type ConsultantType = "financial" | "sales" | "investor";

// Multimodal content types for the API
type TextContent = { type: "text"; text: string };
type ImageContent = { type: "image_url"; image_url: { url: string } };
type MultimodalContent = TextContent | ImageContent;

// API message format
type ApiMsg = { role: "user" | "assistant"; content: string | MultimodalContent[] };

// Display message (what we show in the UI)
type DisplayMsg = {
  role: "user" | "assistant";
  content: string;
  images?: string[]; // base64 data URLs for display
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const PARSE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-transaction`;

type QuickSuggestion = { label: string; icon: any; msg: string; color: string };

const quickSuggestions: Record<ConsultantType, QuickSuggestion[]> = {
  financial: [
    { label: "Registrar receita", icon: Plus, msg: "Quero registrar uma receita", color: "text-fin-income border-fin-income/30 bg-fin-income/5 hover:bg-fin-income/10" },
    { label: "Registrar despesa", icon: Minus, msg: "Quero registrar uma despesa", color: "text-fin-expense border-fin-expense/30 bg-fin-expense/5 hover:bg-fin-expense/10" },
    { label: "Ver resumo", icon: BarChart3, msg: "Me mostre um resumo financeiro do mês", color: "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" },
    { label: "Dica de economia", icon: Lightbulb, msg: "Me dê uma dica prática para economizar dinheiro no dia a dia", color: "text-fin-pending border-fin-pending/30 bg-fin-pending/5 hover:bg-fin-pending/10" },
    { label: "Simular investimento", icon: LineChart, msg: "Quero simular um investimento. Me ajude a calcular rendimentos", color: "text-fin-investment border-fin-investment/30 bg-fin-investment/5 hover:bg-fin-investment/10" },
  ],
  sales: [
    { label: "Registrar venda", icon: DollarSign, msg: "Quero registrar uma venda", color: "text-fin-income border-fin-income/30 bg-fin-income/5 hover:bg-fin-income/10" },
    { label: "Custo operacional", icon: Receipt, msg: "Quero registrar um custo operacional", color: "text-fin-expense border-fin-expense/30 bg-fin-expense/5 hover:bg-fin-expense/10" },
    { label: "Projeção de receita", icon: TrendingUp, msg: "Faça uma projeção de receita para os próximos 3 meses", color: "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" },
    { label: "Análise de margem", icon: PieChart, msg: "Analise minha margem de lucro atual e sugira melhorias", color: "text-fin-pending border-fin-pending/30 bg-fin-pending/5 hover:bg-fin-pending/10" },
    { label: "Estratégia de preço", icon: BadgeDollarSign, msg: "Me ajude a precificar meu produto/serviço com base nos custos", color: "text-fin-investment border-fin-investment/30 bg-fin-investment/5 hover:bg-fin-investment/10" },
  ],
  investor: [
    { label: "Meu perfil", icon: UserCheck, msg: "Quero descobrir meu perfil de investidor. Me faça as perguntas necessárias.", color: "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10" },
    { label: "Onde investir", icon: CandlestickChart, msg: "Com base no meu perfil, onde posso investir agora? Quero opções com prós e contras.", color: "text-fin-income border-fin-income/30 bg-fin-income/5 hover:bg-fin-income/10" },
    { label: "Riscos atuais", icon: ShieldAlert, msg: "Quais são os principais riscos do mercado financeiro brasileiro hoje?", color: "text-fin-expense border-fin-expense/30 bg-fin-expense/5 hover:bg-fin-expense/10" },
    { label: "Renda fixa vs variável", icon: Target, msg: "Compare renda fixa e renda variável para o cenário atual com números reais", color: "text-fin-pending border-fin-pending/30 bg-fin-pending/5 hover:bg-fin-pending/10" },
    { label: "Carteira ideal", icon: Wallet, msg: "Monte uma sugestão de carteira diversificada para meu perfil", color: "text-fin-investment border-fin-investment/30 bg-fin-investment/5 hover:bg-fin-investment/10" },
  ],
};

const consultantConfig: Record<ConsultantType, { label: string; shortLabel: string; icon: any; fallback: string; placeholder: string; greeting: string }> = {
  financial: {
    label: "Consultor Financeiro",
    shortLabel: "Financeiro",
    icon: Bot,
    fallback: "CF",
    placeholder: "Pergunte ou envie uma imagem (fatura, extrato)...",
    greeting: "Olá! 👋 Sou seu consultor financeiro com IA. Posso analisar seus gastos, simular investimentos e **registrar transações por você**.\n\n📸 Envie uma foto de fatura, extrato ou comprovante e eu analiso!\n🎙️ Ou mande um áudio como \"gastei 50 de gasolina\".",
  },
  sales: {
    label: "Consultor de Vendas",
    shortLabel: "Vendas",
    icon: TrendingUp,
    fallback: "CV",
    placeholder: "Pergunte ou envie uma imagem (relatório, NF)...",
    greeting: "Olá! 📊 Sou seu consultor de vendas com IA. Posso **registrar receitas e despesas** e analisar dados.\n\n📸 Envie uma foto de relatório, planilha ou nota fiscal!\n🎙️ Ou diga \"recebi 5000 de freelance\".",
  },
  investor: {
    label: "Consultor de Investimentos",
    shortLabel: "Investidor",
    icon: CandlestickChart,
    fallback: "CI",
    placeholder: "Pergunte sobre investimentos, perfil ou mercado...",
    greeting: "Olá! 📈 Sou seu consultor de investimentos com IA. Posso ajudar a **definir seu perfil de investidor**, analisar o mercado e sugerir estratégias.\n\n⚠️ **Aviso importante:** As informações são educacionais. Toda decisão de investimento é de **sua responsabilidade**. Ganhos e perdas dependem exclusivamente das suas escolhas.\n\n💡 Comece descobrindo seu perfil de investidor!",
  },
};

/** Convert a File to a base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Build API messages from display messages */
function toApiMessages(displayMsgs: DisplayMsg[]): ApiMsg[] {
  return displayMsgs.map((m) => {
    if (m.role === "assistant") return { role: "assistant", content: m.content };
    if (m.images && m.images.length > 0) {
      const content: MultimodalContent[] = [];
      if (m.content) content.push({ type: "text", text: m.content });
      m.images.forEach((url) => content.push({ type: "image_url", image_url: { url } }));
      return { role: "user", content };
    }
    return { role: "user", content: m.content };
  });
}

async function streamChat({
  messages, consultantType, onDelta, onDone, onError, signal,
}: {
  messages: ApiMsg[]; consultantType: ConsultantType;
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
  const { user } = useAuth();
  const [consultantType, setConsultantType] = useState<ConsultantType>(
    account.type === "business" ? "sales" : "financial"
  );
  const config = consultantConfig[consultantType];
  const [messages, setMessages] = useState<DisplayMsg[]>([{ role: "assistant", content: config.greeting }]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [pendingTx, setPendingTx] = useState<ParsedTransaction | null>(null);
  const [stagedMsg, setStagedMsg] = useState<{ text: string; images: string[] } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load chat history from database
  useEffect(() => {
    if (!user) return;
    const loadHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('consultant_type', consultantType)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data && data.length > 0) {
        const loaded: DisplayMsg[] = [
          { role: "assistant", content: consultantConfig[consultantType].greeting },
          ...data.map(row => ({
            role: row.role as "user" | "assistant",
            content: row.content,
            images: (row.images as string[] | null)?.length ? (row.images as string[]) : undefined,
          })),
        ];
        setMessages(loaded);
      }
      setHistoryLoaded(true);
    };
    loadHistory();
  }, [user, consultantType]);

  // Save message to database
  const saveMessage = useCallback(async (role: "user" | "assistant", content: string, images?: string[]) => {
    if (!user || !content.trim()) return;
    await supabase.from('chat_messages').insert({
      user_id: user.id,
      role,
      content,
      consultant_type: consultantType,
      images: images ?? [],
    } as any);
  }, [user, consultantType]);

  const { isListening, transcript, start: startListening, stop: stopListening, isSupported: micSupported } = useSpeechToText({
    onResult: (text) => stageMessage(text),
    onError: (err) => toast.error(err),
  });

  // Real audio recorder — captures audio, converts to base64, sends to webhook
  const sendAudioToWebhook = useCallback(async (base64Audio: string, mimeType: string) => {
    try {
      const resp = await fetch(PROCESS_AUDIO_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ audio_base64: base64Audio, mime_type: mimeType }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || "Falha ao processar áudio");
      }

      const data = await resp.json();
      toast.success("Lançamento processado pela IA com sucesso!");

      // If the webhook returns a transaction or text, stage it
      if (data.result?.transaction) {
        setPendingTx(data.result.transaction);
      } else if (data.result?.message) {
        stageMessage(data.result.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar áudio para processamento.");
    }
  }, []);

  const { isRecording: isAudioRecording, isSending: isAudioSending, duration: recordingDuration, start: startRecording, stop: stopRecording } = useAudioRecorder({
    onRecordingComplete: sendAudioToWebhook,
    onError: (err) => toast.error(err),
    maxDurationMs: 120_000,
  });

  const isRecordingOrSending = isAudioRecording || isAudioSending;

  const switchConsultant = (type: ConsultantType) => {
    if (type === consultantType) return;
    abortRef.current?.abort();
    setConsultantType(type);
    setMessages([{ role: "assistant", content: consultantConfig[type].greeting }]);
    setHistoryLoaded(false);
    setPendingTx(null);
    setStagedMsg(null);
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
      entry_type: pendingTx.entry_type ?? 'single',
      ...(pendingTx.frequency ? { frequency: pendingTx.frequency } : {}),
      ...(pendingTx.installments ? { installments: pendingTx.installments } : {}),
    });
    const confirmContent = `✅ **${pendingTx.type === "income" ? "Receita" : "Despesa"} registrada!**\n\n${pendingTx.description} — R$ ${pendingTx.amount.toFixed(2).replace(".", ",")} (${pendingTx.category})`;
    setMessages(prev => [...prev, { role: "assistant", content: confirmContent }]);
    saveMessage("assistant", confirmContent);
    toast.success(`${pendingTx.type === "income" ? "Receita" : "Despesa"} registrada!`);
    setPendingTx(null);
  }, [pendingTx, create, account.type, saveMessage]);

  const handleCancelTx = useCallback(() => {
    const cancelContent = "Ok, registro cancelado. 👍 Como posso ajudar?";
    setMessages(prev => [...prev, { role: "assistant", content: cancelContent }]);
    saveMessage("assistant", cancelContent);
    setPendingTx(null);
  }, [saveMessage]);

  /** Stage a message for preview (don't send yet) */
  const stageMessage = async (userText: string, attachments?: Attachment[]) => {
    if ((!userText.trim() && (!attachments || attachments.length === 0)) || isLoading) return;

    const imageFiles = attachments?.filter(a => a.file.type.startsWith("image/")) || [];
    const imageBase64: string[] = [];
    for (const att of imageFiles) {
      try {
        const b64 = await fileToBase64(att.file);
        imageBase64.push(b64);
      } catch { /* ignore */ }
    }

    setStagedMsg({ text: userText.trim(), images: imageBase64 });
  };

  /** Confirm & send the staged message */
  const confirmStagedMessage = async () => {
    if (!stagedMsg) return;
    const { text, images } = stagedMsg;
    setStagedMsg(null);

    const displayText = text || (images.length > 0 ? `📷 ${images.length} imagem(ns) enviada(s)` : "");
    const userMsg: DisplayMsg = {
      role: "user",
      content: displayText,
      images: images.length > 0 ? images : undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Save user message to DB (don't save base64 images to avoid bloat)
    saveMessage("user", displayText);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistantSoFar = "";

    const apiMessages = toApiMessages(updatedMessages);
    const parsePromise = text ? parseTransaction(text) : Promise.resolve(null);

    try {
      await streamChat({
        messages: apiMessages, consultantType, signal: controller.signal,
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
        onDone: () => {
          setIsLoading(false);
          // Save complete assistant response to DB
          if (assistantSoFar.trim()) saveMessage("assistant", assistantSoFar);
        },
        onError: (err) => { toast.error(err); setIsLoading(false); },
      });
    } catch (e: any) {
      if (e.name !== "AbortError") toast.error("Erro ao conectar com o consultor IA");
      setIsLoading(false);
    }

    const parsed = await parsePromise;
    if (parsed && parsed.amount > 0) setPendingTx(parsed);
  };

  const discardStagedMessage = () => setStagedMsg(null);

  const clearHistory = async () => {
    if (!user) return;
    await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id)
      .eq('consultant_type', consultantType);
    setMessages([{ role: "assistant", content: config.greeting }]);
    setPendingTx(null);
    toast.success("Histórico limpo!");
  };

  return (
    <FloatingAiAssistant
      onSend={stageMessage}
      isLoading={isLoading}
      title={config.label}
      placeholder={isAudioRecording ? `🎙️ Gravando... ${recordingDuration}s` : isAudioSending ? "⏳ Processando áudio..." : isListening ? "🎙️ Ouvindo..." : config.placeholder}
      headerBadges={[
        { label: consultantType === "financial" ? "Financeiro" : "Vendas", variant: "primary" },
        { label: "IA", variant: "accent" },
      ]}
      micProps={{
        isListening: isAudioRecording || isAudioSending,
        onToggle: isAudioRecording ? stopRecording : startRecording,
      }}
    >
      {/* Consultant Toggle + Clear */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <div className="flex-1 flex gap-1 bg-muted rounded-lg p-1">
          {(["financial", "sales", "investor"] as const).map((type) => {
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
        {messages.length > 1 && (
          <button
            onClick={clearHistory}
            title="Limpar histórico"
            className="p-1.5 rounded-md text-muted-foreground hover:text-fin-expense hover:bg-muted/50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mic button is now in the chat controls bar */}

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
                    {message.role === "user" && message.images && message.images.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-2">
                        {message.images.map((img, i) => (
                          <img key={i} src={img} alt={`Anexo ${i + 1}`} className="w-20 h-20 rounded-lg object-cover border border-primary-foreground/20" />
                        ))}
                      </div>
                    )}
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

          {/* Quick suggestions - show only after greeting (1 message) and when not loading */}
          {messages.length <= 1 && !isLoading && !stagedMsg && !pendingTx && historyLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 px-4 py-2"
            >
              {quickSuggestions[consultantType].map((s) => (
                <button
                  key={s.label}
                  onClick={() => stageMessage(s.msg)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
                    s.color
                  )}
                >
                  <s.icon className="w-3 h-3" />
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}

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

      {/* Staged message preview */}
      {stagedMsg && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 my-2 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2"
        >
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Confirmar envio</p>

          {stagedMsg.images.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {stagedMsg.images.map((img, i) => (
                <img key={i} src={img} alt={`Preview ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-border/40" />
              ))}
            </div>
          )}

          {stagedMsg.text && (
            <p className="text-sm text-foreground line-clamp-3">{stagedMsg.text}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={discardStagedMessage}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3" /> Descartar
            </button>
            <button
              onClick={confirmStagedMessage}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium text-primary-foreground transition-colors"
              style={{ background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)" }}
            >
              <Send className="w-3 h-3" /> Enviar
            </button>
          </div>
        </motion.div>
      )}

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

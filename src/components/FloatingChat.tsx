import React, { useState, FormEvent } from "react";
import { Send, Bot, TrendingUp } from "lucide-react";
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
import { ChatInput } from "@/components/ui/chat-input";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/contexts/AccountContext";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
}

const financialTips: Record<string, string[]> = {
  personal: [
    "Uma boa regra é a 50/30/20: 50% para necessidades, 30% para desejos e 20% para poupança/investimentos.",
    "Antes de investir, monte sua reserva de emergência equivalente a 6 meses de despesas fixas.",
    "Revise suas assinaturas mensais — muitas vezes pagamos por serviços que não usamos.",
    "Considere diversificar seus investimentos entre renda fixa e variável conforme seu perfil de risco.",
    "Defina metas financeiras SMART: Específicas, Mensuráveis, Atingíveis, Relevantes e com Prazo.",
    "Acompanhe seus gastos diariamente. Pequenos gastos recorrentes podem representar um grande valor ao final do mês.",
  ],
  business: [
    "Monitore seu fluxo de caixa semanalmente para antecipar períodos de baixa liquidez.",
    "Invista em marketing digital — o CAC (Custo de Aquisição de Cliente) tende a ser menor que no marketing tradicional.",
    "Considere implementar upselling e cross-selling para aumentar o ticket médio dos seus clientes.",
    "Analise sua margem EBITDA regularmente — ela mostra a real eficiência operacional do negócio.",
    "Diversifique sua base de clientes para reduzir dependência. Nenhum cliente deveria representar mais de 20% da receita.",
    "Crie um funil de vendas bem definido e acompanhe as taxas de conversão em cada etapa.",
    "Revise periodicamente seus custos fixos e busque renegociar contratos com fornecedores.",
  ],
};

function getAIResponse(message: string, accountType: string): string {
  const tips = financialTips[accountType] || financialTips.personal;
  const lower = message.toLowerCase();

  if (lower.includes("reserva") || lower.includes("emergência")) {
    return accountType === "business"
      ? "Para empresas, recomendo manter uma reserva de capital de giro equivalente a pelo menos 3 meses de custos operacionais fixos."
      : "A reserva de emergência ideal é de 6 a 12 meses das suas despesas fixas mensais. Comece com aplicações de alta liquidez como CDB com liquidez diária ou Tesouro Selic.";
  }
  if (lower.includes("investir") || lower.includes("investimento")) {
    return accountType === "business"
      ? "Para o caixa da empresa, considere CDBs de curto prazo e fundos DI. Para crescimento, reinvista no negócio focando em áreas com maior ROI."
      : "Para começar a investir, primeiro defina seu perfil (conservador, moderado ou arrojado). Renda fixa é um bom ponto de partida.";
  }
  if (lower.includes("venda") || lower.includes("faturamento") || lower.includes("receita")) {
    return accountType === "business"
      ? "Para aumentar o faturamento, foque em: 1) Retenção de clientes atuais, 2) Aumento do ticket médio via upsell, 3) Expansão para novos canais de venda."
      : "Para aumentar sua renda, considere: renda extra com freelancing, investimentos que geram renda passiva, ou desenvolvimento de novas habilidades profissionais.";
  }
  if (lower.includes("custo") || lower.includes("despesa") || lower.includes("gasto")) {
    return accountType === "business"
      ? "Analise seus custos usando a classificação ABC: foque nos 20% de itens que representam 80% dos custos. Renegocie contratos e busque fornecedores alternativos."
      : "Categorize seus gastos e identifique onde cortar. Gastos com alimentação fora de casa e transporte costumam ter maior margem de economia.";
  }
  if (lower.includes("meta") || lower.includes("objetivo") || lower.includes("planej")) {
    return accountType === "business"
      ? "Defina metas de vendas mensais, trimestrais e anuais. Use KPIs como taxa de conversão, CAC, LTV e margem de contribuição para acompanhar."
      : "Use o método SMART para suas metas financeiras. Por exemplo: 'Economizar R$ 10.000 em 12 meses investindo R$ 834/mês em renda fixa'.";
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("boa")) {
    return accountType === "business"
      ? "Olá! Sou seu consultor de vendas e finanças empresariais. Como posso ajudar a impulsionar seu negócio hoje?"
      : "Olá! Sou seu consultor financeiro pessoal. Como posso te ajudar a organizar suas finanças hoje?";
  }

  return tips[Math.floor(Math.random() * tips.length)];
}

export const FloatingChat: React.FC = () => {
  const { account } = useAccount();
  const isBusinessAccount = account.type === "business";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: isBusinessAccount
        ? "Olá! Sou seu consultor de vendas e finanças. Como posso ajudar a impulsionar seu negócio hoje?"
        : "Olá! Sou seu consultor financeiro pessoal. Como posso te ajudar a organizar suas finanças hoje?",
      sender: "ai",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const response = getAIResponse(userMessage, account.type);
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
      icon={isBusinessAccount ? <TrendingUp className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
    >
      <ExpandableChatHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            {isBusinessAccount ? (
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Bot className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isBusinessAccount ? "Consultor de Vendas" : "Consultor Financeiro"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isBusinessAccount ? "Estratégias para seu negócio" : "Dicas para suas finanças"}
            </p>
          </div>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList smooth>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.sender === "user" ? "sent" : "received"}
              layout="ai"
            >
              {message.sender === "ai" && (
                <ChatBubbleAvatar
                  fallback={isBusinessAccount ? "CV" : "CF"}
                />
              )}
              <ChatBubbleMessage variant={message.sender === "user" ? "sent" : "received"}>
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {isLoading && (
            <ChatBubble variant="received" layout="ai">
              <ChatBubbleAvatar fallback={isBusinessAccount ? "CV" : "CF"} />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isBusinessAccount
                ? "Pergunte sobre vendas, custos, metas..."
                : "Pergunte sobre investimentos, metas, orçamento..."
            }
            className="min-h-10 h-10 resize-none rounded-lg bg-muted border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
};

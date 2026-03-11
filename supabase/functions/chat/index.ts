import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, consultantType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      financial: `Você é o "Faciliten", consultor financeiro pessoal com IA. Você tem PERSONALIDADE — fala como um amigo inteligente que manja de finanças, não como um robô corporativo.

**SUA PRIORIDADE #1: REGISTRAR TRANSAÇÕES**
Quando o usuário mencionar qualquer valor, gasto, recebimento ou transação financeira, você deve:
1. Identificar se é receita ou despesa
2. Extrair o valor, descrição e categoria
3. Confirmar o registro de forma clara: "✅ Vou registrar: **[Descrição]** como **[Receita/Despesa]** de **R$ X,XX**"
4. Se faltar informação (valor, tipo), pergunte de forma direta e curta

**Exemplos de detecção inteligente:**
- "gastei 50 no mercado" → Despesa, R$ 50, Alimentação
- "recebi 3000 de salário" → Receita, R$ 3.000, Salário
- "paguei 150 de luz" → Despesa, R$ 150, Moradia
- "entrou 500 de freelance" → Receita, R$ 500, Freelance

**Se o usuário não mencionar transação**, aja como consultor financeiro normalmente.

**Seu tom de voz:**
- Direto e certeiro, como uma mensagem de WhatsApp de um amigo que é analista financeiro
- Use expressões naturais: "olha só", "cara", "veja bem", "boa pergunta!", "saca só"
- Comemore conquistas: "🔥 Mandou bem!" / "💪 Tá no caminho certo!"
- Alerte com urgência real: "⚠️ Opa, cuidado aqui..."
- Seja específico, nunca genérico — use NÚMEROS e CENÁRIOS concretos

**O que você faz:**
1. Registra transações rapidamente a partir de linguagem natural
2. Analisa padrões e alerta proativamente sobre mudanças nos gastos
3. Sugere ações concretas com valores reais e simulações
4. Faz projeções tipo: "Se continuar assim, em 6 meses você vai ter X"

**Capacidades visuais:**
- Você CONSEGUE analisar imagens! Quando o usuário enviar uma imagem (print de fatura, extrato, planilha), extraia os valores e ofereça registrar cada transação encontrada.

**Especialidades:** orçamento, investimentos, reserva de emergência, planejamento, redução de gastos, metas, renda fixa/variável.

Use markdown (listas, **negrito**, tabelas). Respostas concisas (2-3 parágrafos max).
Sempre termine com uma pergunta ou próximo passo pra manter a conversa fluindo.`,

      sales: `Você é o "Faciliten Vendas", consultor estratégico de negócios com IA. Você tem PERSONALIDADE — fala como um sócio estratégico que entende de números e negócios.

**SUA PRIORIDADE #1: REGISTRAR TRANSAÇÕES**
Quando o usuário mencionar qualquer valor, venda, custo ou transação:
1. Identifique se é receita ou despesa
2. Extraia valor, descrição e categoria
3. Confirme: "✅ Vou registrar: **[Descrição]** como **[Receita/Despesa]** de **R$ X,XX**"
4. Se faltar info, pergunte de forma direta

**Exemplos:**
- "vendi 10 mil em produtos" → Receita, R$ 10.000, Vendas
- "paguei 2000 de fornecedor" → Despesa, R$ 2.000, Fornecedores
- "entrou 5000 do cliente X" → Receita, R$ 5.000, Vendas

**Se o usuário não mencionar transação**, aja como consultor de vendas normalmente.

**Seu tom de voz:**
- Estratégico e motivador, como um mentor de negócios no WhatsApp
- Use expressões naturais: "bora lá", "saca só esse número", "olha a oportunidade"
- Comemore resultados: "🚀 Tá crescendo!" / "📈 Esse é o caminho!"
- Alerte sobre riscos: "⚠️ Margem apertando..."
- Sempre conecte despesas a resultados de vendas

**O que você faz:**
1. Registra transações rapidamente a partir de linguagem natural
2. Conecta despesas a metas de vendas com números específicos
3. Dá insights acionáveis com ROI claro
4. Faz projeções de receita e custos

**Capacidades visuais:**
- Analise imagens (relatório, planilha, NF) e ofereça registrar as transações encontradas.

**Especialidades:** vendas, fluxo de caixa, precificação, marketing, CAC/LTV, EBITDA, DRE, projeções.

Use markdown (listas, **negrito**, tabelas). Respostas concisas (2-3 parágrafos max).
Sempre termine com uma pergunta ou próximo passo.`,
    };

    const systemContent = systemPrompts[consultantType] || systemPrompts.financial;

    // Messages already come in the correct format from the frontend
    // They can be either string content or array content (for multimodal)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

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
      financial: `Você é o "Kash", consultor financeiro pessoal com IA. Você tem PERSONALIDADE — fala como um amigo inteligente que manja de finanças, não como um robô corporativo.

**Seu tom de voz:**
- Direto e certeiro, como uma mensagem de WhatsApp de um amigo que é analista financeiro
- Use expressões naturais: "olha só", "cara", "veja bem", "boa pergunta!", "saca só"
- Comemore conquistas: "🔥 Mandou bem!" / "💪 Tá no caminho certo!"
- Alerte com urgência real: "⚠️ Opa, cuidado aqui..." / "🚨 Isso precisa de atenção"
- Seja específico, nunca genérico — use NÚMEROS e CENÁRIOS concretos
- Fale como quem realmente se importa com o financeiro da pessoa

**O que você faz:**
1. Analisa padrões e alerta proativamente sobre mudanças nos gastos
2. Sugere ações concretas com valores reais e simulações
3. Faz projeções e cenários tipo: "Se continuar assim, em 6 meses você vai ter X"
4. Explica conceitos usando os números do próprio usuário, nunca teoria seca

**Capacidades visuais:**
- Você CONSEGUE analisar imagens! Quando o usuário enviar uma imagem (print de fatura, extrato, planilha, comprovante), analise os números, valores e dados visíveis.
- Extraia valores, datas, categorias e qualquer informação financeira relevante da imagem.
- Se a imagem estiver borrada ou ilegível, peça uma foto mais nítida.

**Especialidades:** orçamento pessoal, investimentos, reserva de emergência, planejamento, redução de gastos, metas, renda fixa/variável, previdência, impostos, simulações.

Use markdown (listas, **negrito**, tabelas). Respostas concisas (2-3 parágrafos max).
Sempre termine com uma pergunta ou próximo passo pra manter a conversa fluindo.`,

      sales: `Você é o "Kash Vendas", consultor estratégico de negócios com IA. Você tem PERSONALIDADE — fala como um sócio estratégico que entende de números e negócios.

**Seu tom de voz:**
- Estratégico e motivador, como um mentor de negócios no WhatsApp
- Use expressões naturais: "bora lá", "saca só esse número", "olha a oportunidade", "isso aqui é ouro"
- Comemore resultados: "🚀 Tá crescendo!" / "📈 Esse é o caminho!"
- Alerte sobre riscos: "⚠️ Margem apertando..." / "🔴 CAC tá alto demais"
- Sempre conecte despesas a resultados de vendas — mostre o impacto real
- Fale como quem já viveu o dia a dia de uma empresa

**O que você faz:**
1. Conecta despesas a metas de vendas com números específicos
2. Dá insights acionáveis: "Foque nesses 3 produtos que dão 70% do lucro"
3. Faz projeções: "Se aumentar ticket médio em 15%, sua receita sobe R$X/mês"
4. Sugere estratégias com ROI claro e prazo definido

**Capacidades visuais:**
- Você CONSEGUE analisar imagens! Quando o usuário enviar uma imagem (relatório, planilha, dashboard, nota fiscal), analise os dados visíveis.
- Extraia métricas de vendas, custos, margens e qualquer dado relevante.
- Se a imagem estiver borrada ou ilegível, peça uma foto mais nítida.

**Especialidades:** vendas, fluxo de caixa, precificação, marketing digital, CAC/LTV, funil, custos, EBITDA, DRE, planejamento, fornecedores, projeções, ROI.

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

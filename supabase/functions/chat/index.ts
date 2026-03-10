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

**Especialidades:** orçamento pessoal, investimentos, reserva de emergência, planejamento, redução de gastos, metas, renda fixa/variável, previdência, impostos, simulações.

Use markdown (listas, **negrito**, tabelas). Respostas concisas (2-3 parágrafos max).
Sempre termine com uma pergunta ou próximo passo pra manter a conversa fluindo.`,

      sales: `Você é o "Kash Consultor de Vendas", um consultor estratégico de negócios com IA avançada.
Responda sempre em português brasileiro. Seja direto, estratégico e motivador.

**Seu papel é transformar o app de um "custo" em um "investimento".** Você é um consultor PROATIVO que:

1. **Conecta despesas a resultados de vendas**:
   - "Suas despesas fixas aumentaram R$2.000 este mês. Para manter sua margem de lucro de 25%, você precisa vender mais X unidades do produto Y hoje."
   - "Seu custo por aquisição de cliente (CAC) está em R$85. Se reduzir para R$60, seu lucro por cliente sobe 40%."

2. **Fornece insights estratégicos acionáveis**:
   - "Seus 3 produtos mais rentáveis representam 70% do lucro. Foque a campanha neles."
   - "O ticket médio caiu 15% este mês. Considere uma estratégia de upsell ou bundle."

3. **Faz projeções de negócio e cenários**:
   - "Se aumentar a frequência de compra dos clientes ativos em 20%, sua receita mensal sobe R$15.000."
   - "Com a margem atual, você precisa faturar R$80.000/mês para cobrir todos os custos e ter 20% de lucro."

4. **Sugere estratégias com ROI claro**:
   - "Investir R$2.000 em Google Ads com seu CAC atual traria ~33 novos clientes e R$9.900 em receita."
   - "Criar um programa de indicação pode reduzir seu CAC em 50% baseado em benchmarks do seu setor."

Suas especialidades: estratégias de vendas, fluxo de caixa empresarial, precificação, 
marketing digital, CAC/LTV, funil de vendas, gestão de custos, EBITDA, DRE, 
planejamento empresarial, negociação com fornecedores, projeções financeiras, ROI.

Use formatação markdown (listas, negrito, tabelas quando útil).
Mantenha respostas concisas (máximo 3 parágrafos) a menos que o usuário peça mais detalhes.
Sempre termine com uma pergunta ou sugestão de próximo passo para manter o engajamento.`,
    };

    const systemContent = systemPrompts[consultantType] || systemPrompts.financial;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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

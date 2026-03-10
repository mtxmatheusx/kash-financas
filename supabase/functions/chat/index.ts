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
      financial: `Você é um consultor financeiro pessoal especializado chamado "Kash Consultor Financeiro". 
Responda sempre em português brasileiro. Seja direto, prático e amigável.
Suas especialidades: orçamento pessoal, investimentos, reserva de emergência, planejamento financeiro, 
redução de gastos, metas financeiras, renda fixa e variável, previdência, impostos pessoais.
Use formatação markdown quando apropriado (listas, negrito, etc).
Mantenha respostas concisas (máximo 3 parágrafos) a menos que o usuário peça mais detalhes.`,
      sales: `Você é um consultor de vendas e negócios chamado "Kash Consultor de Vendas".
Responda sempre em português brasileiro. Seja direto, estratégico e motivador.
Suas especialidades: estratégias de vendas, fluxo de caixa empresarial, precificação, 
marketing digital, CAC/LTV, funil de vendas, gestão de custos, EBITDA, DRE, 
planejamento empresarial, negociação com fornecedores.
Use formatação markdown quando apropriado (listas, negrito, etc).
Mantenha respostas concisas (máximo 3 parágrafos) a menos que o usuário peça mais detalhes.`,
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

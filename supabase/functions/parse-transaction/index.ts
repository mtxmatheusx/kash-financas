import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Você é um parser de transações financeiras. Analise a mensagem do usuário e determine se contém informação sobre uma receita ou despesa. Se sim, extraia os dados usando a ferramenta. Se a mensagem não é sobre registrar uma transação financeira (ex: é uma pergunta, pedido de ajuda, etc), NÃO chame a ferramenta.

Categorias válidas para despesas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Tecnologia, Serviços, Impostos, Outros
Categorias válidas para receitas: Salário, Freelance, Vendas, Investimentos, Aluguel, Comissão, Bônus, Outros

Use o contexto para inferir:
- "gastei", "paguei", "comprei", "conta de" → despesa
- "recebi", "ganhei", "entrou", "vendi" → receita
- Se não especificar status, assuma "paid" (pago)
- Se não especificar data, use a data de hoje`,
          },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "register_transaction",
              description: "Registra uma transação financeira (receita ou despesa) extraída da mensagem do usuário.",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["income", "expense"], description: "Tipo: income (receita) ou expense (despesa)" },
                  amount: { type: "number", description: "Valor em reais (positivo)" },
                  description: { type: "string", description: "Descrição curta da transação" },
                  category: { type: "string", description: "Categoria da transação" },
                  status: { type: "string", enum: ["paid", "pending"], description: "Status: paid ou pending" },
                },
                required: ["type", "amount", "description", "category", "status"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ transaction: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.name === "register_transaction") {
      const transaction = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ transaction }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ transaction: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-transaction error:", e);
    return new Response(JSON.stringify({ transaction: null }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

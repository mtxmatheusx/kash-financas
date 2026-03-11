import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { transactions, investments, goals, preferences, language, currency } = await req.json();
    const langMap: Record<string, string> = { "pt-BR": "português brasileiro", en: "English", es: "español" };
    const responseLang = langMap[language] || "português brasileiro";
    const currencySymbol: Record<string, string> = { BRL: "R$", USD: "$", EUR: "€", GBP: "£" };
    const currencyFormat: Record<string, string> = {
      BRL: "formato brasileiro (R$ X.XXX,XX)",
      USD: "US dollar format ($X,XXX.XX)",
      EUR: "Euro format (€X.XXX,XX)",
      GBP: "British pound format (£X,XXX.XX)",
    };
    const symbol = currencySymbol[currency] || "R$";
    const moneyFormat = currencyFormat[currency] || currencyFormat.BRL;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prefsBlock = preferences?.length > 0
      ? `\n\nPREFERÊNCIAS DO USUÁRIO (RESPEITE OBRIGATORIAMENTE):\n${preferences.map((p: string) => `- ${p}`).join("\n")}\n\nNUNCA gere insights que contradigam as preferências acima. Esses são princípios pessoais do usuário que devem ser respeitados.`
      : "";

    const prompt = `Você é um consultor financeiro pessoal inteligente. Analise os dados financeiros abaixo e gere de 3 a 5 insights personalizados e acionáveis. RESPONDA INTEIRAMENTE EM ${responseLang}.

DADOS DO USUÁRIO:
${JSON.stringify({ transactions, investments, goals }, null, 2)}

REGRAS:
- Cada insight deve ter: type (spending_trend | expense_highlight | savings_opportunity | income_insight | goal_progress), title (curto, max 8 palavras), description (1-2 frases com valores reais usando o símbolo ${symbol}), icon (emoji), severity (info | warning | success | alert)
- Use valores REAIS dos dados fornecidos, nunca invente números
- Compare mês atual vs anterior quando possível
- Identifique a maior categoria de gasto
- Se houver metas, mostre o progresso
- Se houver investimentos, comente o retorno
- Seja específico e útil, evite generalidades
- Se não houver dados suficientes, dê dicas gerais de finanças pessoais
- IMPORTANTE: Todos os valores monetários devem usar ${moneyFormat}. Use APENAS o símbolo ${symbol}, NUNCA use R$ ou outro símbolo que não seja ${symbol}.
- CRÍTICO: NÃO gere insights que se contradizem. Antes de retornar, revise TODOS os insights juntos e garanta que a narrativa é coerente.
- Cada insight deve abordar um ASPECTO DIFERENTE das finanças (ex: receita, despesa, categoria específica, meta, investimento). Não repita o mesmo tema com ângulos diferentes.${prefsBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você retorna APENAS JSON válido, sem markdown, sem explicação." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Retorna os insights financeiros analisados",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["spending_trend", "expense_highlight", "savings_opportunity", "income_insight", "goal_progress"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        icon: { type: "string" },
                        severity: { type: "string", enum: ["info", "warning", "success", "alert"] },
                      },
                      required: ["type", "title", "description", "icon", "severity"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
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
      return new Response(JSON.stringify({ insights: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.name === "return_insights") {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ insights: parsed.insights || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ insights: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("financial-insights error:", e);
    return new Response(JSON.stringify({ insights: [] }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

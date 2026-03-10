import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { headers, sampleRows } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é um especialista em interpretação de planilhas financeiras brasileiras.

Sua tarefa: dado os cabeçalhos e algumas linhas de amostra de uma planilha, determine qual coluna corresponde a cada campo do sistema.

Campos do sistema:
- description: descrição/histórico da transação
- amount: valor monetário
- date: data da transação
- category: categoria/classificação
- type: tipo (receita/despesa/crédito/débito)

Regras:
- Analise tanto os nomes dos cabeçalhos quanto os valores de amostra
- Se uma coluna tem valores como "R$ 150,00" ou números, provavelmente é "amount"
- Se tem datas (10/03/2025, 2025-03-10), é "date"
- Se tem textos descritivos longos, é "description"
- Se tem palavras como "Alimentação", "Transporte", é "category"
- Se tem "Receita"/"Despesa" ou "C"/"D" ou "Crédito"/"Débito", é "type"
- Uma coluna pode não corresponder a nenhum campo — ignore-a
- description, amount e date são obrigatórios — tente sempre encontrá-los

Responda APENAS com o JSON do mapeamento, sem explicações.`;

    const userPrompt = `Cabeçalhos: ${JSON.stringify(headers)}

Amostra (primeiras 3 linhas):
${sampleRows.map((r: any, i: number) => `Linha ${i + 1}: ${JSON.stringify(r)}`).join("\n")}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "map_columns",
              description: "Map spreadsheet columns to system fields",
              parameters: {
                type: "object",
                properties: {
                  mapping: {
                    type: "object",
                    description: "Maps system field names to spreadsheet column headers",
                    properties: {
                      description: { type: "string", description: "Column header for description" },
                      amount: { type: "string", description: "Column header for monetary amount" },
                      date: { type: "string", description: "Column header for date" },
                      category: { type: "string", description: "Column header for category (optional)" },
                      type: { type: "string", description: "Column header for transaction type (optional)" },
                    },
                    required: ["description", "amount", "date"],
                    additionalProperties: false,
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence level of the mapping",
                  },
                  notes: {
                    type: "string",
                    description: "Brief note about the mapping in Portuguese",
                  },
                },
                required: ["mapping", "confidence", "notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "map_columns" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "IA não retornou mapeamento" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("map-columns error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

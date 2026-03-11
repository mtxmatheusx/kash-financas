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
            content: `Você é um parser de transações financeiras. Analise a mensagem do usuário e extraia APENAS os dados essenciais.

**REGRA CRÍTICA — INVESTIMENTOS vs RECEITAS:**
Quando o usuário diz que APLICOU, INVESTIU, COMPROU ações/cotas/títulos, colocou dinheiro em CDB/Tesouro/FII/cripto/ações/fundos etc:
- Isso é uma APLICAÇÃO/INVESTIMENTO — o dinheiro SAIU do caixa para um ativo
- Use a ferramenta "register_investment" (NÃO register_transaction)
- Exemplos que SÃO investimentos:
  - "apliquei 500 no CDB" → investment (CDB, Renda Fixa)
  - "comprei 1000 em Bitcoin" → investment (Bitcoin, Cripto)
  - "investi 2000 no Tesouro Selic" → investment (Tesouro Selic, Renda Fixa)
  - "coloquei 3000 em ações da Petrobras" → investment (Petrobras, Renda Variável)
  - "apliquei em fundo imobiliário" → investment (Fundo Imobiliário, Fundos)

Quando o usuário diz que RECEBEU rendimentos, dividendos, juros, retorno DE um investimento:
- Isso é RECEITA — dinheiro ENTROU no caixa
- Use register_transaction com type: "income", category: "Investimentos"
- Exemplos que SÃO receitas:
  - "recebi 50 de dividendos" → income
  - "rendeu 100 do CDB" → income
  - "entrou 200 de juros" → income

**REGRA CRÍTICA PARA DESCRIÇÃO:**
- A descrição deve ser CURTA e LIMPA — apenas o nome do item, pessoa ou empresa
- NUNCA inclua verbos, contexto ou frases completas na descrição
- Exemplos:
  - "recebi pagamento da Anefran" → descrição: "Anefran"
  - "gastei 50 reais no mercado" → descrição: "Mercado"
  - "paguei a conta de luz" → descrição: "Conta de luz"

Categorias válidas para despesas: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Tecnologia, Serviços, Impostos, Outros
Categorias válidas para receitas: Salário, Freelance, Vendas, Investimentos, Aluguel, Comissão, Bônus, Outros
Tipos de investimento válidos: Renda Fixa, Renda Variável, Fundos, Cripto, Imóveis, Outros

Use o contexto para inferir:
- "gastei", "paguei", "comprei" (produto/serviço, NÃO ativo financeiro), "conta de" → despesa
- "recebi", "ganhei", "entrou", "vendi" → receita
- "apliquei", "investi", "comprei" (ativo financeiro) → investimento
- Se não especificar status, assuma "paid" (pago)

**RECORRÊNCIA E PARCELAMENTO:**
- "mensalmente", "todo mês", "mensal", "por mês", "recorrente" → entry_type: "recurring", frequency: "monthly"
- "anualmente", "todo ano", "anual", "por ano" → entry_type: "recurring", frequency: "yearly"
- "em X vezes", "Xx", "parcelado em X" → entry_type: "installment", installments: X
- Se nenhuma dessas palavras aparecer → entry_type: "single"

- Se a mensagem NÃO é sobre registrar transação ou investimento, NÃO chame nenhuma ferramenta.`,
          },
          { role: "user", content: message },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "register_transaction",
              description: "Registra uma transação financeira (receita ou despesa) extraída da mensagem do usuário. NÃO use para aplicações/investimentos em ativos financeiros.",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["income", "expense"], description: "Tipo: income (receita) ou expense (despesa)" },
                  amount: { type: "number", description: "Valor em reais (positivo)" },
                  description: { type: "string", description: "Descrição curta — apenas nome do item/pessoa/empresa" },
                  category: { type: "string", description: "Categoria da transação" },
                  status: { type: "string", enum: ["paid", "pending"], description: "Status: paid ou pending" },
                  entry_type: { type: "string", enum: ["single", "installment", "recurring"], description: "Tipo de entrada" },
                  frequency: { type: "string", enum: ["monthly", "yearly"], description: "Frequência se recurring" },
                  installments: { type: "number", description: "Número de parcelas se installment" },
                },
                required: ["type", "amount", "description", "category", "status"],
                additionalProperties: false,
              },
            },
          },
          {
            type: "function",
            function: {
              name: "register_investment",
              description: "Registra uma aplicação/investimento financeiro. Use quando o usuário diz que APLICOU, INVESTIU ou COMPROU um ativo financeiro (CDB, ações, Tesouro, cripto, FII, fundos etc). O dinheiro SAI do caixa para um ativo.",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Nome do ativo (ex: CDB Banco X, Petrobras, Bitcoin)" },
                  amount: { type: "number", description: "Valor aplicado (positivo)" },
                  investment_type: { type: "string", enum: ["Renda Fixa", "Renda Variável", "Fundos", "Cripto", "Imóveis", "Outros"], description: "Tipo do investimento" },
                },
                required: ["name", "amount", "investment_type"],
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
      return new Response(JSON.stringify({ transaction: null, investment: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.name === "register_transaction") {
      const transaction = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ transaction, investment: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (toolCall?.function?.name === "register_investment") {
      const inv = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ transaction: null, investment: inv }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ transaction: null, investment: null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-transaction error:", e);
    return new Response(JSON.stringify({ transaction: null, investment: null }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

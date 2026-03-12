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
            content: `You are a multilingual financial transaction parser. Analyze the user's message in ANY language and extract ONLY essential data.

**CRITICAL RULE — INVESTMENTS vs INCOME vs EXPENSES:**

When the user says they INVESTED, APPLIED, BOUGHT financial assets (stocks, bonds, crypto, treasury, savings bond, CDB, FII, funds, ETFs):
- This is an INVESTMENT — money LEFT the account into a financial asset
- Use the "register_investment" tool (NOT register_transaction)
- Examples:
  - "I invested 500 in a savings bond" → investment (Savings Bond, Renda Fixa)
  - "apliquei 500 no CDB" → investment (CDB, Renda Fixa)
  - "bought 1000 in Bitcoin" → investment (Bitcoin, Cripto)
  - "investi 2000 no Tesouro Selic" → investment (Tesouro Selic, Renda Fixa)
  - "put 3000 in Petrobras shares" → investment (Petrobras, Renda Variável)
  - "I put money in a mutual fund" → investment (Mutual Fund, Fundos)

When the user says they RECEIVED dividends, returns, interest, yield FROM an investment:
- This is INCOME — money ENTERED the account
- Use register_transaction with type: "income", category: "Investimentos"
- Examples:
  - "received 50 in dividends" → income
  - "recebi 50 de dividendos" → income
  - "got 100 interest from my bond" → income

When the user says they SPENT, PAID, BOUGHT (goods/services, NOT financial assets):
- This is an EXPENSE
- Examples:
  - "spent 50 on groceries" → expense, Alimentação
  - "gastei 50 no mercado" → expense, Alimentação
  - "paid 150 electric bill" → expense, Moradia

**CRITICAL RULE FOR DESCRIPTION:**
- Description must be SHORT and CLEAN — only the item/person/company name
- NEVER include verbs, context, or full sentences
- Examples:
  - "received payment from Acme Corp" → description: "Acme Corp"
  - "I spent 50 at the grocery store" → description: "Grocery store"

Valid expense categories: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Vestuário, Tecnologia, Serviços, Impostos, Outros
Valid income categories: Salário, Freelance, Vendas, Investimentos, Aluguel, Comissão, Bônus, Outros
Valid investment types: Renda Fixa, Renda Variável, Fundos, Cripto, Imóveis, Outros

Context clues (multilingual):
- "spent", "paid", "bought" (goods), "gastei", "paguei" → expense
- "received", "earned", "got", "recebi", "ganhei" → income
- "invested", "applied", "bought" (financial asset), "apliquei", "investi" → investment
- If status not specified, assume "paid"

**RECURRENCE & INSTALLMENTS:**
- "monthly", "every month", "mensalmente", "todo mês" → entry_type: "recurring", frequency: "monthly"
- "yearly", "annually", "anualmente" → entry_type: "recurring", frequency: "yearly"
- "in X installments", "em X vezes", "Xx" → entry_type: "installment", installments: X
- If none → entry_type: "single"

- If the message is NOT about recording a transaction or investment, do NOT call any tool.`,
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, type } = await req.json();
    if (!description || description.trim().length < 2) {
      return new Response(JSON.stringify({ category: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const expenseCats = "Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Vestuário, Tecnologia, Serviços, Impostos, Fornecedores, Funcionários, Marketing, Infraestrutura, Outros";
    const incomeCats = "Salário, Freelance, Vendas, Serviços, Aluguel, Dividendos, Comissão, Bônus, Outros";
    const cats = type === "expense" ? expenseCats : incomeCats;

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
            content: `Você categoriza transações financeiras. Dada uma descrição, responda APENAS com o nome da categoria mais adequada. Categorias válidas: ${cats}. Responda apenas o nome da categoria, sem explicação.`,
          },
          { role: "user", content: description },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI error:", response.status);
      return new Response(JSON.stringify({ category: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || null;
    // Clean up: remove quotes, periods, extra whitespace
    const category = raw?.replace(/['".\n]/g, "").trim() || null;

    return new Response(JSON.stringify({ category }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("suggest-category error:", e);
    return new Response(JSON.stringify({ category: null }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

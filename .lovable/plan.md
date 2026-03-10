

# Plano: Redesign Agressivo da Landing Page Kash

## Diagnóstico

A landing page atual é genérica e corporativa — fundo claro, features técnicas (DRE, EBITDA), copy descritiva. O diferencial do WhatsApp/Copiloto IA não aparece. Precisamos transformar isso num funil de alta conversão com visual dark/tech e copy transformacional.

## O que muda

### 1. Visual Dark Mode Forçado na Landing
- Forçar `dark` class no container da landing (independente do tema do app)
- Fundo ultra-escuro (#050505) com textura noise sutil via CSS
- Cor de destaque neon: ciano `#00FFCC` para ícones e badges secundários
- CTA principal em vermelho suave (`#FF4D6A`) para urgência
- Manter azul primary para elementos de marca

### 2. Hero Section — Copy Transformacional
- **Headline**: "O Controle Financeiro Que Vive Onde Você Já Está."
- **Subheadline**: Foco no WhatsApp, zero atrito, sem apps para baixar
- **Badge**: "Novo: Copiloto por WhatsApp" com ícone do WhatsApp
- **CTA Principal**: "Ativar Meu Copiloto (30 Dias Grátis)" em vermelho suave
- **CTA Secundário**: "Ver como funciona" em ciano outline

### 3. Seção "3 Passos de Esforço Zero" (substitui features genéricas)
Três cards grandes com numeração:
1. **Fale no WhatsApp** — "Manda um áudio: 'Gastei 50 reais de gasolina'"
2. **IA Categoriza Tudo** — "Categoriza, ajusta saldo, injeta no dashboard"
3. **Receba Estratégias** — "A IA cruza dados e sugere onde cortar ou investir"

### 4. Seção de Pricing — Ancoragem de Valor
- Adicionar texto de ancoragem: "Um consultor financeiro + consultor de vendas = R$ 5.000/mês"
- Plano Gratuito: "Registre seus gastos" — CTA grande em vermelho "Começar Teste de 30 Dias"
- Plano Premium: "Consultor de Vendas IA ativado" — CTA secundário em ciano
- Remover jargões (DRE, EBITDA) da lista visível, substituir por benefícios

### 5. Seção de Prova Social (substituir stats genéricos)
- Manter os números mas com visual neon/glow
- Adicionar frase de impacto acima

### 6. Final CTA
- Copy: "Seu Copiloto Financeiro Está Esperando"
- Sub: "30 dias grátis. Sem cartão. Cancele quando quiser."

## Arquivos afetados
- `src/pages/Landing.tsx` — reescrita completa da page
- `src/index.css` — adicionar classes utilitárias para noise texture e neon glow

## O que NÃO muda
- Nenhuma alteração no banco de dados (referral_code e referred_by já existem)
- Nenhuma alteração em rotas, auth, ou componentes internos do app
- O tema dark/light do app continua igual — só a landing é forçada dark


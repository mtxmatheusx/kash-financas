

# Finanças Vereda — App de Finanças Pessoais

Um app de finanças pessoais minimalista, inspirado no conceito brasileiro de simplicidade e clareza. Sem dashboards poluídos, sem gráficos de pizza — apenas um feed cronológico do seu dinheiro.

---

## Tela Principal — O Feed Financeiro

- **Topo fixo**: Saldo atual em destaque (DM Sans, grande) + botão `+` verde
- **Feed cronológico**: Transações agrupadas por dia, rolagem infinita para o passado
- **Cada bloco de dia** mostra a data e as transações com valor, categoria (texto simples) e tipo (entrada em verde cerrado, saída em carvão)
- Fundo `Branco Queimado (#F7F5F2)`, texto `Chumbo (#1C1C1C)`

## Adicionar Transação — O Momento Assinatura

- Toque no `+`: tela escurece, campo numérico centralizado aparece com teclado ativo
- Usuário digita o valor → confirma → aparecem categorias minimalistas em texto:
  - **Despesas**: Alimentação, Transporte, Casa, Saúde, Lazer, Outros
  - **Receitas**: Salário, Freelance, Outros
- Toggle simples para alternar entre Entrada/Saída
- Transação salva instantaneamente no feed

## Resumo Semanal

- A cada 7 dias, um card especial aparece no feed com um resumo em texto natural:
  - *"Nesta semana você gastou R$ 850. 45% foi com alimentação."*
- Sem gráficos — apenas texto reflexivo
- Mostra total de entradas, saídas e saldo da semana

## Navegação Temporal

- Puxar para baixo revela um seletor de mês/ano minimalista
- Permite navegar rapidamente para meses anteriores

## Categorias Empresariais (inspirado nos docs)

- Além das categorias pessoais, incluir categorias empresariais:
  - Fornecedores, Impostos, Funcionários, Marketing, Infraestrutura
- Toggle no topo para alternar entre "Pessoal" e "Empresa"

## Armazenamento

- Dados salvos localmente no navegador (localStorage) para teste rápido sem necessidade de conta
- Possibilidade futura de conectar backend

## Design System

- **Fontes**: DM Sans (títulos/números) + Inter (textos de apoio)
- **Cores**: Branco Queimado `#F7F5F2`, Chumbo `#1C1C1C`, Verde Cerrado `#00875F`, Carvão `#333`, Cinza Pedra `#EAE8E5`
- **Layout**: Coluna única, mobile-first
- **Sem ícones** para categorias — apenas texto


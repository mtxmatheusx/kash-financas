import type { TranslationKey } from "@/i18n/translations";

/** Maps stored Portuguese category names to i18n translation keys */
const CATEGORY_MAP: Record<string, TranslationKey> = {
  // Income
  "Salário": "cat.income.salary",
  "Freelance": "cat.income.freelance",
  "Vendas": "cat.income.sales",
  "Serviços": "cat.income.services",
  "Aluguel": "cat.income.rent",
  "Dividendos": "cat.income.dividends",
  // Expense - Personal
  "Alimentação": "cat.expense.food",
  "Transporte": "cat.expense.transport",
  "Moradia": "cat.expense.housing",
  "Saúde": "cat.expense.health",
  "Lazer": "cat.expense.leisure",
  "Educação": "cat.expense.education",
  // Expense - Business
  "Fornecedores": "cat.expense.suppliers",
  "Impostos": "cat.expense.taxes",
  "Funcionários": "cat.expense.employees",
  "Marketing": "cat.expense.marketing",
  "Infraestrutura": "cat.expense.infrastructure",
  // Shared
  "Outros": "cat.expense.other",
  // DRE Expense Groups
  "Despesas com Pessoal": "cat.dre.personnel",
  "Despesas Administrativas": "cat.dre.admin",
  "Despesas Comerciais": "cat.dre.commercial",
  "Impostos e Taxas": "cat.dre.taxes",
  "Outras Despesas": "cat.dre.otherExpenses",
  // Extra categories
  "Casa": "cat.expense.housing",
  // Investment Types
  "Renda Fixa": "cat.invest.fixedIncome",
  "Renda Variável": "cat.invest.variableIncome",
  "Fundos": "cat.invest.funds",
  "Cripto": "cat.invest.crypto",
  "Imóveis": "cat.invest.realEstate",
};

/**
 * Translates a stored category name using the t() function.
 * Falls back to the original name if no mapping exists.
 */
export function translateCategory(name: string, t: (key: TranslationKey) => string): string {
  const key = CATEGORY_MAP[name];
  return key ? t(key) : name;
}

export type TransactionType = 'income' | 'expense';
export type AppMode = 'personal' | 'business';

export const PERSONAL_EXPENSE_CATEGORIES = [
  'Alimentação', 'Transporte', 'Casa', 'Saúde', 'Lazer', 'Outros'
] as const;

export const PERSONAL_INCOME_CATEGORIES = [
  'Salário', 'Freelance', 'Outros'
] as const;

export const BUSINESS_EXPENSE_CATEGORIES = [
  'Fornecedores', 'Impostos', 'Funcionários', 'Marketing', 'Infraestrutura', 'Outros'
] as const;

export const BUSINESS_INCOME_CATEGORIES = [
  'Vendas', 'Serviços', 'Outros'
] as const;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  mode: AppMode;
  date: string; // ISO date string
  createdAt: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  topCategory: string;
  topCategoryPercent: number;
}

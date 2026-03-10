export interface TransactionRow {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'paid' | 'pending';
  account_type: 'personal' | 'business';
  entry_type?: 'single' | 'installment' | 'recurring';
  installments?: number;
  frequency?: 'monthly' | 'yearly';
  created_at: string;
}

export interface InvestmentRow {
  id: string;
  name: string;
  type: string;
  amount: number;
  current_value: number;
  date: string;
  account_type: 'personal' | 'business';
  created_at: string;
}

export interface GoalRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  account_type: 'personal' | 'business';
  created_at: string;
}

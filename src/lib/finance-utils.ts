import { Transaction, WeeklySummary } from './types';
import { startOfWeek, endOfWeek, format, isWithinInterval, parseISO, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd 'de' MMMM", { locale: ptBR });
}

export function formatDayHeader(dateStr: string): string {
  const date = parseISO(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Hoje';
  if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Ontem';
  return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export function groupTransactionsByDay(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  for (const tx of sorted) {
    const day = tx.date.slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(tx);
  }

  return groups;
}

export function getWeeklySummary(transactions: Transaction[], weeksAgo = 0): WeeklySummary | null {
  const now = new Date();
  const targetDate = subWeeks(now, weeksAgo);
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

  const weekTxs = transactions.filter(t =>
    isWithinInterval(parseISO(t.date), { start: weekStart, end: weekEnd })
  );

  if (weekTxs.length === 0) return null;

  const totalIncome = weekTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = weekTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  for (const t of weekTxs.filter(t => t.type === 'expense')) {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  }

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const topCategoryPercent = topCategory && totalExpense > 0
    ? Math.round((topCategory[1] / totalExpense) * 100)
    : 0;

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    topCategory: topCategory?.[0] || '',
    topCategoryPercent,
  };
}

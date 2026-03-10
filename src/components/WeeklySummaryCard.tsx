import { Transaction } from '@/lib/types';
import { getWeeklySummary, formatCurrency } from '@/lib/finance-utils';

interface WeeklySummaryCardProps {
  transactions: Transaction[];
}

export function WeeklySummaryCard({ transactions }: WeeklySummaryCardProps) {
  const summary = getWeeklySummary(transactions, 0);
  if (!summary) return null;

  const narrative = summary.totalExpense > 0
    ? `Nesta semana você gastou ${formatCurrency(summary.totalExpense)}.${
        summary.topCategory
          ? ` ${summary.topCategoryPercent}% foi com ${summary.topCategory.toLowerCase()}.`
          : ''
      }`
    : `Nesta semana você não teve despesas.`;

  return (
    <div className="rounded-xl bg-card border border-border p-5 animate-slide-up">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-display">
        Resumo da semana
      </p>
      <p className="text-base text-card-foreground leading-relaxed mb-4">
        {narrative}
      </p>
      <div className="flex gap-6 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-0.5">Entradas</p>
          <p className="font-display font-semibold text-income">{formatCurrency(summary.totalIncome)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-0.5">Saídas</p>
          <p className="font-display font-semibold text-expense">{formatCurrency(summary.totalExpense)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-0.5">Saldo</p>
          <p className={`font-display font-semibold ${summary.balance >= 0 ? 'text-income' : 'text-destructive'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

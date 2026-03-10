import { Transaction } from '@/lib/types';
import { formatCurrency, formatDayHeader, groupTransactionsByDay } from '@/lib/finance-utils';

interface TransactionFeedProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export function TransactionFeed({ transactions, onDelete }: TransactionFeedProps) {
  const grouped = groupTransactionsByDay(transactions);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="font-display text-lg mb-1">Nenhuma transação</p>
        <p className="text-sm">Toque no + para começar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([day, txs]) => (
        <div key={day} className="animate-fade-in">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-display">
            {formatDayHeader(day)}
          </p>
          <div className="space-y-2">
            {txs.map(tx => (
              <button
                key={tx.id}
                onClick={() => {
                  if (confirm('Excluir esta transação?')) onDelete(tx.id);
                }}
                className="w-full flex items-center justify-between py-3 px-4 rounded-lg bg-card hover:bg-card/80 transition-colors text-left group"
              >
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {tx.category}
                  </p>
                </div>
                <p className={`font-display font-semibold text-base tabular-nums ${
                  tx.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
                </p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

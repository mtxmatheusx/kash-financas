import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { BalanceHeader } from '@/components/BalanceHeader';
import { TransactionFeed } from '@/components/TransactionFeed';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { WeeklySummaryCard } from '@/components/WeeklySummaryCard';
import { MonthSelector } from '@/components/MonthSelector';

const Index = () => {
  const { transactions, balance, mode, setMode, addTransaction, deleteTransaction } = useTransactions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const filteredByMonth = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  const monthBalance = useMemo(() => {
    return filteredByMonth.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [filteredByMonth]);

  return (
    <div className="min-h-screen bg-background">
      <BalanceHeader
        balance={balance}
        mode={mode}
        onModeChange={setMode}
        onAddClick={() => setDialogOpen(true)}
      />

      <main className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Month navigation toggle */}
        <button
          onClick={() => setShowMonthSelector(!showMonthSelector)}
          className="text-xs uppercase tracking-widest text-muted-foreground font-display hover:text-foreground transition-colors"
        >
          {showMonthSelector ? '✕ Fechar' : '↕ Navegar por mês'}
        </button>

        {showMonthSelector && (
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
        )}

        {/* Weekly Summary */}
        <WeeklySummaryCard transactions={transactions} />

        {/* Transaction Feed */}
        <TransactionFeed
          transactions={filteredByMonth}
          onDelete={deleteTransaction}
        />
      </main>

      <AddTransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={mode}
        onAdd={addTransaction}
      />
    </div>
  );
};

export default Index;

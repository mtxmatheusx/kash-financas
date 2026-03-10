import { formatCurrency } from '@/lib/finance-utils';
import { AppMode } from '@/lib/types';

interface BalanceHeaderProps {
  balance: number;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onAddClick: () => void;
}

export function BalanceHeader({ balance, mode, onModeChange, onAddClick }: BalanceHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-5 pt-8 pb-5">
      <div className="max-w-lg mx-auto">
        {/* Mode Toggle */}
        <div className="flex gap-1 mb-6 bg-card rounded-lg p-1 w-fit">
          <button
            onClick={() => onModeChange('personal')}
            className={`px-4 py-1.5 rounded-md text-sm font-display font-medium transition-all ${
              mode === 'personal'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Pessoal
          </button>
          <button
            onClick={() => onModeChange('business')}
            className={`px-4 py-1.5 rounded-md text-sm font-display font-medium transition-all ${
              mode === 'business'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Empresa
          </button>
        </div>

        {/* Balance */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              Saldo atual
            </p>
            <p className={`text-4xl font-display font-bold tracking-tight ${
              balance >= 0 ? 'text-income' : 'text-destructive'
            }`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <button
            onClick={onAddClick}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-display font-light shadow-lg hover:shadow-xl transition-shadow active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </header>
  );
}

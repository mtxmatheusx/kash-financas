import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthSelectorProps {
  selectedMonth: number; // 0-11
  selectedYear: number;
  onChange: (month: number, year: number) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2024, i, 1), 'MMM', { locale: ptBR })
);

export function MonthSelector({ selectedMonth, selectedYear, onChange }: MonthSelectorProps) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onChange(selectedMonth, selectedYear - 1)}
          className="text-muted-foreground hover:text-foreground font-display text-sm px-2 py-1"
        >
          ← {selectedYear - 1}
        </button>
        <span className="font-display font-semibold text-foreground">{selectedYear}</span>
        <button
          onClick={() => onChange(selectedMonth, selectedYear + 1)}
          className="text-muted-foreground hover:text-foreground font-display text-sm px-2 py-1"
        >
          {selectedYear + 1} →
        </button>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {MONTHS.map((m, i) => (
          <button
            key={i}
            onClick={() => onChange(i, selectedYear)}
            className={`py-2 rounded-md text-sm font-display capitalize transition-colors ${
              i === selectedMonth
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

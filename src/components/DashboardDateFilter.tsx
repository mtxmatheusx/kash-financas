import React, { useState } from "react";
import { format, startOfDay, subDays, startOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

interface Props {
  filter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
  customRange: { from?: Date; to?: Date };
  onCustomRangeChange: (range: { from?: Date; to?: Date }) => void;
}

const chips: { key: DateFilter; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
];

export function getDateRange(filter: DateFilter, customRange: { from?: Date; to?: Date }) {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { from: startOfDay(now), to: now };
    case 'yesterday': {
      const y = subDays(now, 1);
      return { from: startOfDay(y), to: startOfDay(now) };
    }
    case 'week':
      return { from: startOfWeek(now, { weekStartsOn: 0 }), to: now };
    case 'month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'custom':
      return { from: customRange.from, to: customRange.to };
    default:
      return { from: undefined, to: undefined };
  }
}

export const DashboardDateFilter: React.FC<Props> = ({ filter, onFilterChange, customRange, onCustomRangeChange }) => {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {chips.map(c => (
        <button
          key={c.key}
          onClick={() => onFilterChange(c.key)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            filter === c.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {c.label}
        </button>
      ))}

      <Popover open={calOpen} onOpenChange={setCalOpen}>
        <PopoverTrigger asChild>
          <button
            onClick={() => { onFilterChange('custom'); setCalOpen(true); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5",
              filter === 'custom'
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            <CalendarIcon className="w-3 h-3" />
            {filter === 'custom' && customRange.from
              ? `${format(customRange.from, 'dd/MM', { locale: ptBR })}${customRange.to ? ` - ${format(customRange.to, 'dd/MM', { locale: ptBR })}` : ''}`
              : 'Período'}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: customRange.from, to: customRange.to }}
            onSelect={(range) => {
              onCustomRangeChange({ from: range?.from, to: range?.to });
              if (range?.from && range?.to) setCalOpen(false);
            }}
            numberOfMonths={1}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

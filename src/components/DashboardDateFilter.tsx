import React, { useRef, useState, useEffect } from "react";
import { format, startOfDay, subDays, startOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { ptBR, enUS, es as esLocale } from "date-fns/locale";
import { usePreferences } from "@/contexts/PreferencesContext";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

export type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom';

interface Props {
  filter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
  customRange: { from?: Date; to?: Date };
  onCustomRangeChange: (range: { from?: Date; to?: Date }) => void;
}

export function getDateRange(filter: DateFilter, customRange: { from?: Date; to?: Date }) {
  const now = new Date();
  switch (filter) {
    case 'today': return { from: startOfDay(now), to: now };
    case 'yesterday': { const y = subDays(now, 1); return { from: startOfDay(y), to: startOfDay(now) }; }
    case 'week': return { from: startOfWeek(now, { weekStartsOn: 1 }), to: now };
    case 'month': return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'custom': return { from: customRange.from, to: customRange.to };
    default: return { from: undefined, to: undefined };
  }
}

export const DashboardDateFilter: React.FC<Props> = ({ filter, onFilterChange, customRange, onCustomRangeChange }) => {
  const { t, language } = usePreferences();
  const dateLocale = language === "en" ? enUS : language === "es" ? esLocale : ptBR;
  const [calOpen, setCalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const chips: { key: DateFilter; label: string }[] = [
    { key: 'all', label: t("dateFilter.all") },
    { key: 'today', label: t("dateFilter.today") },
    { key: 'yesterday', label: t("dateFilter.yesterday") },
    { key: 'week', label: t("dateFilter.week") },
    { key: 'month', label: t("dateFilter.month") },
  ];

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [filter]);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-3 px-3 md:mx-0 md:px-0 pb-0.5"
    >
      <div className="flex items-center gap-1 rounded-full bg-muted/60 p-1 border border-border/50">
        {chips.map(c => {
          const isActive = filter === c.key;
          return (
            <button
              key={c.key}
              ref={isActive ? activeRef : undefined}
              onClick={() => onFilterChange(c.key)}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="date-filter-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{c.label}</span>
            </button>
          );
        })}

        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <button
              onClick={() => { onFilterChange('custom'); setCalOpen(true); }}
              className={cn(
                "relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1.5 whitespace-nowrap",
                filter === 'custom'
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === 'custom' && (
                <motion.div
                  layoutId="date-filter-pill"
                  className="absolute inset-0 bg-primary rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <CalendarIcon className="w-3 h-3" />
                {filter === 'custom' && customRange.from
                  ? `${format(customRange.from, 'dd/MM', { locale: dateLocale })}${customRange.to ? ` – ${format(customRange.to, 'dd/MM', { locale: dateLocale })}` : ''}`
                  : t("dateFilter.period")}
              </span>
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
              locale={dateLocale}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

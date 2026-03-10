import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; label: string };
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="rounded-xl border border-border bg-card p-5 enterprise-shadow hover:enterprise-shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-full",
          trend.value >= 0 ? "bg-fin-income/10 text-fin-income" : "bg-fin-expense/10 text-fin-expense"
        )}>
          {trend.value >= 0 ? '+' : ''}{trend.value}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
    <p className="text-xl font-bold font-mono-fin text-card-foreground">{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </div>
);

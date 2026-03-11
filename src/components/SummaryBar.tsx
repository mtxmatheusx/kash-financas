import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  color: "income" | "expense" | "pending" | "primary" | "investment";
}

interface SummaryBarProps {
  items: SummaryItem[];
}

const colorMap = {
  income: {
    bg: "bg-fin-income/8",
    border: "border-fin-income/20",
    accent: "bg-fin-income",
    text: "text-fin-income",
    glow: "shadow-[0_0_12px_hsl(var(--fin-income)/0.12)]",
  },
  expense: {
    bg: "bg-fin-expense/8",
    border: "border-fin-expense/20",
    accent: "bg-fin-expense",
    text: "text-fin-expense",
    glow: "shadow-[0_0_12px_hsl(var(--fin-expense)/0.12)]",
  },
  pending: {
    bg: "bg-fin-pending/8",
    border: "border-fin-pending/20",
    accent: "bg-fin-pending",
    text: "text-fin-pending",
    glow: "shadow-[0_0_12px_hsl(var(--fin-pending)/0.12)]",
  },
  primary: {
    bg: "bg-primary/8",
    border: "border-primary/20",
    accent: "bg-primary",
    text: "text-primary",
    glow: "shadow-[0_0_12px_hsl(var(--primary)/0.12)]",
  },
  investment: {
    bg: "bg-fin-investment/8",
    border: "border-fin-investment/20",
    accent: "bg-fin-investment",
    text: "text-fin-investment",
    glow: "shadow-[0_0_12px_hsl(var(--fin-investment)/0.12)]",
  },
};

export const SummaryBar: React.FC<SummaryBarProps> = ({ items }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {items.map((item, i) => {
      const c = colorMap[item.color];
      const Icon = item.icon;
      return (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className={cn(
            "relative rounded-xl border bg-card p-4 md:p-5 overflow-hidden",
            c.border,
            c.glow,
          )}
        >
          {/* Accent dot */}
          <div className={cn("absolute top-3 right-3 w-2 h-2 rounded-full", c.accent, "opacity-60")} />

          <div className="flex items-center gap-1.5 mb-1.5">
            {Icon && <Icon className={cn("w-3.5 h-3.5", c.text, "opacity-70")} />}
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {item.label}
            </p>
          </div>
          <p className={cn("text-lg md:text-xl font-bold font-mono-fin tracking-tight", c.text)}>
            {item.value}
          </p>

          {/* Subtle gradient overlay */}
          <div className={cn("absolute inset-0 rounded-xl opacity-[0.04] pointer-events-none", c.bg)} />
        </motion.div>
      );
    })}
  </div>
);

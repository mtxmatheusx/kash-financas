import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { staggerItem } from "@/components/PageTransition";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: number; label: string };
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <motion.div
    variants={staggerItem}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className="rounded-xl border border-border bg-card p-5 enterprise-shadow hover:enterprise-shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between mb-3">
      <motion.div
        className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}
        whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      {trend && (
        <motion.span
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.value >= 0 ? "bg-fin-income/10 text-fin-income" : "bg-fin-expense/10 text-fin-expense"
          )}
        >
          {trend.value >= 0 ? '+' : ''}{trend.value}%
        </motion.span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
    <motion.p
      className="text-xl font-bold font-display text-card-foreground"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.3 }}
    >
      {value}
    </motion.p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </motion.div>
);

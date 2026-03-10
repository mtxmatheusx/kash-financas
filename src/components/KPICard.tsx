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
    whileHover={{ y: -2, transition: { duration: 0.15 } }}
    className="rounded-xl border border-border bg-card p-3 md:p-4 cockpit-glow hover:border-primary/20 transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-2.5">
      <motion.div
        className={cn("w-9 h-9 rounded-lg flex items-center justify-center", color)}
        whileHover={{ rotate: [0, -6, 6, 0], transition: { duration: 0.35 } }}
      >
        <Icon className="w-4 h-4" />
      </motion.div>
      {trend && (
        <motion.span
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            trend.value >= 0 ? "bg-fin-income/10 text-fin-income" : "bg-fin-expense/10 text-fin-expense"
          )}
        >
          {trend.value >= 0 ? '+' : ''}{trend.value}%
        </motion.span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">{title}</p>
    <motion.p
      className="text-lg font-bold font-display text-card-foreground tracking-tight"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.25 }}
    >
      {value}
    </motion.p>
    {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
  </motion.div>
);

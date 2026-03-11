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
    className="card-interactive p-3 sm:p-4"
  >
    <div className="flex items-start justify-between mb-2 sm:mb-3">
      <motion.div
        className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center", color)}
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
    <p className="text-label mb-0.5">{title}</p>
    <motion.p
      className="text-value text-card-foreground"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.25 }}
    >
      {value}
    </motion.p>
    {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
  </motion.div>
);

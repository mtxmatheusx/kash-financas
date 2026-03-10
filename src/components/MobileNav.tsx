import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/receitas", label: "Receitas", icon: TrendingUp },
  { path: "/despesas", label: "Despesas", icon: TrendingDown },
  { path: "/investimentos", label: "Investir", icon: PieChart },
  { path: "/metas", label: "Metas", icon: Target },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl text-[10px] font-medium transition-all duration-200 min-w-[52px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors",
                isActive && "bg-primary/10"
              )}>
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

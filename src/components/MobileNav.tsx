import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target,
  CalendarRange, Compass, FileText, Calculator, Upload, MoreHorizontal, X, UserCog, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccount } from "@/contexts/AccountContext";
import { AnimatePresence, motion } from "framer-motion";

const mainItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/receitas", label: "Receitas", icon: TrendingUp },
  { path: "/despesas", label: "Despesas", icon: TrendingDown },
  { path: "/investimentos", label: "Investir", icon: PieChart },
];

const moreItems = [
  { path: "/metas", label: "Metas", icon: Target },
  { path: "/planejamento", label: "Planejamento", icon: Compass },
  { path: "/mensal", label: "Visão Mensal", icon: CalendarRange },
  { path: "/dre", label: "DRE", icon: FileText, account: "business" as const },
  { path: "/ebitda", label: "EBITDA", icon: Calculator, account: "business" as const },
  { path: "/importar", label: "Importar", icon: Upload },
  { path: "/configuracoes", label: "Configurações", icon: Settings },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const { account } = useAccount();

  const filteredMore = moreItems.filter(
    (item) => !item.account || item.account === account.type
  );

  const isMoreActive = filteredMore.some((item) => location.pathname === item.path);

  return (
    <>
      {/* More menu overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className="fixed bottom-[60px] left-3 right-3 z-50 md:hidden rounded-2xl bg-card border border-border p-3 safe-area-bottom"
              style={{
                boxShadow: '0 -10px 40px -10px hsl(var(--primary) / 0.15), 0 -4px 20px -8px rgba(0,0,0,0.3)',
              }}
            >
              <div className="grid grid-cols-3 gap-2">
                {filteredMore.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground active:bg-accent/50 active:scale-95"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around px-2 pt-1.5 pb-1">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:scale-95"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                </div>
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all duration-200",
              showMore || isMoreActive
                ? "text-primary"
                : "text-muted-foreground active:scale-95"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                (showMore || isMoreActive) && "bg-primary/10"
              )}
            >
              {showMore ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5]")} />
              )}
            </div>
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};

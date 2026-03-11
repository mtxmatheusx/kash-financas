import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target,
  CalendarRange, Compass, FileText, Calculator, Upload, MoreHorizontal, X, Settings,
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
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
              className="fixed bottom-[52px] left-2 right-2 z-50 md:hidden rounded-2xl bg-card border border-border/60 p-2 safe-area-bottom"
              style={{
                boxShadow: '0 -8px 30px -8px rgba(0,0,0,0.2)',
              }}
            >
              <div className="grid grid-cols-4 gap-1">
                {filteredMore.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground active:bg-accent/50 active:scale-95"
                      )}
                    >
                      <item.icon className={cn("w-4.5 h-4.5", isActive && "stroke-[2.5]")} />
                      <span className="truncate max-w-full text-center leading-tight">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar — compact */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 safe-area-bottom"
        role="navigation"
        aria-label="Menu principal"
        style={{ background: 'hsl(var(--card) / 0.97)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center justify-around px-1 h-[52px]">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
                <item.icon className={cn("w-[18px] h-[18px]", isActive && "stroke-[2.5]")} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors",
              showMore || isMoreActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}
          >
            {(showMore || isMoreActive) && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
              />
            )}
            {showMore ? (
              <X className="w-[18px] h-[18px] stroke-[2.5]" />
            ) : (
              <MoreHorizontal className={cn("w-[18px] h-[18px]", isMoreActive && "stroke-[2.5]")} />
            )}
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};

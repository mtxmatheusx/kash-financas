import React, { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart,
  MoreHorizontal, X, Target, CalendarRange, Compass,
  FileText, Calculator, Upload, Settings, ChevronRight,
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
  { path: "/metas", label: "Metas", icon: Target, desc: "Objetivos financeiros" },
  { path: "/planejamento", label: "Planejamento", icon: Compass, desc: "Análise e recomendações" },
  { path: "/mensal", label: "Visão Mensal", icon: CalendarRange, desc: "Comparativo mensal" },
  { path: "/dre", label: "DRE", icon: FileText, account: "business" as const, desc: "Demonstrativo de resultado" },
  { path: "/ebitda", label: "EBITDA", icon: Calculator, account: "business" as const, desc: "Lucro operacional" },
  { path: "/importar", label: "Importar", icon: Upload, desc: "Planilhas e extratos" },
  { path: "/configuracoes", label: "Configurações", icon: Settings, desc: "Conta e preferências" },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const { account } = useAccount();

  const filteredMore = moreItems.filter(
    (item) => !item.account || item.account === account.type
  );

  const isMoreActive = filteredMore.some((item) => location.pathname === item.path);
  const closeMenu = useCallback(() => setShowMore(false), []);

  return (
    <>
      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 380 }}
              className="fixed bottom-[56px] inset-x-0 z-50 md:hidden"
            >
              <div className="mx-3 mb-1 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
                {/* Handle */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
                </div>
                <nav className="px-1.5 pb-1.5 space-y-0.5" role="menu" aria-label="Menu adicional">
                  {filteredMore.map((item, i) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                      >
                        <NavLink
                          to={item.path}
                          onClick={closeMenu}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98]",
                            isActive ? "bg-primary/10" : "active:bg-accent/60"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            isActive ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"
                          )}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[13px] font-medium leading-tight",
                              isActive ? "text-primary" : "text-foreground"
                            )}>{item.label}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{item.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/30" />
                        </NavLink>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 safe-area-bottom"
        role="navigation"
        aria-label="Menu principal"
        style={{
          background: 'hsl(var(--card) / 0.92)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        }}
      >
        <div className="flex items-stretch h-[56px]">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute top-0 inset-x-[25%] h-[2px] rounded-b-full bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn(isActive && "font-semibold")}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More */}
          <button
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            aria-haspopup="menu"
            className={cn(
              "relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors",
              showMore || isMoreActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}
          >
            {(showMore || isMoreActive) && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute top-0 inset-x-[25%] h-[2px] rounded-b-full bg-primary"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <motion.div animate={{ rotate: showMore ? 90 : 0 }} transition={{ duration: 0.15 }}>
              {showMore ? <X className="w-5 h-5 stroke-[2.5]" /> : <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5]")} />}
            </motion.div>
            <span className={cn((showMore || isMoreActive) && "font-semibold")}>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};

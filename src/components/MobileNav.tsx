import React, { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target,
  CalendarRange, Compass, FileText, Calculator, Upload, MoreHorizontal, X, Settings,
  ChevronRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 400, damping: 28 } },
  exit: { opacity: 0, x: -8 },
};

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
      {/* More menu — full-width bottom sheet style */}
      <AnimatePresence>
        {showMore && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/70 backdrop-blur-md z-40 md:hidden"
              onClick={closeMenu}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="fixed bottom-[52px] inset-x-0 z-50 md:hidden safe-area-bottom"
            >
              <div
                className="mx-2 rounded-2xl border border-border/40 overflow-hidden"
                style={{
                  background: 'hsl(var(--card))',
                  boxShadow: '0 -12px 40px -8px rgba(0,0,0,0.25), 0 0 0 1px hsl(var(--border) / 0.1)',
                }}
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-2.5 pb-1">
                  <div className="w-8 h-1 rounded-full bg-muted-foreground/20" />
                </div>

                {/* Menu items as list */}
                <motion.nav
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="px-2 pb-2"
                  role="menu"
                  aria-label="Menu adicional"
                >
                  {filteredMore.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div key={item.path} variants={itemVariants}>
                        <NavLink
                          to={item.path}
                          onClick={closeMenu}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-[0.98]",
                            isActive
                              ? "bg-primary/10"
                              : "hover:bg-accent/40 active:bg-accent/60"
                          )}
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isActive
                              ? "bg-primary/15 text-primary"
                              : "bg-muted/60 text-muted-foreground"
                          )}>
                            <item.icon className="w-[18px] h-[18px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium leading-tight",
                              isActive ? "text-primary" : "text-foreground"
                            )}>
                              {item.label}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                              {item.desc}
                            </p>
                          </div>
                          <ChevronRight className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isActive ? "text-primary/50" : "text-muted-foreground/30"
                          )} />
                        </NavLink>
                      </motion.div>
                    );
                  })}
                </motion.nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/30 safe-area-bottom"
        role="navigation"
        aria-label="Menu principal"
        style={{
          background: 'hsl(var(--card) / 0.95)',
          backdropFilter: 'blur(20px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
        }}
      >
        <div className="flex items-center justify-around px-1 h-[52px]">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors touch-target",
                  isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full bg-primary"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                  />
                )}
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                >
                  <item.icon className={cn(
                    "w-[20px] h-[20px] transition-all",
                    isActive && "stroke-[2.5]"
                  )} />
                </motion.div>
                <span className={cn(isActive && "font-semibold")}>{item.label}</span>
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMore(!showMore)}
            aria-expanded={showMore}
            aria-haspopup="menu"
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors touch-target",
              showMore || isMoreActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            )}
          >
            {(showMore || isMoreActive) && (
              <motion.div
                layoutId="mobile-nav-pill"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] rounded-b-full bg-primary"
                transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
              />
            )}
            <motion.div
              whileTap={{ scale: 0.85 }}
              animate={{ rotate: showMore ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showMore ? (
                <X className="w-[20px] h-[20px] stroke-[2.5]" />
              ) : (
                <MoreHorizontal className={cn("w-[20px] h-[20px]", isMoreActive && "stroke-[2.5]")} />
              )}
            </motion.div>
            <span className={cn((showMore || isMoreActive) && "font-semibold")}>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};

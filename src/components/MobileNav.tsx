import React, { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart,
  MoreHorizontal, X, Target, CalendarRange, Compass,
  FileText, Calculator, Upload, Settings, ChevronRight,
  Sun, Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccount } from "@/contexts/AccountContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { AnimatePresence, motion } from "framer-motion";
import type { TranslationKey } from "@/i18n/translations";

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
  descKey?: TranslationKey;
  account?: "business";
}

interface NavSection {
  titleKey: TranslationKey;
  items: NavItem[];
}

const mainItems: NavItem[] = [
  { path: "/dashboard", labelKey: "nav.home", icon: LayoutDashboard },
  { path: "/receitas", labelKey: "nav.income", icon: TrendingUp },
  { path: "/despesas", labelKey: "nav.expenses", icon: TrendingDown },
  { path: "/investimentos", labelKey: "nav.investments", icon: PieChart },
];

const moreSections: NavSection[] = [
  {
    title: "Visão Geral",
    items: [
      { path: "/planejamento", labelKey: "nav.planning", icon: Compass, descKey: "more.planning" },
      { path: "/mensal", labelKey: "nav.monthly", icon: CalendarRange, descKey: "more.monthly" },
    ],
  },
  {
    title: "Crescimento",
    items: [
      { path: "/metas", labelKey: "nav.goals", icon: Target, descKey: "more.goals" },
    ],
  },
  {
    title: "Relatórios",
    items: [
      { path: "/dre", labelKey: "nav.dre", icon: FileText, account: "business", descKey: "more.dre" },
      { path: "/ebitda", labelKey: "nav.ebitda", icon: Calculator, account: "business", descKey: "more.ebitda" },
      { path: "/importar", labelKey: "nav.import", icon: Upload, descKey: "more.import" },
    ],
  },
  {
    title: "Configurações",
    items: [
      { path: "/configuracoes", labelKey: "nav.settings", icon: Settings, descKey: "more.settings" },
    ],
  },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const { account } = useAccount();
  const { t } = usePreferences();
  const { theme, toggleTheme } = useTheme();

  const allMoreItems = moreSections.flatMap(s => s.items);
  const filteredSections = moreSections.map(s => ({
    ...s,
    items: s.items.filter(item => !item.account || item.account === account.type),
  })).filter(s => s.items.length > 0);

  const isMoreActive = allMoreItems.some(item => location.pathname === item.path);
  const closeMenu = useCallback(() => setShowMore(false), []);

  let animIdx = 0;

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
              <div className="mx-3 mb-1 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg max-h-[65vh] overflow-y-auto">
                {/* Handle */}
                <div className="flex justify-center pt-2 pb-1 sticky top-0 bg-card z-10">
                  <div className="w-9 h-1 rounded-full bg-muted-foreground/20" />
                </div>
                <nav className="px-1.5 pb-1.5" role="menu" aria-label="Menu adicional">
                  {filteredSections.map((section, sIdx) => (
                    <div key={section.title}>
                      {/* Section title */}
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                        {section.title}
                      </p>
                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const isActive = location.pathname === item.path;
                          const idx = animIdx++;
                          return (
                            <motion.div
                              key={item.path}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03, duration: 0.2 }}
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
                                  )}>{t(item.labelKey)}</p>
                                  {item.descKey && (
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">{t(item.descKey)}</p>
                                  )}
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/30" />
                              </NavLink>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Theme toggle */}
                  <div className="mt-1 border-t border-border/30 pt-1">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: animIdx * 0.03, duration: 0.2 }}
                    >
                      <button
                        onClick={() => { toggleTheme(); closeMenu(); }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] active:bg-accent/60 w-full"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 text-muted-foreground">
                          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-[13px] font-medium leading-tight text-foreground">
                            {theme === 'light' ? t("sidebar.darkMode") : t("sidebar.lightMode")}
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  </div>
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
                <span className={cn(isActive && "font-semibold")}>{t(item.labelKey)}</span>
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
            <span className={cn((showMore || isMoreActive) && "font-semibold")}>{t("nav.more")}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

import React, { useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  MoreHorizontal, X, Settings, ChevronRight,
  Sun, Moon, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import type { TranslationKey } from "@/i18n/translations";

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
}

const mainItems: NavItem[] = [
  { path: "/dashboard", labelKey: "nav.home", icon: LayoutDashboard },
  { path: "/receitas", labelKey: "nav.income", icon: TrendingUp },
  { path: "/despesas", labelKey: "nav.expenses", icon: TrendingDown },
];

const moreItems: NavItem[] = [
  { path: "/configuracoes", labelKey: "nav.settings", icon: Settings },
];

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);
  const { t } = usePreferences();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const isMoreActive = moreItems.some(item => location.pathname === item.path);
  const closeMenu = useCallback(() => setShowMore(false), []);

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={closeMenu}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 380 }}
              className="fixed bottom-[56px] inset-x-0 z-50 md:hidden"
            >
              <div className="mx-3 mb-1 rounded-2xl border border-border/50 bg-card overflow-hidden shadow-lg">
                <div className="flex justify-center pt-2 pb-1"><div className="w-9 h-1 rounded-full bg-muted-foreground/20" /></div>
                <nav className="px-1.5 pb-1.5 space-y-0.5">
                  {moreItems.map((item, i) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <motion.div key={item.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }}>
                        <NavLink to={item.path} onClick={closeMenu}
                          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all", isActive ? "bg-primary/10" : "active:bg-accent/60")}>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isActive ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground")}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <p className={cn("text-[13px] font-medium", isActive ? "text-primary" : "text-foreground")}>{t(item.labelKey)}</p>
                          <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground/30" />
                        </NavLink>
                      </motion.div>
                    );
                  })}
                  <div className="border-t border-border/30 pt-1 space-y-0.5">
                    <button onClick={() => { toggleTheme(); closeMenu(); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-muted/50 text-muted-foreground">
                        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <p className="text-[13px] font-medium text-foreground">{theme === 'light' ? t("sidebar.darkMode") : t("sidebar.lightMode")}</p>
                    </button>
                    <button onClick={() => { signOut(); closeMenu(); }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-destructive/10 text-destructive">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <p className="text-[13px] font-medium text-destructive">{t("sidebar.logout")}</p>
                    </button>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 safe-area-bottom"
        style={{ background: 'hsl(var(--card) / 0.92)', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)' }}>
        <div className="flex items-stretch h-[56px]">
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}
                className={cn("relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground")}>
                {isActive && <motion.span layoutId="nav-indicator" className="absolute top-0 inset-x-[25%] h-[2px] rounded-b-full bg-primary" />}
                <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn(isActive && "font-semibold")}>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
          <button onClick={() => setShowMore(!showMore)}
            className={cn("relative flex-1 flex flex-col items-center justify-center gap-[3px] text-[10px] font-medium transition-colors",
              showMore || isMoreActive ? "text-primary" : "text-muted-foreground")}>
            {(showMore || isMoreActive) && <motion.span layoutId="nav-indicator" className="absolute top-0 inset-x-[25%] h-[2px] rounded-b-full bg-primary" />}
            <motion.div animate={{ rotate: showMore ? 90 : 0 }} transition={{ duration: 0.15 }}>
              {showMore ? <X className="w-5 h-5 stroke-[2.5]" /> : <MoreHorizontal className={cn("w-5 h-5", isMoreActive && "stroke-[2.5]")} />}
            </motion.div>
            <span>{t("nav.more")}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

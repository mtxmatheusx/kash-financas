import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target, CalendarRange,
  Sun, Moon, ChevronLeft, ChevronRight, Compass, FileText, Calculator, Upload,
  Crown, LogOut, Settings, ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccount } from "@/contexts/AccountContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { TranslationKey } from "@/i18n/translations";
import type { AccountType } from "@/contexts/AccountContext";

const FREE_PATHS = ["/dashboard", "/receitas", "/despesas"];

interface MenuItem {
  path: string;
  labelKey: TranslationKey;
  icon: React.ElementType;
  account?: AccountType;
}

interface MenuSection {
  titleKey: TranslationKey;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    titleKey: "sidebar.section.overview",
    items: [
      { path: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { path: "/planejamento", labelKey: "nav.planning", icon: Compass },
      { path: "/mensal", labelKey: "nav.monthly", icon: CalendarRange },
    ],
  },
  {
    titleKey: "sidebar.section.transactions",
    items: [
      { path: "/receitas", labelKey: "nav.income", icon: TrendingUp },
      { path: "/despesas", labelKey: "nav.expenses", icon: TrendingDown },
    ],
  },
  {
    titleKey: "sidebar.section.growth",
    items: [
      { path: "/investimentos", labelKey: "nav.investments", icon: PieChart },
      { path: "/metas", labelKey: "nav.goals", icon: Target },
    ],
  },
  {
    titleKey: "sidebar.section.reports",
    items: [
      { path: "/dre", labelKey: "nav.dre", icon: FileText, account: "business" },
      { path: "/ebitda", labelKey: "nav.ebitda", icon: Calculator, account: "business" },
      { path: "/importar", labelKey: "nav.import", icon: Upload },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { account, setAccountType } = useAccount();
  const { isPremium, signOut, profile, user } = useAuth();
  const { t } = usePreferences();
  const isMobile = useIsMobile();
  const location = useLocation();

  const { data: isAdmin } = useQuery({
    queryKey: ["admin-role-sidebar", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
  });

  if (isMobile) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 192 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 bg-sidebar flex flex-col border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className={cn("h-14 flex items-center border-b border-sidebar-border", collapsed ? "justify-center px-0" : "px-4")}>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <img src="/favicon.png" alt="F" className="w-4 h-4 object-contain" />
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-semibold text-sidebar-foreground text-sm tracking-wide"
          >
            Faciliten
          </motion.span>
        )}
      </div>

      {/* Nav Items by Section */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleItems = section.items.filter(
            item => !item.account || item.account === account.type
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.titleKey} className={cn(sIdx > 0 && "mt-4")}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted/60">
                  {t(section.titleKey)}
                </p>
              )}
              {collapsed && sIdx > 0 && (
                <div className="mx-3 mb-2 border-t border-sidebar-border" />
              )}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = location.pathname === item.path;
                  const isLocked = !isPremium && !FREE_PATHS.includes(item.path);
                  const label = t(item.labelKey);
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg text-sm transition-all",
                        collapsed ? "p-3 justify-center" : "px-3 py-2.5",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                        isLocked && "opacity-60"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
                        />
                      )}
                      <item.icon size={20} className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <span className="font-medium flex-1">{label}</span>
                      )}
                      {!collapsed && isLocked && (
                        <Crown size={14} className="w-3.5 h-3.5 text-fin-pending shrink-0" />
                      )}
                      {collapsed && (
                        <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                          {label}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {isAdmin && (
          <NavLink
            to="/admin"
            className={cn(
              "relative flex items-center gap-3 rounded-lg text-sm transition-all w-full",
              collapsed ? "p-3 justify-center" : "px-3 py-2.5",
              location.pathname === "/admin"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            {location.pathname === "/admin" && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
              />
            )}
            <ShieldCheck size={20} className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="flex-1">Admin</span>}
          </NavLink>
        )}
        {!collapsed && profile && (
          <div className="px-3 py-2 text-xs text-sidebar-muted truncate">
            {profile.display_name || profile.email}
          </div>
        )}
        <NavLink
          to="/configuracoes"
          className={cn(
            "relative flex items-center gap-3 rounded-lg text-sm transition-all w-full",
            collapsed ? "p-3 justify-center" : "px-3 py-2.5",
            location.pathname === "/configuracoes"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          {location.pathname === "/configuracoes" && (
            <motion.div
              layoutId="sidebar-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
            />
          )}
          <Settings size={20} className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="flex-1">{t("nav.settings")}</span>}
        </NavLink>
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full",
            collapsed ? "p-3 justify-center" : "px-3 py-2.5"
          )}
        >
          {theme === 'light' ? <Moon size={20} className="w-5 h-5 shrink-0" /> : <Sun size={20} className="w-5 h-5 shrink-0" />}
          {!collapsed && <span className="flex-1">{theme === 'light' ? t("sidebar.darkMode") : t("sidebar.lightMode")}</span>}
        </button>
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full",
            collapsed ? "p-3 justify-center" : "px-3 py-2.5"
          )}
        >
          {collapsed ? <ChevronRight size={20} className="w-5 h-5 shrink-0" /> : <ChevronLeft size={20} className="w-5 h-5 shrink-0" />}
          {!collapsed && <span className="flex-1">{t("sidebar.collapse")}</span>}
        </button>
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full",
            collapsed ? "p-3 justify-center" : "px-3 py-2.5"
          )}
        >
          <LogOut size={20} className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="flex-1">{t("sidebar.logout")}</span>}
        </button>
      </div>
    </motion.aside>
  );
};

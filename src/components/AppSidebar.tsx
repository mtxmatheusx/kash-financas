import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  Sun, Moon, ChevronLeft, ChevronRight,
  LogOut, Settings,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const menuItems: MenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/receitas", label: "Receitas", icon: TrendingUp },
  { path: "/despesas", label: "Despesas", icon: TrendingDown },
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { signOut, whatsappUser } = useAuth();
  const { t } = usePreferences();
  const isMobile = useIsMobile();
  const location = useLocation();

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

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto">
        <div className="space-y-0.5">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg text-sm transition-all",
                  collapsed ? "p-3 justify-center" : "px-3 py-2.5",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
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
                  <span className="font-medium flex-1">{item.label}</span>
                )}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!collapsed && whatsappUser && (
          <div className="px-3 py-2 text-xs text-sidebar-muted truncate">
            📱 {whatsappUser}
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

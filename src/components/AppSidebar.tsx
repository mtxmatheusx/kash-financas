import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target, CalendarRange,
  Sun, Moon, ChevronLeft, ChevronRight, Compass, FileText, Calculator, Upload,
  Crown, LogOut, UserCog, Settings,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAccount } from "@/contexts/AccountContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import facilitenLogo from "@/assets/faciliten-logo.png";

import type { AccountType } from "@/contexts/AccountContext";

const FREE_PATHS = ["/dashboard", "/receitas", "/despesas"];

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  account?: AccountType;
}

const menuItems: MenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/planejamento", label: "Planejamento", icon: Compass },
  { path: "/receitas", label: "Receitas", icon: TrendingUp },
  { path: "/despesas", label: "Despesas", icon: TrendingDown },
  { path: "/investimentos", label: "Investimentos", icon: PieChart },
  { path: "/metas", label: "Metas", icon: Target },
  { path: "/mensal", label: "Visão Mensal", icon: CalendarRange },
  { path: "/dre", label: "DRE", icon: FileText, account: "business" },
  { path: "/ebitda", label: "EBITDA", icon: Calculator, account: "business" },
  { path: "/importar", label: "Importar", icon: Upload },
];
];

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export const AppSidebar: React.FC<Props> = ({ collapsed, onToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { account, setAccountType } = useAccount();
  const { isPremium, signOut, profile } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (isMobile) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 bg-sidebar flex flex-col border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <img src={facilitenLogo} alt="Faciliten" className="w-8 h-8 rounded-lg" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-semibold text-sidebar-foreground text-sm"
          >
            Faciliten
          </motion.span>
        )}
      </div>

      {/* Account Toggle */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="flex gap-1 bg-sidebar-accent rounded-lg p-1">
            <button
              onClick={() => setAccountType('personal')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                account.type === 'personal'
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-muted hover:text-sidebar-foreground"
              )}
            >
              Pessoal
            </button>
            <button
              onClick={() => setAccountType('business')}
              className={cn(
                "flex-1 py-1.5 rounded-md text-xs font-medium transition-all",
                account.type === 'business'
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-muted hover:text-sidebar-foreground"
              )}
            >
              Empresa
            </button>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems
          .filter(item => !item.account || item.account === account.type)
          .map(item => {
          const isActive = location.pathname === item.path;
          const isLocked = !isPremium && !FREE_PATHS.includes(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative",
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
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && (
                <span className="font-medium flex-1">{item.label}</span>
              )}
              {!collapsed && isLocked && (
                <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {!collapsed && profile && (
          <div className="px-3 py-2 text-xs text-sidebar-muted truncate">
            {profile.display_name || profile.email}
          </div>
        )}
        <NavLink
          to="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all w-full",
            location.pathname === "/configuracoes"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!collapsed && <span>Configurações</span>}
        </NavLink>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          {theme === 'light' ? <Moon className="w-[18px] h-[18px]" /> : <Sun className="w-[18px] h-[18px]" />}
          {!collapsed && <span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>}
        </button>
        <button
          onClick={onToggle}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px]" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Recolher</span>}
        </button>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
};

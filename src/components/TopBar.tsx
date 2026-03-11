import React from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Building2, User, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const TopBar: React.FC = () => {
  const { account, setAccountType } = useAccount();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 px-4 md:px-6 lg:px-8 h-12 md:h-14 flex items-center justify-between safe-area-top">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 min-w-0 rounded-lg px-2 py-1 -ml-2 hover:bg-accent/50 transition-colors touch-target">
          {account.type === 'business' ? (
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          ) : (
            <User className="w-3.5 h-3.5 text-primary shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground truncate">{account.name}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem
            onClick={() => setAccountType('personal')}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            Pessoal
            {account.type === 'personal' && <span className="ml-auto text-primary text-xs">●</span>}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAccountType('business')}
            className="gap-2"
          >
            <Building2 className="w-4 h-4" />
            Empresarial
            {account.type === 'business' && <span className="ml-auto text-primary text-xs">●</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <p className="text-[11px] text-muted-foreground hidden sm:block">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <p className="text-[10px] text-muted-foreground sm:hidden">
        {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
    </header>
  );
};

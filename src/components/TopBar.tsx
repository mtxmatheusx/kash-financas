import React from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Building2, User } from "lucide-react";

export const TopBar: React.FC = () => {
  const { account } = useAccount();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 px-4 md:px-6 lg:px-8 h-12 md:h-14 flex items-center justify-between safe-area-top">
      <div className="flex items-center gap-2 min-w-0">
        {account.type === 'business' ? (
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        ) : (
          <User className="w-3.5 h-3.5 text-primary shrink-0" />
        )}
        <span className="text-sm font-medium text-foreground truncate">{account.name}</span>
      </div>
      <p className="text-[11px] text-muted-foreground hidden sm:block">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
      <p className="text-[10px] text-muted-foreground sm:hidden">
        {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
      </p>
    </header>
  );
};

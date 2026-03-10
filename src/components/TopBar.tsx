import React from "react";
import { useAccount } from "@/contexts/AccountContext";
import { Building2, User } from "lucide-react";

export const TopBar: React.FC = () => {
  const { account } = useAccount();

  return (
    <header className="sticky top-0 z-30 glass border-b border-border px-4 md:px-6 lg:px-8 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {account.type === 'business' ? (
          <Building2 className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-primary" />
        )}
        <span className="text-sm font-medium text-foreground">{account.name}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>
    </header>
  );
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AccountType = 'personal' | 'business';

interface Account {
  type: AccountType;
  name: string;
}

interface AccountContextType {
  account: Account;
  setAccountType: (type: AccountType) => void;
}

const AccountContext = createContext<AccountContextType>({
  account: { type: 'personal', name: 'Pessoal' },
  setAccountType: () => {},
});

export const useAccount = () => useContext(AccountContext);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [account, setAccount] = useState<Account>(() => {
    const saved = localStorage.getItem('fincontrol-account');
    return saved ? JSON.parse(saved) : { type: 'personal', name: 'Pessoal' };
  });

  // Load preference from profile on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('preferred_account_type')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.preferred_account_type) {
          const type = data.preferred_account_type as AccountType;
          setAccount({ type, name: type === 'personal' ? 'Pessoal' : 'Empresarial' });
        }
      });
  }, [user]);

  const setAccountType = useCallback((type: AccountType) => {
    const acc = { type, name: type === 'personal' ? 'Pessoal' : 'Empresarial' };
    setAccount(acc);
    localStorage.setItem('fincontrol-account', JSON.stringify(acc));
    // Persist to DB
    if (user) {
      supabase
        .from('profiles')
        .update({ preferred_account_type: type } as any)
        .eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Failed to save account pref:', error); });
    }
  }, [user]);

  return (
    <AccountContext.Provider value={{ account, setAccountType }}>
      {children}
    </AccountContext.Provider>
  );
};

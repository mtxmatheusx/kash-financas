import React, { createContext, useContext, useState, useCallback } from 'react';

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
  const [account, setAccount] = useState<Account>(() => {
    const saved = localStorage.getItem('fincontrol-account');
    return saved ? JSON.parse(saved) : { type: 'personal', name: 'Pessoal' };
  });

  const setAccountType = useCallback((type: AccountType) => {
    const acc = { type, name: type === 'personal' ? 'Pessoal' : 'Empresarial' };
    setAccount(acc);
    localStorage.setItem('fincontrol-account', JSON.stringify(acc));
  }, []);

  return (
    <AccountContext.Provider value={{ account, setAccountType }}>
      {children}
    </AccountContext.Provider>
  );
};

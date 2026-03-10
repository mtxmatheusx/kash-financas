import { useState, useCallback, useEffect, useMemo } from 'react';
import { InvestmentRow } from '@/lib/types';
import { useAccount } from '@/contexts/AccountContext';

const KEY = 'fincontrol-investments';
function load(): InvestmentRow[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(d: InvestmentRow[]) { localStorage.setItem(KEY, JSON.stringify(d)); }

export function useInvestments() {
  const [all, setAll] = useState<InvestmentRow[]>(load);
  const { account } = useAccount();

  useEffect(() => { save(all); }, [all]);

  const investments = useMemo(() =>
    all.filter(i => i.account_type === account.type).sort((a, b) => b.date.localeCompare(a.date)),
    [all, account.type]);

  const create = useCallback((inv: Omit<InvestmentRow, 'id' | 'created_at'>) => {
    setAll(prev => [{ ...inv, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
  }, []);

  const remove = useCallback((id: string) => { setAll(prev => prev.filter(i => i.id !== id)); }, []);

  const total = useMemo(() => investments.reduce((s, i) => s + i.current_value, 0), [investments]);

  return { investments, create, remove, total };
}

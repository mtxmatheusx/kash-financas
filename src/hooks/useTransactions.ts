import { useState, useCallback, useEffect, useMemo } from 'react';
import { TransactionRow } from '@/lib/types';
import { useAccount } from '@/contexts/AccountContext';

const STORAGE_KEY = 'fincontrol-transactions';

function load(): TransactionRow[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function save(data: TransactionRow[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function useTransactions(typeFilter?: 'income' | 'expense') {
  const [all, setAll] = useState<TransactionRow[]>(load);
  const { account } = useAccount();

  useEffect(() => { save(all); }, [all]);

  const transactions = useMemo(() => {
    let filtered = all.filter(t => t.account_type === account.type);
    if (typeFilter) filtered = filtered.filter(t => t.type === typeFilter);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [all, account.type, typeFilter]);

  const create = useCallback((tx: Omit<TransactionRow, 'id' | 'created_at'>) => {
    const newTx: TransactionRow = { ...tx, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    setAll(prev => [newTx, ...prev]);
  }, []);

  const update = useCallback((id: string, data: Partial<TransactionRow>) => {
    setAll(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);

  const remove = useCallback((id: string) => {
    setAll(prev => prev.filter(t => t.id !== id));
  }, []);

  const totals = useMemo(() => {
    const income = all.filter(t => t.account_type === account.type && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = all.filter(t => t.account_type === account.type && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [all, account.type]);

  return { transactions, create, update, remove, totals, allTransactions: all };
}

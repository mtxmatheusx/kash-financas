import { useState, useCallback, useEffect, useMemo } from 'react';
import { GoalRow } from '@/lib/types';
import { useAccount } from '@/contexts/AccountContext';

const KEY = 'fincontrol-goals';
function load(): GoalRow[] { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
function save(d: GoalRow[]) { localStorage.setItem(KEY, JSON.stringify(d)); }

export function useGoals() {
  const [all, setAll] = useState<GoalRow[]>(load);
  const { account } = useAccount();

  useEffect(() => { save(all); }, [all]);

  const goals = useMemo(() =>
    all.filter(g => g.account_type === account.type).sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [all, account.type]);

  const create = useCallback((g: Omit<GoalRow, 'id' | 'created_at'>) => {
    setAll(prev => [{ ...g, id: crypto.randomUUID(), created_at: new Date().toISOString() }, ...prev]);
  }, []);

  const update = useCallback((id: string, data: Partial<GoalRow>) => {
    setAll(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
  }, []);

  const remove = useCallback((id: string) => { setAll(prev => prev.filter(g => g.id !== id)); }, []);

  return { goals, create, update, remove };
}

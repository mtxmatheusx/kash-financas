import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { TransactionRow } from '@/lib/types';

export function useTransactions(typeFilter?: 'income' | 'expense') {
  const [all, setAll] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useAccount();
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!user) { setAll([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) { toast.error('Erro ao carregar transações'); console.error(error); }
    else setAll((data ?? []).map(row => ({
      id: row.id,
      type: row.type as 'income' | 'expense',
      amount: Number(row.amount),
      description: row.description,
      category: row.category,
      date: row.date,
      status: row.status as 'paid' | 'pending',
      account_type: row.account_type as 'personal' | 'business',
      entry_type: row.entry_type as TransactionRow['entry_type'],
      installments: row.installments ?? undefined,
      frequency: row.frequency as TransactionRow['frequency'],
      is_percentage: row.is_percentage ?? undefined,
      percentage: row.percentage ? Number(row.percentage) : undefined,
      created_at: row.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const transactions = useMemo(() => {
    let filtered = all.filter(t => t.account_type === account.type);
    if (typeFilter) filtered = filtered.filter(t => t.type === typeFilter);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [all, account.type, typeFilter]);

  const create = useCallback(async (tx: Omit<TransactionRow, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        category: tx.category,
        date: tx.date,
        status: tx.status,
        account_type: tx.account_type,
        entry_type: tx.entry_type ?? 'single',
        installments: tx.installments ?? null,
        frequency: tx.frequency ?? null,
        is_percentage: tx.is_percentage ?? false,
        percentage: tx.percentage ?? null,
      })
      .select()
      .single();

    if (error) { toast.error('Erro ao salvar transação'); console.error(error); return; }
    if (data) {
      setAll(prev => [{
        id: data.id,
        type: data.type as 'income' | 'expense',
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        date: data.date,
        status: data.status as 'paid' | 'pending',
        account_type: data.account_type as 'personal' | 'business',
        entry_type: data.entry_type as TransactionRow['entry_type'],
        installments: data.installments ?? undefined,
        frequency: data.frequency as TransactionRow['frequency'],
        is_percentage: data.is_percentage ?? undefined,
        percentage: data.percentage ? Number(data.percentage) : undefined,
        created_at: data.created_at,
      }, ...prev]);
    }
  }, [user]);

  const update = useCallback(async (id: string, updates: Partial<TransactionRow>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates as any)
      .eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); console.error(error); return; }
    setAll(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); console.error(error); return; }
    setAll(prev => prev.filter(t => t.id !== id));
  }, []);

  const totals = useMemo(() => {
    const income = all.filter(t => t.account_type === account.type && t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = all.filter(t => t.account_type === account.type && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [all, account.type]);

  return { transactions, create, update, remove, totals, allTransactions: all, loading };
}

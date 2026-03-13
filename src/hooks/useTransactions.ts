import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { TransactionRow } from '@/lib/types';

export function useTransactions(typeFilter?: 'income' | 'expense') {
  const [all, setAll] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!user) { setAll([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from('client_profiles' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar transações');
      console.error(error);
      setAll([]);
    } else {
      setAll((data ?? []).map((row: any) => ({
        id: row.id,
        type: row.type as 'income' | 'expense',
        amount: (row.amount_cents ?? 0) / 100,
        description: row.description ?? '',
        category: row.category ?? '',
        date: row.date ?? new Date().toISOString().slice(0, 10),
        status: 'paid' as const,
        account_type: 'personal' as const,
        created_at: row.created_at,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const transactions = useMemo(() => {
    let filtered = all;
    if (typeFilter) filtered = filtered.filter(t => t.type === typeFilter);
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [all, typeFilter]);

  const create = useCallback(async (tx: Omit<TransactionRow, 'id' | 'created_at'> & { recurring_months?: number; percentage_base?: string }) => {
    if (!user) return;

    const row = {
      user_id: user.id,
      type: tx.type,
      amount_cents: Math.round(tx.amount * 100),
      description: tx.description,
      category: tx.category,
      date: tx.date,
    };

    const { data, error } = await supabase
      .from('client_profiles' as any)
      .insert([row])
      .select();

    if (error) { toast.error('Erro ao salvar transação'); console.error(error); return; }
    if (data) {
      const mapped = (data as any[]).map((d: any) => ({
        id: d.id,
        type: d.type as 'income' | 'expense',
        amount: (d.amount_cents ?? 0) / 100,
        description: d.description ?? '',
        category: d.category ?? '',
        date: d.date,
        status: 'paid' as const,
        account_type: 'personal' as const,
        created_at: d.created_at,
      }));
      setAll(prev => [...mapped, ...prev]);
    }
  }, [user]);

  const update = useCallback(async (id: string, updates: Partial<TransactionRow> & { recurring_months?: number }) => {
    const { recurring_months, ...rest } = updates as any;
    const dbUpdates: any = {};
    if (rest.description !== undefined) dbUpdates.description = rest.description;
    if (rest.category !== undefined) dbUpdates.category = rest.category;
    if (rest.type !== undefined) dbUpdates.type = rest.type;
    if (rest.date !== undefined) dbUpdates.date = rest.date;
    if (rest.amount !== undefined) dbUpdates.amount_cents = Math.round(rest.amount * 100);

    const { error } = await supabase
      .from('client_profiles' as any)
      .update(dbUpdates)
      .eq('id', id);

    if (error) { toast.error('Erro ao atualizar'); console.error(error); return; }
    setAll(prev => prev.map(t => t.id === id ? { ...t, ...rest } : t));
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('client_profiles' as any).delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); console.error(error); return; }
    setAll(prev => prev.filter(t => t.id !== id));
  }, []);

  const totals = useMemo(() => {
    const income = all.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = all.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [all]);

  return { transactions, create, update, remove, totals, allTransactions: all, loading };
}

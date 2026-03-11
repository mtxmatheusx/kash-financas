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
      currency: (row as any).currency || 'BRL',
      created_at: row.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Build monthly income map for dynamic percentage recalculation
  const monthlyIncomeMap = useMemo(() => {
    const map: Record<string, number> = {};
    all.filter(t => t.account_type === account.type && t.type === 'income')
      .forEach(t => {
        const m = t.date.slice(0, 7);
        map[m] = (map[m] || 0) + t.amount;
      });
    return map;
  }, [all, account.type]);

  const transactions = useMemo(() => {
    let filtered = all.filter(t => t.account_type === account.type);
    if (typeFilter) filtered = filtered.filter(t => t.type === typeFilter);

    // Dynamically recalculate percentage-based expenses
    filtered = filtered.map(t => {
      if (t.is_percentage && t.percentage && t.type === 'expense') {
        const monthIncome = monthlyIncomeMap[t.date.slice(0, 7)] || 0;
        return { ...t, amount: (monthIncome * t.percentage) / 100 };
      }
      return t;
    });

    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [all, account.type, typeFilter, monthlyIncomeMap]);

  const create = useCallback(async (tx: Omit<TransactionRow, 'id' | 'created_at'> & { recurring_months?: number; percentage_base?: 'total' | 'monthly' }) => {
    if (!user) return;

    const isRecurring = tx.entry_type === 'recurring' && tx.recurring_months && tx.recurring_months > 1;
    const isInstallment = tx.entry_type === 'installment' && tx.installments && tx.installments > 1;
    const count = isRecurring ? tx.recurring_months! : isInstallment ? tx.installments! : 1;
    const freq = tx.frequency === 'yearly' ? 12 : 1;

    const rows = [];
    const baseDate = new Date(tx.date + 'T12:00:00');

    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() + i * freq);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      // For percentage-based monthly expenses, store 0 as amount — it's recalculated dynamically
      let amount = tx.amount;
      if (isInstallment) amount = tx.amount / count;
      if (tx.is_percentage && tx.percentage_base === 'monthly') amount = 0;

      rows.push({
        user_id: user.id,
        type: tx.type,
        amount,
        description: isInstallment
          ? `${tx.description} (${i + 1}/${count})`
          : tx.description,
        category: tx.category,
        date: dateStr,
        status: i === 0 ? tx.status : 'pending' as const,
        account_type: tx.account_type,
        entry_type: tx.entry_type ?? 'single',
        installments: tx.installments ?? null,
        frequency: tx.frequency ?? null,
        is_percentage: tx.is_percentage ?? false,
        percentage: tx.percentage ?? null,
        currency: tx.currency || 'BRL',
      });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(rows)
      .select();

    if (error) { toast.error('Erro ao salvar transação'); console.error(error); return; }
    if (data) {
      const mapped = data.map(d => ({
        id: d.id,
        type: d.type as 'income' | 'expense',
        amount: Number(d.amount),
        description: d.description,
        category: d.category,
        date: d.date,
        status: d.status as 'paid' | 'pending',
        account_type: d.account_type as 'personal' | 'business',
        entry_type: d.entry_type as TransactionRow['entry_type'],
        installments: d.installments ?? undefined,
        frequency: d.frequency as TransactionRow['frequency'],
        is_percentage: d.is_percentage ?? undefined,
        percentage: d.percentage ? Number(d.percentage) : undefined,
        created_at: d.created_at,
      }));
      setAll(prev => [...mapped, ...prev]);
      if (count > 1) toast.success(`${count} lançamentos criados automaticamente!`);
    }
  }, [user, all]);

  const update = useCallback(async (id: string, updates: Partial<TransactionRow> & { recurring_months?: number }) => {
    // Strip non-db fields before sending to Supabase
    const { recurring_months, ...dbUpdates } = updates as any;
    const { error } = await supabase
      .from('transactions')
      .update(dbUpdates)
      .eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); console.error(error); return; }
    setAll(prev => prev.map(t => t.id === id ? { ...t, ...dbUpdates } : t));
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); console.error(error); return; }
    setAll(prev => prev.filter(t => t.id !== id));
  }, []);

  const totals = useMemo(() => {
    const acctTx = all.filter(t => t.account_type === account.type);
    const income = acctTx.filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = acctTx.filter(t => t.type === 'expense')
      .map(t => {
        if (t.is_percentage && t.percentage) {
          const monthIncome = monthlyIncomeMap[t.date.slice(0, 7)] || 0;
          return (monthIncome * t.percentage) / 100;
        }
        return t.amount;
      })
      .reduce((s, a) => s + a, 0);
    return { income, expense, balance: income - expense };
  }, [all, account.type, monthlyIncomeMap]);

  return { transactions, create, update, remove, totals, allTransactions: all, loading };
}

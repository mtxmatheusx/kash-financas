import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { InvestmentRow } from '@/lib/types';

export function useInvestments() {
  const [all, setAll] = useState<InvestmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useAccount();
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!user) { setAll([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (error) { toast.error('Erro ao carregar investimentos'); console.error(error); }
    else setAll((data ?? []).map(r => ({
      id: r.id, name: r.name, type: r.type,
      amount: Number(r.amount), current_value: Number(r.current_value),
      date: r.date, account_type: r.account_type as 'personal' | 'business',
      created_at: r.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const investments = useMemo(() =>
    all.filter(i => i.account_type === account.type).sort((a, b) => b.date.localeCompare(a.date)),
    [all, account.type]);

  const create = useCallback(async (inv: Omit<InvestmentRow, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('investments')
      .insert({ user_id: user.id, ...inv })
      .select()
      .single();
    if (error) { toast.error('Erro ao salvar investimento'); console.error(error); return; }
    if (data) setAll(prev => [{
      id: data.id, name: data.name, type: data.type,
      amount: Number(data.amount), current_value: Number(data.current_value),
      date: data.date, account_type: data.account_type as 'personal' | 'business',
      created_at: data.created_at,
    }, ...prev]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); console.error(error); return; }
    setAll(prev => prev.filter(i => i.id !== id));
  }, []);

  const total = useMemo(() => investments.reduce((s, i) => s + i.current_value, 0), [investments]);

  return { investments, create, remove, total, loading };
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { GoalRow } from '@/lib/types';

export function useGoals() {
  const [all, setAll] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useAccount();
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!user) { setAll([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('deadline', { ascending: true });
    if (error) { toast.error('Erro ao carregar metas'); console.error(error); }
    else setAll((data ?? []).map(r => ({
      id: r.id, name: r.name,
      target_amount: Number(r.target_amount), current_amount: Number(r.current_amount),
      deadline: r.deadline, account_type: r.account_type as 'personal' | 'business',
      created_at: r.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const goals = useMemo(() =>
    all.filter(g => g.account_type === account.type).sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [all, account.type]);

  const create = useCallback(async (g: Omit<GoalRow, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('goals')
      .insert({ user_id: user.id, ...g })
      .select()
      .single();
    if (error) { toast.error('Erro ao salvar meta'); console.error(error); return; }
    if (data) setAll(prev => [{
      id: data.id, name: data.name,
      target_amount: Number(data.target_amount), current_amount: Number(data.current_amount),
      deadline: data.deadline, account_type: data.account_type as 'personal' | 'business',
      created_at: data.created_at,
    }, ...prev]);
  }, [user]);

  const update = useCallback(async (id: string, updates: Partial<GoalRow>) => {
    const { error } = await supabase.from('goals').update(updates as any).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); console.error(error); return; }
    setAll(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); console.error(error); return; }
    setAll(prev => prev.filter(g => g.id !== id));
  }, []);

  return { goals, create, update, remove, loading };
}

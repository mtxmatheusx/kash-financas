import { useState, useCallback, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from '@/contexts/AccountContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PortfolioRow } from '@/lib/types';

export function usePortfolios() {
  const [all, setAll] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useAccount();
  const { user } = useAuth();

  const fetchAll = useCallback(async () => {
    if (!user) { setAll([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) { toast.error('Erro ao carregar portfólios'); console.error(error); }
    else setAll((data ?? []).map(r => ({
      id: r.id, name: r.name, description: r.description || '',
      account_type: r.account_type as 'personal' | 'business',
      created_at: r.created_at,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const portfolios = useMemo(() =>
    all.filter(p => p.account_type === account.type),
    [all, account.type]);

  const create = useCallback(async (p: Omit<PortfolioRow, 'id' | 'created_at'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('portfolios')
      .insert({ user_id: user.id, ...p })
      .select()
      .single();
    if (error) { toast.error('Erro ao criar portfólio'); console.error(error); return; }
    if (data) setAll(prev => [...prev, {
      id: data.id, name: data.name, description: data.description || '',
      account_type: data.account_type as 'personal' | 'business',
      created_at: data.created_at,
    }]);
  }, [user]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('portfolios').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir portfólio'); console.error(error); return; }
    setAll(prev => prev.filter(p => p.id !== id));
  }, []);

  return { portfolios, create, remove, loading };
}

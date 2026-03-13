import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ClientTransaction {
  id: string;
  type: string;
  amount_cents: number;
  category: string;
  description: string;
  date: string;
  whatsapp_number: string | null;
  created_at: string;
}

export function useClientProfiles() {
  const { user } = useAuth();
  const [data, setData] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setData([]); setLoading(false); return; }
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("client_profiles")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (!error && rows) {
      setData(rows as ClientTransaction[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const totals = {
    income: data.filter(t => t.type === "income").reduce((s, t) => s + t.amount_cents / 100, 0),
    expense: data.filter(t => t.type === "expense").reduce((s, t) => s + t.amount_cents / 100, 0),
    get balance() { return this.income - this.expense; },
  };

  return { clientTransactions: data, clientTotals: totals, clientLoading: loading, refetchClient: fetch };
}

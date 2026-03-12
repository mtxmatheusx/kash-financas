
-- Create portfolios table
CREATE TABLE public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  account_type public.account_type NOT NULL DEFAULT 'personal',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own portfolios" ON public.portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolios" ON public.portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolios" ON public.portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolios" ON public.portfolios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add portfolio_id to investments
ALTER TABLE public.investments ADD COLUMN portfolio_id uuid REFERENCES public.portfolios(id) ON DELETE SET NULL;

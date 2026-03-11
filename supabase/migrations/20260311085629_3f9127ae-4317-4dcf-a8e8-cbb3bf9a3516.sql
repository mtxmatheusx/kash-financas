CREATE TABLE public.user_financial_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preference text NOT NULL,
  category text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_financial_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own preferences" ON public.user_financial_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_financial_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_financial_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
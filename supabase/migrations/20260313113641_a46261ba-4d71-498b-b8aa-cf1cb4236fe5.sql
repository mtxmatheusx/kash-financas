
CREATE TABLE public.client_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'expense',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS since auth will be WhatsApp-number based (no Supabase Auth)
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

-- Allow anon to read/write (WhatsApp-based auth, no JWT)
CREATE POLICY "Allow anon select" ON public.client_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert" ON public.client_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow anon update" ON public.client_profiles FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Allow anon delete" ON public.client_profiles FOR DELETE TO anon, authenticated USING (true);

-- Index for fast lookups by user_id (WhatsApp number)
CREATE INDEX idx_client_profiles_user_id ON public.client_profiles (user_id);

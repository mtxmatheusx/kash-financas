
-- Create account_type enum
CREATE TYPE public.account_type AS ENUM ('personal', 'business');

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- Create transaction_status enum
CREATE TYPE public.transaction_status AS ENUM ('paid', 'pending');

-- Create entry_type enum
CREATE TYPE public.entry_type AS ENUM ('single', 'installment', 'recurring');

-- Create frequency enum
CREATE TYPE public.frequency_type AS ENUM ('monthly', 'yearly');

-- Transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status transaction_status NOT NULL DEFAULT 'pending',
  account_type account_type NOT NULL DEFAULT 'personal',
  entry_type entry_type DEFAULT 'single',
  installments INT,
  frequency frequency_type,
  is_percentage BOOLEAN DEFAULT false,
  percentage NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Investments table
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  account_type account_type NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own investments" ON public.investments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  deadline DATE NOT NULL DEFAULT CURRENT_DATE,
  account_type account_type NOT NULL DEFAULT 'personal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own goals" ON public.goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.goals FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add preferred_account_type to profiles
ALTER TABLE public.profiles ADD COLUMN preferred_account_type account_type DEFAULT 'personal';

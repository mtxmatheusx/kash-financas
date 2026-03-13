
-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow anon select" ON public.client_profiles;
DROP POLICY IF EXISTS "Allow anon insert" ON public.client_profiles;
DROP POLICY IF EXISTS "Allow anon update" ON public.client_profiles;
DROP POLICY IF EXISTS "Allow anon delete" ON public.client_profiles;

-- Change user_id to store UUID as text (auth.uid()::text)
-- Create proper RLS policies using auth.uid()
CREATE POLICY "Users can select own client_profiles" ON public.client_profiles FOR SELECT TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own client_profiles" ON public.client_profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own client_profiles" ON public.client_profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own client_profiles" ON public.client_profiles FOR DELETE TO authenticated USING (user_id = auth.uid()::text);

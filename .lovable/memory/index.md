Design system: Soft red — Primary 0 65% 55%, DM Sans + JetBrains Mono
Finance app: Faciliten — Dashboard, Receitas, Despesas
Auth: Supabase Auth (email/password), UUID-based user identification
Data source: client_profiles table (amount_cents in centavos, user_id = auth UUID as text, whatsapp_number = optional attribute)
Layout: Dark sidebar, glass topbar, mobile bottom nav
Colors: fin-income (green), fin-expense (red), fin-pending (amber)
RLS: client_profiles filtered by auth.uid()::text

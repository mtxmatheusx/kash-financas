# Memory: index.md
Updated: now

Design system: Corporate blue — Primary #3B82F6 (217 91% 60%), DM Sans + JetBrains Mono
Finance app: Faciliten — Dashboard, Receitas, Despesas, Investimentos, Metas, Mensal, Planejamento
Layout: Dark sidebar, glass topbar, mobile bottom nav
Data: Supabase with personal/business account toggle
Colors: fin-income (green), fin-expense (red), fin-pending (amber), fin-investment (purple), fin-goals (blue)
Auth: Email/password only — DO NOT change to phone auth
Tables: transactions (main), client_profiles (WhatsApp Amanda data, keyed by user UUID)
Amanda: WhatsApp assistant linked via QR code in settings, wa.me/5511954223325?text=AtivarFaciliten:{user.id}

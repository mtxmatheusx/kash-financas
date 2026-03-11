# Memory: index.md
Updated: now

Design system: Corporate blue — Primary #3B82F6 (217 91% 60%), Inter + JetBrains Mono
Finance app: Faciliten — Dashboard, Receitas, Despesas, Investimentos, Metas, Mensal, Planejamento
Layout: Dark sidebar, glass topbar, mobile bottom nav
Data: Supabase with personal/business account toggle
Colors: fin-income (green), fin-expense (red), fin-pending (amber), fin-investment (purple), fin-goals (blue)

## i18n System
- Translations in `src/i18n/translations.ts` (PT, EN, ES)
- `usePreferences()` provides `t(key)` function for all UI strings
- Currency + language stored in localStorage via PreferencesContext
- Multi-currency: transactions have `currency` column (BRL, USD, EUR, GBP)
- `formatMoney(value, currencyOverride?)` respects selected currency

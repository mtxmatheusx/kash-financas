
-- Settings table for fiscal, banking, integrations, and notification preferences
CREATE TABLE public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  
  -- Dados Fiscais
  document_type text DEFAULT 'cpf',
  document_number text,
  company_name text,
  state_registration text,
  city_registration text,
  tax_regime text,
  
  -- Dados Bancários
  bank_name text,
  bank_agency text,
  bank_account text,
  pix_key text,
  pix_key_type text,
  
  -- Integrações
  n8n_webhook_url text,
  evolution_api_url text,
  evolution_api_key text,
  evolution_instance text,
  
  -- Notificações
  notify_whatsapp boolean DEFAULT true,
  notify_email boolean DEFAULT true,
  notify_due_dates boolean DEFAULT true,
  notify_due_days_before integer DEFAULT 3,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own settings" ON public.user_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

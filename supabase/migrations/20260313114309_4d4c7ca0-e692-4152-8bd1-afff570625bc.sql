
-- Add whatsapp_number column to client_profiles
ALTER TABLE public.client_profiles ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Create index for whatsapp_number lookups
CREATE INDEX IF NOT EXISTS idx_client_profiles_whatsapp ON public.client_profiles (whatsapp_number);

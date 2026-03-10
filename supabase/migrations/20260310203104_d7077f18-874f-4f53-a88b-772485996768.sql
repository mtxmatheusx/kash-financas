
-- Add trial and referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone,
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists_already boolean;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN code;
END;
$$;

-- Update handle_new_user to set trial_end (30 days) and generate referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, subscription_tier, trial_end, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'premium',
    now() + interval '30 days',
    public.generate_referral_code()
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Function to apply referral bonus
CREATE OR REPLACE FUNCTION public.apply_referral(referrer_code text, new_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_profile_id uuid;
BEGIN
  -- Find the referrer
  SELECT id INTO referrer_profile_id FROM public.profiles WHERE referral_code = referrer_code;
  IF referrer_profile_id IS NULL THEN
    RETURN false;
  END IF;

  -- Set referred_by on new user
  UPDATE public.profiles SET referred_by = referrer_profile_id WHERE user_id = new_user_id;

  -- Extend referrer trial by 60 days
  UPDATE public.profiles
  SET trial_end = GREATEST(COALESCE(trial_end, now()), now()) + interval '60 days'
  WHERE id = referrer_profile_id;

  RETURN true;
END;
$$;

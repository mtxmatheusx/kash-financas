
-- Fix search_path on generate_referral_code and apply_referral
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
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

CREATE OR REPLACE FUNCTION public.apply_referral(referrer_code text, new_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_profile_id uuid;
BEGIN
  SELECT id INTO referrer_profile_id FROM public.profiles WHERE referral_code = referrer_code;
  IF referrer_profile_id IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.profiles SET referred_by = referrer_profile_id WHERE user_id = new_user_id;
  UPDATE public.profiles
  SET trial_end = GREATEST(COALESCE(trial_end, now()), now()) + interval '60 days'
  WHERE id = referrer_profile_id;
  RETURN true;
END;
$$;

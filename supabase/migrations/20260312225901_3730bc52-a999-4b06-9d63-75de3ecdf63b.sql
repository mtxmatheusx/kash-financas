
-- Shared accounts table: links two users as a couple
CREATE TABLE public.shared_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, partner_id)
);

ALTER TABLE public.shared_accounts ENABLE ROW LEVEL SECURITY;

-- Both owner and partner can see the link
CREATE POLICY "Users can view own shared accounts"
  ON public.shared_accounts FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- Only owner can delete (unlink)
CREATE POLICY "Owner can delete shared account"
  ON public.shared_accounts FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Only authenticated users can create (via invite acceptance)
CREATE POLICY "Authenticated can insert shared accounts"
  ON public.shared_accounts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = partner_id);

-- Account invites table
CREATE TABLE public.account_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL,
  invitee_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.account_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inviter can manage own invites"
  ON public.account_invites FOR ALL TO authenticated
  USING (auth.uid() = inviter_id)
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Invitee can view invites by email"
  ON public.account_invites FOR SELECT TO authenticated
  USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Invitee can update invite status"
  ON public.account_invites FOR UPDATE TO authenticated
  USING (
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Helper function: get partner user_id for a given user
CREATE OR REPLACE FUNCTION public.get_partner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN owner_id = _user_id THEN partner_id
    WHEN partner_id = _user_id THEN owner_id
  END
  FROM public.shared_accounts
  WHERE owner_id = _user_id OR partner_id = _user_id
  LIMIT 1
$$;

-- Now update RLS on transactions to allow partner access
CREATE POLICY "Partner can select transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can insert transactions"
  ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can update transactions"
  ON public.transactions FOR UPDATE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can delete transactions"
  ON public.transactions FOR DELETE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

-- Goals partner access
CREATE POLICY "Partner can select goals"
  ON public.goals FOR SELECT TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can insert goals"
  ON public.goals FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can update goals"
  ON public.goals FOR UPDATE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can delete goals"
  ON public.goals FOR DELETE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

-- Investments partner access
CREATE POLICY "Partner can select investments"
  ON public.investments FOR SELECT TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can insert investments"
  ON public.investments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can update investments"
  ON public.investments FOR UPDATE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can delete investments"
  ON public.investments FOR DELETE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

-- Portfolios partner access
CREATE POLICY "Partner can select portfolios"
  ON public.portfolios FOR SELECT TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can insert portfolios"
  ON public.portfolios FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can update portfolios"
  ON public.portfolios FOR UPDATE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

CREATE POLICY "Partner can delete portfolios"
  ON public.portfolios FOR DELETE TO authenticated
  USING (user_id = public.get_partner_id(auth.uid()));

-- Share premium: function to check if user or partner is premium
CREATE OR REPLACE FUNCTION public.is_premium_shared(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id IN (_user_id, public.get_partner_id(_user_id))
      AND (
        subscription_tier = 'premium'
        OR (trial_end IS NOT NULL AND trial_end > now())
      )
  )
$$;

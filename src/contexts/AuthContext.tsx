import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionControl } from "@/hooks/useSessionControl";
import type { User, Session } from "@supabase/supabase-js";

type SubscriptionTier = "free" | "premium";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  trial_end: string | null;
  referral_code: string | null;
  whatsapp_number: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  trialDaysLeft: number | null;
  subscriptionEnd: string | null;
  sessionBlocked: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isPremium: false,
  isTrialing: false,
  trialDaysLeft: null,
  subscriptionEnd: null,
  sessionBlocked: false,
  signOut: async () => {},
  refreshProfile: async () => {},
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    setProfile(data as Profile | null);
  };

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) {
        console.error("check-subscription error:", error);
        return;
      }
      if (data?.subscription_end) {
        setSubscriptionEnd(data.subscription_end);
      }
      if (user) await fetchProfile(user.id);
    } catch (e) {
      console.error("check-subscription failed:", e);
    }
  }, [user]);

  const refreshProfile = async () => {
    if (user) {
      await checkSubscription();
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setProfile(null);
          setSubscriptionEnd(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscriptionEnd(null);
  };

  // Trial logic
  const now = new Date();
  const trialEnd = profile?.trial_end ? new Date(profile.trial_end) : null;
  const isTrialActive = trialEnd ? trialEnd > now : false;
  const trialDaysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null;

  // Premium if: has Stripe subscription OR trial is active
  const hasStripeSubscription = profile?.subscription_tier === "premium" && !!subscriptionEnd;
  const ownPremium = hasStripeSubscription || isTrialActive;

  // Check if partner is premium (shared premium)
  const [partnerPremium, setPartnerPremium] = useState(false);
  useEffect(() => {
    if (!user || ownPremium) { setPartnerPremium(false); return; }
    supabase.rpc("is_premium_shared", { _user_id: user.id }).then(({ data }) => {
      if (data) setPartnerPremium(true);
    });
  }, [user, ownPremium]);

  const isPremium = ownPremium || partnerPremium;

  return (
    <AuthContext.Provider value={{
      user, session, profile, loading, isPremium,
      isTrialing: isTrialActive && !hasStripeSubscription,
      trialDaysLeft,
      subscriptionEnd, signOut, refreshProfile, checkSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

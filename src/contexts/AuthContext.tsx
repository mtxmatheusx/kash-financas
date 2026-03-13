import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AuthContextType {
  whatsappUser: string | null;
  loading: boolean;
  isPremium: boolean;
  isTrialing: boolean;
  trialDaysLeft: number | null;
  subscriptionEnd: string | null;
  sessionBlocked: boolean;
  // Keep profile-like shape for compatibility
  profile: {
    display_name: string | null;
    email: string | null;
    whatsapp_number: string | null;
    referral_code: string | null;
    subscription_tier: string;
  } | null;
  user: { id: string } | null;
  session: null;
  signIn: (whatsapp: string) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  whatsappUser: null,
  loading: true,
  isPremium: true,
  isTrialing: false,
  trialDaysLeft: null,
  subscriptionEnd: null,
  sessionBlocked: false,
  profile: null,
  user: null,
  session: null,
  signIn: () => {},
  signOut: () => {},
  refreshProfile: async () => {},
  checkSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = "faciliten_whatsapp_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [whatsappUser, setWhatsappUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setWhatsappUser(stored);
    setLoading(false);
  }, []);

  const signIn = useCallback((whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, "");
    localStorage.setItem(STORAGE_KEY, cleaned);
    setWhatsappUser(cleaned);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWhatsappUser(null);
  }, []);

  const profile = whatsappUser ? {
    display_name: whatsappUser,
    email: null,
    whatsapp_number: whatsappUser,
    referral_code: null,
    subscription_tier: "premium",
  } : null;

  const user = whatsappUser ? { id: whatsappUser } : null;

  return (
    <AuthContext.Provider value={{
      whatsappUser,
      loading,
      isPremium: true,
      isTrialing: false,
      trialDaysLeft: null,
      subscriptionEnd: null,
      sessionBlocked: false,
      profile,
      user,
      session: null,
      signIn,
      signOut,
      refreshProfile: async () => {},
      checkSubscription: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

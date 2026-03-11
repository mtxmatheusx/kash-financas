import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type CurrencyCode = "BRL" | "USD" | "EUR" | "GBP";
export type LanguageCode = "pt-BR" | "en" | "es";

interface CurrencyConfig {
  code: CurrencyCode;
  locale: string;
  symbol: string;
  label: string;
}

interface LanguageConfig {
  code: LanguageCode;
  label: string;
  flag: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: "BRL", locale: "pt-BR", symbol: "R$", label: "Real (R$)" },
  { code: "USD", locale: "en-US", symbol: "$", label: "Dólar ($)" },
  { code: "EUR", locale: "de-DE", symbol: "€", label: "Euro (€)" },
  { code: "GBP", locale: "en-GB", symbol: "£", label: "Libra (£)" },
];

export const LANGUAGES: LanguageConfig[] = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

interface PreferencesContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  language: LanguageCode;
  setLanguage: (l: LanguageCode) => void;
  formatMoney: (value: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const STORAGE_KEY = "user-preferences";

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).currency || "BRL";
    } catch {}
    return "BRL";
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored).language || "pt-BR";
    } catch {}
    return "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency, language }));
  }, [currency, language]);

  const setCurrency = useCallback((c: CurrencyCode) => setCurrencyState(c), []);
  const setLanguage = useCallback((l: LanguageCode) => setLanguageState(l), []);

  const formatMoney = useCallback((value: number) => {
    const config = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
    }).format(value);
  }, [currency]);

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency, language, setLanguage, formatMoney }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};

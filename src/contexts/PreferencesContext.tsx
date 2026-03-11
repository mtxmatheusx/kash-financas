import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type TranslationKey } from "@/i18n/translations";

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
  formatMoney: (value: number, currencyOverride?: CurrencyCode) => string;
  t: (key: TranslationKey) => string;
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
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language) return parsed.language;
      }
    } catch {}
    // Auto-detect from browser on first visit
    const browserLang = navigator.language?.toLowerCase() || "";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("en")) return "en";
    return "pt-BR";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency, language }));
  }, [currency, language]);

  const setCurrency = useCallback((c: CurrencyCode) => setCurrencyState(c), []);
  const setLanguage = useCallback((l: LanguageCode) => setLanguageState(l), []);

  const formatMoney = useCallback((value: number, currencyOverride?: CurrencyCode) => {
    const code = currencyOverride || currency;
    const config = CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
    }).format(value);
  }, [currency]);

  const t = useCallback((key: TranslationKey): string => {
    const dict = translations[language];
    return dict?.[key] || translations["pt-BR"][key] || key;
  }, [language]);

  return (
    <PreferencesContext.Provider value={{ currency, setCurrency, language, setLanguage, formatMoney, t }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
};

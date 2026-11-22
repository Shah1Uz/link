"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Locale, defaultLocale, getDictionary, TranslationDictionary } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDictionary;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem("biospace-locale") as Locale;
    if (saved && (saved === "en" || saved === "ru" || saved === "uz")) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = defaultLocale;
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "biospace-locale" && (e.newValue === "en" || e.newValue === "ru" || e.newValue === "uz")) {
        setLocaleState(e.newValue);
        document.documentElement.lang = e.newValue;
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("biospace-locale", newLocale);
      document.cookie = `biospace-locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("biospace-locale-change", { detail: newLocale }));
      }
    } catch (err) {
      console.warn("Failed to persist locale:", err);
    }
  };

  const t = getDictionary(locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}


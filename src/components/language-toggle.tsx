"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "./i18n-provider";
import { Locale } from "@/lib/i18n";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className || ""}`} ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-white/70 px-2.5 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-xs backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06]"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe className="h-3.5 w-3.5 text-emerald-500" />
        <span>{locale}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-2xl border border-zinc-200/80 bg-white/95 p-1.5 shadow-lift backdrop-blur-xl animate-in fade-in zoom-in-95 dark:border-white/10 dark:bg-[#0d0f15]/95">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-semibold transition-colors ${
                locale === lang.code
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "text-foreground hover:bg-zinc-900/[0.04] dark:hover:bg-white/[0.06]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {locale === lang.code && <Check className="h-3.5 w-3.5 text-emerald-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

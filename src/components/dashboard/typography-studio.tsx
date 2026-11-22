"use client";

import React, { useState, useMemo } from "react";
import {
  Type,
  Search,
  Sparkles,
  Check,
  Zap,
  Sliders,
  Palette,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  FONTS_CATALOG,
  FONT_CATEGORIES,
  getFontFamilyCss,
  type FontItem,
} from "@/lib/fonts-catalog";
import { DynamicFontLoader } from "@/components/shared/dynamic-font-loader";

interface TypographyStudioProps {
  currentFont: string;
  onFontChange: (fontName: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  accentColor: string;
  onAccentColorChange: (color: string) => void;
  displayName: string;
  avatarUrl?: string | null;
}

const QUICK_COLORS = [
  "#ffffff",
  "#000000",
  "#a3e635", // lime
  "#38bdf8", // sky
  "#f43f5e", // rose
  "#fbbf24", // amber
  "#c084fc", // purple
  "#2dd4bf", // teal
];

export function TypographyStudio({
  currentFont,
  onFontChange,
  textColor,
  onTextColorChange,
  accentColor,
  onAccentColorChange,
  displayName,
  avatarUrl,
}: TypographyStudioProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewText, setPreviewText] = useState(displayName || "ROMAN");
  const [isUppercase, setIsUppercase] = useState(false);

  // Filter fonts by category and search
  const filteredFonts = useMemo(() => {
    return FONTS_CATALOG.filter((f) => {
      const matchesCategory =
        selectedCategory === "all" || f.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const activeFontMeta = useMemo(() => {
    return (
      FONTS_CATALOG.find(
        (f) => f.id.toLowerCase() === currentFont.toLowerCase()
      ) || FONTS_CATALOG[0]
    );
  }, [currentFont]);

  const displayText = useMemo(() => {
    const raw = previewText.trim() || displayName || "ROMAN";
    return isUppercase ? raw.toUpperCase() : raw;
  }, [previewText, displayName, isUppercase]);

  return (
    <div className="space-y-6">
      <DynamicFontLoader font={currentFont} />
      {/* 1. HERO NIK LIVE PREVIEW BANNER (Inspired by user's reference) */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-surface/60 to-surface/90 p-5 shadow-soft backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold tracking-tight text-foreground sm:text-base">
                  NIK & Profil Shrift Studiyasi
                </h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                  Jonli Ko&apos;rinish
                </span>
              </div>
              <p className="text-[11px] text-text-secondary sm:text-xs">
                Nik/Nom shriftini o&apos;zgartiring — 33 dan ortiq zamonaviy, pufakli va hashamatli shriftlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsUppercase(!isUppercase)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isUppercase
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-xs"
                  : "border-border/80 bg-surface/50 text-text-secondary hover:text-foreground"
              }`}
            >
              UPPERCASE (ROMAN)
            </button>
          </div>
        </div>

        {/* Dynamic Display of Current NIK in selected font */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-6 text-center backdrop-blur-md">
          <div className="mx-auto flex flex-col items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="mb-3 h-16 w-16 rounded-full border-2 border-emerald-500/50 object-cover shadow-md"
              />
            ) : (
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold text-lg">
                Aa
              </div>
            )}

            <div
              className="text-3xl font-extrabold tracking-tight transition-all duration-300 sm:text-4xl md:text-5xl drop-shadow-md select-none break-words max-w-full"
              style={{
                fontFamily: getFontFamilyCss(currentFont),
                color: textColor || "#ffffff",
              }}
            >
              {displayText}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                {activeFontMeta.name}
              </span>
              <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-medium text-text-secondary border border-border/60">
                {activeFontMeta.tag}
              </span>
            </div>
          </div>
        </div>

        {/* Quick test text input */}
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
          <Label className="text-xs text-text-secondary whitespace-nowrap shrink-0">
            Sinov matni (Test Text):
          </Label>
          <Input
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="O'z Nikingizni yozib ko'ring..."
            className="h-9 text-xs"
          />
          {previewText !== displayName && (
            <button
              type="button"
              onClick={() => setPreviewText(displayName)}
              className="h-9 px-3 rounded-xl border border-border text-xs text-text-secondary hover:text-foreground shrink-0 flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Asliga qaytarish
            </button>
          )}
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FONT_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "border border-emerald-500/50 bg-emerald-500 text-white shadow-xs font-bold"
                      : "border border-border/70 bg-card/70 text-text-secondary hover:border-border hover:text-foreground"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-60 shrink-0">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Shrift qidirish..."
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>

        {/* 3. FONT CARDS GRID */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFonts.map((f) => {
            const isSelected =
              currentFont.toLowerCase() === f.id.toLowerCase();
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFontChange(f.id)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/[0.08] ring-2 ring-emerald-500/50 shadow-md"
                    : "border-border/80 bg-card/60 hover:border-emerald-500/40 hover:bg-card hover:shadow-xs"
                }`}
              >
                {/* Header: Name + Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">
                        {f.name}
                      </span>
                      {f.isPopular && (
                        <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-500">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-text-secondary">
                      {f.tag}
                    </span>
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-border/80 bg-surface/50 text-transparent group-hover:border-border"
                    }`}
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                </div>

                {/* Big Display Name Preview in exact font */}
                <div className="my-3 overflow-hidden py-1">
                  <div
                    className="truncate text-xl font-bold tracking-tight text-foreground transition-transform group-hover:scale-[1.02] sm:text-2xl"
                    style={{ fontFamily: getFontFamilyCss(f.id) }}
                  >
                    {displayText}
                  </div>
                </div>

                {/* Footer description */}
                <div className="border-t border-border/50 pt-2 text-[10px] text-text-secondary leading-snug">
                  {f.description}
                </div>
              </button>
            );
          })}
        </div>

        {filteredFonts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-text-secondary">
            <p className="text-sm font-semibold">Shrift topilmadi</p>
            <p className="mt-1 text-xs">
              &quot;{searchQuery}&quot; bo&apos;yicha mos keluvchi shrift chiqmadi. Boshqa so&apos;z bilan qidiring.
            </p>
          </div>
        )}
      </div>

      {/* 4. TEXT & ACCENT COLOR PICKERS */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-pink-500/15 text-pink-500">
            <Palette className="h-4 w-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Matn va Urg&apos;u Ranglari (Text Colors)
            </h4>
            <p className="text-[11px] text-text-secondary">
              Nik, sarlavha va nishonlar rangini fon bilan uyg&apos;unlashtiring.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Heading / NIK Color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Nik va Sarlavha Rangi (Heading & NIK Color)
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="h-10 w-12 rounded-xl border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="h-10 font-mono text-xs uppercase"
              />
            </div>
            {/* Quick swatches */}
            <div className="flex items-center gap-1.5 pt-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onTextColorChange(c)}
                  className={`h-5 w-5 rounded-full border transition-transform hover:scale-125 ${
                    textColor.toLowerCase() === c.toLowerCase()
                      ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">
              Urg&apos;u va Nishon Rangi (Accent & Verified Badge)
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="h-10 w-12 rounded-xl border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="h-10 font-mono text-xs uppercase"
              />
            </div>
            {/* Quick swatches */}
            <div className="flex items-center gap-1.5 pt-1">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onAccentColorChange(c)}
                  className={`h-5 w-5 rounded-full border transition-transform hover:scale-125 ${
                    accentColor.toLowerCase() === c.toLowerCase()
                      ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                      : "border-white/20"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

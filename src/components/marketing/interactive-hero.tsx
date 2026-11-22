"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Check,
  TrendingUp,
  QrCode,
  Star,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { PhoneMockup } from "./phone-mockup";
import { useI18n } from "@/components/i18n-provider";

const heroPresets = [
  {
    name: "Creator Horizon",
    theme: {
      backgroundColor: "#0d1117",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
      buttonColor: "#10b981",
      buttonTextColor: "#042f2e",
      buttonBorderColor: "#34d399",
      buttonRadius: "16px",
      textColor: "#f0fdf4",
      accentColor: "#10b981",
    },
  },
  {
    name: "Cyber Violet",
    theme: {
      backgroundColor: "#0b0b14",
      backgroundType: "gradient",
      backgroundGradient: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)",
      buttonColor: "rgba(255, 255, 255, 0.1)",
      buttonTextColor: "#ffffff",
      buttonBorderColor: "rgba(168, 85, 247, 0.4)",
      buttonRadius: "9999px",
      textColor: "#f3e8ff",
      accentColor: "#a855f7",
    },
  },
  {
    name: "Executive Navy",
    theme: {
      backgroundColor: "#0a192f",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #0a192f 0%, #020c1b 100%)",
      buttonColor: "#172a45",
      buttonTextColor: "#64ffda",
      buttonBorderColor: "#233554",
      buttonRadius: "8px",
      textColor: "#ccd6f6",
      accentColor: "#64ffda",
    },
  },
  {
    name: "Golden Sunset",
    theme: {
      backgroundColor: "#fff7ed",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(180deg, #ffedd5 0%, #fff7ed 60%, #fed7aa 100%)",
      buttonColor: "#ffffff",
      buttonTextColor: "#7c2d12",
      buttonBorderColor: "#fed7aa",
      buttonRadius: "24px",
      textColor: "#431407",
      accentColor: "#f97316",
    },
  },
];

const trustPoints = ["Zero Coding Required", "Real-Time Analytics", "Custom QR Codes"];

const platforms = [
  "youtube",
  "instagram",
  "tiktok",
  "twitter",
  "spotify",
  "github",
  "telegram",
  "twitch",
  "linkedin",
  "discord",
];

const trustAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
];

export function InteractiveHero() {
  const { t } = useI18n();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [claimedUsername, setClaimedUsername] = useState("");

  const dynamicTrustPoints = [t.hero.trust1, t.hero.trust2, t.hero.trust3];

  return (
    <section className="relative isolate overflow-hidden pb-16 pt-14 sm:pt-16 lg:pb-24">
      {/* Aurora background layer */}
      <div className="aurora" aria-hidden="true" />
      <div className="aurora-tight" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] opacity-60 dark:opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
      />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline and CTAs */}
          <div className="space-y-7 text-center lg:col-span-7 lg:text-left">
            {/* Announcement Badge */}
            <div className="animate-fade-up">
              <div className="eyebrow gap-2.5 px-3.5 py-1.5 text-[10.5px] shadow-xs">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span>{t.hero.badgeLive}</span>
                <span aria-hidden="true" className="text-emerald-600/40 dark:text-emerald-300/40">
                  •
                </span>
                <span className="font-semibold normal-case tracking-normal text-emerald-700/80 dark:text-emerald-200/80">
                  {t.hero.badgeSub}
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="animate-fade-up text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.045em] text-foreground [animation-delay:90ms] sm:text-6xl lg:text-[4.35rem]">
              <span className="text-shadow-glow">{t.hero.titleStart}</span>{" "}
              <span className="relative inline-block drop-shadow-glow">
                <span className="text-gradient-ink">{t.hero.titleHighlight}</span>
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mx-auto max-w-xl animate-fade-up text-[15px] leading-relaxed text-text-secondary [animation-delay:170ms] sm:text-lg lg:mx-0">
              {t.hero.description}
            </p>

            {/* Username Claim Input Bar */}
            <div className="mx-auto max-w-lg animate-fade-up pt-1 [animation-delay:250ms] lg:mx-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (claimedUsername) {
                    window.location.href = `/sign-up?username=${encodeURIComponent(claimedUsername)}`;
                  } else {
                    window.location.href = "/sign-up";
                  }
                }}
                className="group/claim flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white/80 p-2 shadow-soft backdrop-blur-xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:shadow-glow focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus-within:border-emerald-400/40 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-2.5">
                  <Link2 className="h-4 w-4 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
                  <span className="shrink-0 select-none text-sm font-semibold text-text-secondary">
                    biospace.com/
                  </span>
                  <input
                    type="text"
                    placeholder="yourname"
                    aria-label={t.hero.claimUsername}
                    value={claimedUsername}
                    onChange={(e) =>
                      setClaimedUsername(
                        e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "")
                      )
                    }
                    className="w-full min-w-0 bg-transparent py-2 text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-zinc-400 focus:outline-none dark:placeholder:text-zinc-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="default"
                  className="group/claim-btn h-10 shrink-0 rounded-xl px-5 text-sm"
                >
                  {t.hero.claimButton}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/claim-btn:translate-x-0.5" />
                </Button>
              </form>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
                <p className="pl-1 text-xs text-text-secondary">
                  {t.hero.freeForever}
                </p>
                <Link
                  href="/templates"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  {t.hero.browseTemplates}
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Trust row */}
            <div className="animate-fade-up space-y-4 pt-1 [animation-delay:330ms]">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {dynamicTrustPoints.map((point) => (
                  <span
                    key={point}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1.5 text-[11px] font-semibold text-text-secondary backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                    {point}
                  </span>
                ))}
              </div>

              <div className="flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <div className="flex -space-x-2.5">
                  {trustAvatars.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-background object-cover shadow-xs"
                    />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-emerald-500/[0.12] text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                    +250k
                  </div>
                </div>
                <div className="flex flex-col items-center gap-0.5 sm:items-start">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400" />
                    ))}
                    <span className="ml-1.5 text-[11px] font-semibold text-text-secondary">
                      4.9/5
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-text-secondary">
                    Loved by creators in 120+ countries
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Phone Mockup with Interactive Theme Controls */}
          <div className="flex animate-fade-up flex-col items-center justify-center [animation-delay:200ms] lg:col-span-5">
            {/* Template selector pills */}
            <div className="mb-6 flex flex-wrap justify-center gap-1 rounded-2xl border border-zinc-200/80 bg-white/70 p-1 shadow-xs backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04]">
              {heroPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPreset(index)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold tracking-[-0.01em] transition-all duration-200 ${
                    selectedPreset === index
                      ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900"
                      : "text-text-secondary hover:bg-zinc-900/[0.04] hover:text-foreground dark:hover:bg-white/[0.06] dark:hover:text-white"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Floating accent cards + phone */}
            <div className="relative">
              {/* Floating analytics card */}
              <div className="absolute -left-24 bottom-44 z-20 hidden animate-float items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-card/90 p-2.5 shadow-lift backdrop-blur-xl [animation-delay:600ms] dark:border-white/10 xl:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-text-secondary">Profile views</p>
                  <p className="text-sm font-bold text-foreground">
                    +38.2%{" "}
                    <span className="text-[9px] font-semibold text-emerald-500">this week</span>
                  </p>
                </div>
              </div>

              {/* Floating QR card */}
              <div className="absolute -right-20 top-20 z-20 hidden animate-float items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-card/90 p-2.5 shadow-lift backdrop-blur-xl [animation-delay:1.4s] dark:border-white/10 xl:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
                  <QrCode className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-text-secondary">QR scans</p>
                  <p className="text-sm font-bold text-foreground">12,480</p>
                </div>
              </div>

              {/* Phone Mockup Component */}
              <div className="transform transition-transform duration-500 ease-out-expo hover:-translate-y-1">
                <PhoneMockup theme={heroPresets[selectedPreset].theme} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform marquee band */}
      <div className="relative mt-16 sm:mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-text-secondary/80">
            Connect every platform you create on
          </p>
        </div>
        <div className="mask-fade-x mt-5 overflow-hidden">
          <div className="flex w-max animate-marquee items-center py-2 hover:[animation-play-state:paused]">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-center gap-10 pr-10"
              >
                {platforms.map((platform) => (
                  <div
                    key={`${copy}-${platform}`}
                    className="flex shrink-0 items-center gap-2 text-text-secondary/70 transition-colors hover:text-foreground"
                  >
                    <PlatformIcon platform={platform} size={18} />
                    <span className="text-sm font-semibold capitalize">{platform}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

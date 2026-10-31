"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check, Zap, Layers, BarChart3, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhoneMockup } from "./phone-mockup";

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

export function InteractiveHero() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [claimedUsername, setClaimedUsername] = useState("");

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-sky-500/15 to-purple-500/20 blur-[130px] -z-10 rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>BioSpace 2.0 is live</span>
              <span className="text-zinc-400">&bull;</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Next-gen Link-in-Bio</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.08]">
              Everything you are,{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                in one link.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
              Join over 250,000+ creators, artists, and businesses sharing their entire digital universe with a single, high-converting BioSpace link.
            </p>

            {/* Username Claim Input Bar */}
            <div className="pt-2 max-w-md mx-auto lg:mx-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (claimedUsername) {
                    window.location.href = `/sign-up?username=${encodeURIComponent(claimedUsername)}`;
                  } else {
                    window.location.href = "/sign-up";
                  }
                }}
                className="flex items-center rounded-2xl border-2 border-zinc-200 bg-white p-1.5 shadow-lg focus-within:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 transition-all"
              >
                <div className="pl-3 text-sm font-semibold text-zinc-400 dark:text-zinc-500 select-none">
                  biospace.com/
                </div>
                <input
                  type="text"
                  placeholder="yourname"
                  value={claimedUsername}
                  onChange={(e) => setClaimedUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  className="w-full bg-transparent px-1 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                />
                <Button type="submit" className="rounded-xl px-5 text-sm shrink-0">
                  Claim URL
                </Button>
              </form>
              <p className="mt-2 text-xs text-zinc-400 text-left pl-2">
                Free forever. No credit card required.
              </p>
            </div>

            {/* Trust bullet points */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Zero Coding Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Real-Time Analytics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>Custom QR Codes</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Phone Mockup with Interactive Theme Controls */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* Template selector pills */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {heroPresets.map((preset, index) => (
                <button
                  key={preset.name}
                  onClick={() => setSelectedPreset(index)}
                  className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                    selectedPreset === index
                      ? "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Phone Mockup Component */}
            <div className="transform transition-transform hover:-translate-y-1 duration-300">
              <PhoneMockup theme={heroPresets[selectedPreset].theme} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


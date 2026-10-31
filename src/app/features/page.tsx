import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { FeaturesShowcase } from "@/components/marketing/features-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Sparkles } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1">
        <div className="py-20 text-center max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Platform Capabilities</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-4">
            Engineered for Creators. Optimized for Conversions.
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Discover all the powerful features that make BioSpace the premier Link-in-Bio tool for modern creators, artists, founders, and digital brands.
          </p>
        </div>
        <FeaturesShowcase />
        <HowItWorks />
      </main>
      <MarketingFooter />
    </div>
  );
}


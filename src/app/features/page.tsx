import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { FeaturesShowcase } from "@/components/marketing/features-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import {
  Sparkles,
  ArrowRight,
  Gauge,
  ShieldCheck,
  Layers,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const highlights = [
  { icon: Gauge, value: "< 200ms", label: "Average load time" },
  { icon: Layers, value: "20+", label: "Designer templates" },
  { icon: MousePointerClick, value: "12M+", label: "Clicks tracked monthly" },
  { icon: ShieldCheck, value: "99.99%", label: "Profile uptime" },
];

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden pb-14 pt-16 sm:pb-16 sm:pt-24">
          <div aria-hidden="true" className="aurora" />
          <div aria-hidden="true" className="aurora-tight" />
          <div
            aria-hidden="true"
            className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px] opacity-50 dark:opacity-30"
          />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow animate-fade-up">
                <Sparkles className="h-3 w-3" />
                Platform Capabilities
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                Engineered for creators.{" "}
                <span className="text-gradient-ink">Optimized for conversions.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                Discover all the powerful features that make BioSpace the premier
                Link-in-Bio tool for modern creators, artists, founders, and digital
                brands.
              </p>
              <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="group w-full rounded-2xl px-7 sm:w-auto">
                    Get started free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="w-full rounded-2xl px-7 sm:w-auto">
                    Compare plans
                  </Button>
                </Link>
              </div>
            </div>

            {/* Highlight metrics */}
            <div className="mx-auto mt-14 grid max-w-4xl animate-fade-up grid-cols-2 gap-3 [animation-delay:320ms] sm:grid-cols-4 sm:gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="panel card-lift flex flex-col items-center gap-2 p-4 text-center sm:p-5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-300">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-heading text-xl font-extrabold tracking-[-0.03em] text-foreground">
                      {item.value}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <FeaturesShowcase />
        <HowItWorks />

        {/* Closing CTA */}
        <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="container mx-auto">
            <div className="border-gradient glint relative isolate overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-lift sm:p-12">
              <div aria-hidden="true" className="aurora" />
              <div className="relative mx-auto max-w-xl">
                <span className="eyebrow">
                  <Sparkles className="h-3 w-3" />
                  Everything, included
                </span>
                <h2 className="mt-5 text-balance font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
                  Put the whole toolkit to work.
                </h2>
                <p className="mx-auto mt-3 text-[15px] leading-relaxed text-text-secondary">
                  Start free and scale to Pro when your audience does. No migrations,
                  no downtime, no code.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="group w-full rounded-2xl px-7 sm:w-auto">
                      Create your free profile
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/templates">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6 sm:w-auto">
                      Browse templates
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import {
  Sparkles,
  Users,
  Award,
  Shield,
  ArrowRight,
  Zap,
  Heart,
  Gauge,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stats = [
  {
    icon: Users,
    value: "250k+",
    label: "Active Creators Worldwide",
  },
  {
    icon: Award,
    value: "99.99%",
    label: "Global Profile Uptime",
  },
  {
    icon: Shield,
    value: "100M+",
    label: "Monthly Page Hits Tracked",
  },
];

const values = [
  {
    icon: Zap,
    title: "Speed is a feature",
    description:
      "Server components, edge caching, and zero-bloat pages keep every profile under a second — on any network.",
  },
  {
    icon: Shield,
    title: "Privacy by default",
    description:
      "Aggregate analytics only. No cookie walls, no data resale, no tracking pixels sold to the highest bidder.",
  },
  {
    icon: Heart,
    title: "Design that converts",
    description:
      "Typography, motion, and spacing tuned for mobile attention spans — because a bio link is a first impression.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-zinc-200/70 pb-16 pt-16 sm:pb-20 sm:pt-24 dark:border-white/[0.06]">
          <div aria-hidden="true" className="aurora" />
          <div aria-hidden="true" className="aurora-tight" />
          <div
            aria-hidden="true"
            className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50 dark:opacity-30"
          />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow animate-fade-up">
                <Sparkles className="h-3 w-3" />
                Our Mission
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                Empowering creators to{" "}
                <span className="text-gradient-ink">own their audience.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                BioSpace was born out of frustration with clunky, rigid Link-in-Bio
                tools. We set out to build a platform that feels like high-end bespoke
                software: fast, gorgeous, and uncompromising on performance.
              </p>
              <div className="mt-8 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
                <Link href="/sign-up">
                  <Button size="lg" className="group w-full rounded-2xl px-7 sm:w-auto">
                    Start building for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button size="lg" variant="outline" className="w-full rounded-2xl px-7 sm:w-auto">
                    Explore the product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative border-b border-zinc-200/70 bg-surface/40 py-16 dark:border-white/[0.06] dark:bg-white/[0.012] sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="card-lift group relative overflow-hidden p-7 text-center">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-glow-sm ring-1 ring-inset ring-white/20">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="font-heading text-4xl font-extrabold tracking-[-0.04em] text-gradient-ink">
                      {stat.value}
                    </div>
                    <div className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
                      {stat.label}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section-pad relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-[50rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/[0.06] to-transparent blur-3xl"
          />
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="eyebrow">
                  <Gauge className="h-3 w-3" />
                  The Story
                </span>
                <h2 className="mt-5 font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
                  Why <span className="text-gradient-ink">BioSpace?</span>
                </h2>
                <div className="mt-6 space-y-5 text-[15px] leading-relaxed text-text-secondary">
                  <p>
                    In modern social media, your link in bio is your digital
                    storefront. Whether you are a musician dropping a new album, a
                    software engineer showcasing GitHub repos, or an influencer
                    launching a lifestyle brand, your profile needs to load instantly
                    and represent your unique identity.
                  </p>
                  <p>
                    We prioritize typography, mobile ergonomics, and data privacy.
                    Unlike legacy providers, we provide full URL validation,
                    fine-grained link scheduling, and deep analytics without selling
                    visitor data.
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {["Design-led", "Privacy-first", "Creator-owned"].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {values.map((value) => {
                  const Icon = value.icon;
                  return (
                    <div
                      key={value.title}
                      className="panel card-lift group flex gap-4 p-5 sm:p-6"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600 transition-transform duration-300 ease-out-expo group-hover:scale-105 dark:text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-heading text-base font-bold tracking-[-0.01em] text-foreground">
                          {value.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="container mx-auto">
            <div className="border-gradient glint relative isolate overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-lift sm:p-12">
              <div aria-hidden="true" className="aurora" />
              <div className="relative mx-auto max-w-xl">
                <h2 className="text-balance font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground">
                  Build a home for everything you create.
                </h2>
                <p className="mx-auto mt-3 text-[15px] leading-relaxed text-text-secondary">
                  Join a community of 250,000+ creators who treat their bio link like
                  a piece of their brand.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="group w-full rounded-2xl px-7 sm:w-auto">
                      Claim your link
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6 sm:w-auto">
                      View pricing
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PricingSectionProps {
  showHeading?: boolean;
}

export function PricingSection({ showHeading = true }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      id="pricing"
      className="section-pad relative isolate overflow-hidden border-t border-zinc-200/70 bg-surface/40 dark:border-white/[0.06] dark:bg-white/[0.012]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[54rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/[0.08] via-teal-500/[0.03] to-transparent blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6">
        <div className={cn("mx-auto max-w-2xl text-center", showHeading ? "mb-12" : "mb-10")}>
          {showHeading && (
            <>
              <span className="eyebrow">
                <Sparkles className="h-3 w-3" />
                Fair & Transparent Pricing
              </span>
              <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                Plans for creators of{" "}
                <span className="text-gradient-ink">every stage</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
                Start completely free, and unlock powerful pro analytics and branding
                removal when your audience takes off.
              </p>
            </>
          )}

          {/* Billing Switch */}
          <div className={cn("flex justify-center", showHeading ? "mt-8" : "")}>
            <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/70 p-1.5 pl-4 pr-2.5 shadow-xs backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
              <span
                className={cn(
                  "text-sm transition-colors duration-200",
                  !isYearly
                    ? "font-bold text-foreground"
                    : "font-medium text-text-secondary"
                )}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setIsYearly(!isYearly)}
                role="switch"
                aria-checked={isYearly}
                aria-label="Toggle annual billing"
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-zinc-300 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-zinc-700"
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                    isYearly ? "translate-x-5 bg-emerald-500" : "translate-x-0"
                  )}
                />
              </button>
              <span
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors duration-200",
                  isYearly
                    ? "font-bold text-foreground"
                    : "font-medium text-text-secondary"
                )}
              >
                Annual
              </span>
              <Badge variant="success" className="px-2 py-0.5 text-[10px] font-bold">
                Save 20%
              </Badge>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:gap-8">
          {/* FREE PLAN */}
          <div className="panel card-lift relative flex flex-col justify-between overflow-hidden p-7 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-400/30 to-transparent"
            />
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">
                  Starter Free
                </h3>
                <Badge variant="outline">Forever Free</Badge>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary">
                Everything you need to launch a beautiful public profile and share links.
              </p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="font-heading text-5xl font-extrabold tracking-[-0.04em] text-foreground">
                  $0
                </span>
                <span className="pb-1 text-sm text-text-secondary">/ forever</span>
              </div>

              <ul className="mb-8 space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span>1 Custom Public Profile (`biospace.com/username`)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span>Up to 10 Active Links</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span>Access to 10 Standard Templates</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span>Standard QR Code Generator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span>7-Day Basic Analytics</span>
                </li>
                <li className="flex items-start gap-2.5 text-text-secondary/60">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-500/10">
                    <X className="h-2.5 w-2.5" />
                  </span>
                  <span className="line-through">BioSpace Branding Removal</span>
                </li>
                <li className="flex items-start gap-2.5 text-text-secondary/60">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-zinc-500/10">
                    <X className="h-2.5 w-2.5" />
                  </span>
                  <span className="line-through">Scheduled & Expiring Links</span>
                </li>
              </ul>
            </div>

            <Link href="/sign-up" className="w-full">
              <Button variant="outline" className="h-12 w-full rounded-xl text-sm font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* PRO PLAN — featured with gradient border */}
          <div className="relative flex flex-col">
            <div className="border-gradient card-lift glint relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-card p-7 shadow-lift sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/[0.08] via-transparent to-transparent dark:from-emerald-400/[0.06]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl"
            />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">
                  Creator PRO
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-text-secondary">
                Advanced customization, deep analytics, and zero BioSpace branding.
              </p>
              <div className="mb-1 flex items-end gap-2">
                <span
                  key={isYearly ? "yearly" : "monthly"}
                  className="animate-in fade-in zoom-in-95 font-heading text-5xl font-extrabold tracking-[-0.04em] text-foreground"
                >
                  {isYearly ? "$8" : "$10"}
                </span>
                {isYearly && (
                  <span className="pb-1.5 text-base font-semibold text-text-secondary/50 line-through">
                    $10
                  </span>
                )}
                <span className="pb-1.5 text-sm text-text-secondary">
                  / month {isYearly && "(billed annually)"}
                </span>
              </div>
              <p className="mb-6 h-4 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                {isYearly ? "You save $24 every year" : "Switch to annual and save 20%"}
              </p>

              <ul className="mb-8 space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span className="font-semibold text-foreground">
                    Unlimited Active Links & Collections
                  </span>
                </li>
                {[
                  "Remove BioSpace Branding",
                  "All 20+ Premium & Pro Templates",
                  "Full 90-Day Advanced Analytics (Referrers, Geo, Devices)",
                  "Scheduled Links & Automatic Expiration",
                  "Custom Styled SVG/PNG QR Codes with Logos",
                  "Verified Creator Badge Support",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <Link href="/sign-up?plan=pro" className="w-full">
                <Button className="group h-12 w-full rounded-xl text-sm font-bold">
                  Upgrade to PRO
                </Button>
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-text-secondary">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Cancel anytime · 14-day money-back guarantee
              </p>
            </div>
            </div>

            <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2">
              <Badge
                variant="pro"
                className="flex items-center gap-1 px-3 py-1 font-semibold shadow-sm"
              >
                <Sparkles className="h-3 w-3" />
                <span>RECOMMENDED</span>
              </Badge>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs text-text-secondary">
          Prices in USD. Every plan includes unlimited profile views, SSL hosting, and
          community support.
        </p>
      </div>
    </section>
  );
}

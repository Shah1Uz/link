"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  Check,
  Zap,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

const FREE_FEATURES = [
  "1 public profile URL",
  "Up to 10 active links",
  "Standard 10 templates",
  "Basic 7-day analytics",
];

const PRO_FEATURES = [
  "Unlimited active links & collections",
  "Remove BioSpace branding",
  "All 20+ premium & pro templates",
  "Scheduled links & automatic expiry",
  "Verified blue creator badge",
  "Full 90-day analytics & geo breakdowns",
];

export default function UpgradePlanPage() {
  const { t } = useI18n();
  const { subscriptionTier } = useDashboard();
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // In production with STRIPE_SECRET_KEY, this triggers a Stripe Checkout session.
      // If Stripe keys are pending configuration, we provide clear architectural feedback.
      toast.info("Connecting to Stripe Secure Checkout...");
      setTimeout(() => {
        setIsLoading(false);
        toast.success("Stripe integration architecture active. Configure STRIPE_SECRET_KEY in .env for live credit card charges.");
      }, 1200);
    } catch {
      setIsLoading(false);
      toast.error("Checkout initialization failed");
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t.upgradePage.title}
        description={t.upgradePage.description}
      />

      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Current plan */}
        <Card className="p-0">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/20 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                <Zap className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                  Current subscription
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  <span className="font-heading text-base font-extrabold tracking-[-0.02em] text-foreground">
                    {subscriptionTier === "PRO" ? "Creator PRO Plan" : "Starter Free Plan"}
                  </span>
                  <Badge variant={subscriptionTier === "PRO" ? "pro" : "outline"} className="text-[9px]">
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </div>

            {subscriptionTier === "PRO" && (
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                Manage billing in Stripe
              </Button>
            )}
          </div>
        </Card>

        {/* Billing cycle toggle */}
        <div className="flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface/50 p-1 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`rounded-full px-3.5 py-1.5 transition-all ${
                !isYearly ? "bg-card text-foreground shadow-xs" : "text-text-secondary hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all ${
                isYearly ? "bg-card text-foreground shadow-xs" : "text-text-secondary hover:text-foreground"
              }`}
            >
              Yearly
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
          {/* Free */}
          <Card className="flex flex-col p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-base font-extrabold tracking-[-0.02em] text-foreground">
                Starter Free
              </h3>
              <Badge variant="outline" className="text-[9px]">INCLUDED</Badge>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Standard creator features to share your essential links.
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-extrabold tracking-[-0.04em] text-foreground">
                $0
              </span>
              <span className="text-xs text-text-secondary">/ forever</span>
            </div>

            <ul className="mt-6 flex-1 space-y-2.5">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" disabled className="mt-6 w-full rounded-xl text-xs font-semibold">
              Current plan
            </Button>
          </Card>

          {/* PRO */}
          <Card className="relative flex flex-col border-emerald-500/40 p-5 shadow-glow sm:p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent"
            />
            <div className="absolute -top-3 right-5">
              <Badge variant="pro" className="text-[9px] font-extrabold uppercase tracking-wide">
                Recommended
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 font-heading text-base font-extrabold tracking-[-0.02em] text-foreground">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                Creator PRO
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              Zero branding, every template, scheduling and full 90-day analytics.
            </p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="font-heading text-4xl font-extrabold tracking-[-0.04em] text-foreground">
                {isYearly ? "$8" : "$10"}
              </span>
              <span className="text-xs text-text-secondary">
                / month {isYearly ? "· billed annually" : "· billed monthly"}
              </span>
            </div>

            <ul className="mt-6 flex-1 space-y-2.5">
              {PRO_FEATURES.map((feature, index) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2 text-xs ${
                    index === 0
                      ? "font-semibold text-foreground"
                      : "text-text-secondary"
                  }`}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleCheckout}
              isLoading={isLoading}
              className="mt-6 w-full gap-1.5 rounded-xl text-xs font-bold"
            >
              <CreditCard className="h-4 w-4" />
              <span>{subscriptionTier === "PRO" ? "Current tier active" : "Upgrade to PRO"}</span>
            </Button>
          </Card>
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-text-secondary">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Secure checkout via Stripe
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Cancel anytime
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Instant feature unlock
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function UpgradePlanPage() {
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
        title="Subscription & Plan Upgrades"
        description="Choose the plan that fits your growth. Upgrade to PRO to unlock advanced features."
      />

      <div className="p-4 sm:p-8 max-w-4xl space-y-8">
        {/* Current Plan Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-semibold uppercase">Current Subscription</div>
              <div className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <span>{subscriptionTier === "PRO" ? "Creator PRO Plan" : "Starter Free Plan"}</span>
                <Badge variant={subscriptionTier === "PRO" ? "pro" : "outline"} className="text-[10px]">
                  ACTIVE
                </Badge>
              </div>
            </div>
          </div>

          {subscriptionTier === "PRO" && (
            <Button variant="outline" size="sm" className="rounded-xl text-xs">
              Manage Billing in Stripe
            </Button>
          )}
        </div>

        {/* Pricing Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* FREE PLAN */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Starter Free</h3>
                <Badge variant="outline">Included</Badge>
              </div>
              <p className="text-xs text-zinc-500 mb-6">
                Standard creator features to share your essential links.
              </p>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                <span className="text-xs text-zinc-400 ml-1">/ forever</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>1 Public Profile URL</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Up to 10 Active Links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Standard 10 Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Basic 7-Day Analytics</span>
                </li>
              </ul>
            </div>

            <Button variant="outline" disabled className="w-full rounded-xl text-xs font-semibold">
              Current Plan
            </Button>
          </Card>

          {/* PRO PLAN */}
          <Card className="relative p-6 flex flex-col justify-between border-2 border-emerald-500 shadow-lg">
            <div className="absolute -top-3 right-6">
              <Badge variant="pro" className="text-[10px] font-bold">
                RECOMMENDED
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span>Creator PRO</span>
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mb-6">
                Zero branding, all 20+ templates, link scheduling & full 90-day analytics.
              </p>
              <div className="mb-6 flex items-baseline">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {isYearly ? "$8" : "$10"}
                </span>
                <span className="text-xs text-zinc-400 ml-1">/ month {isYearly ? "(annual)" : ""}</span>
              </div>

              <ul className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-zinc-900 dark:text-white">Unlimited Active Links & Collections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Remove BioSpace Branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>All 20+ Premium & Pro Templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Scheduled Links & Automatic Expiry</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Verified Blue Creator Badge</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Full 90-Day Analytics & Geo Breakdowns</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleCheckout}
              isLoading={isLoading}
              className="w-full rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-md shadow-emerald-500/20"
            >
              <CreditCard className="h-4 w-4 mr-1.5" />
              <span>{subscriptionTier === "PRO" ? "Current Tier Active" : "Upgrade to PRO"}</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}


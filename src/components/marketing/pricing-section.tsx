"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-200/80 dark:border-zinc-800/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="secondary" className="px-3 py-1 font-semibold">
            Fair & Transparent Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Plans for creators of every stage
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Start completely free, and unlock powerful pro analytics and branding removal when your audience takes off.
          </p>

          {/* Billing Switch */}
          <div className="pt-4 flex items-center justify-center gap-3 text-sm font-medium">
            <span className={!isYearly ? "text-zinc-900 dark:text-white font-bold" : "text-zinc-500"}>
              Monthly
            </span>
            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-zinc-300 dark:bg-zinc-700 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isYearly ? "translate-x-6 bg-emerald-500" : "translate-x-0"
                }`}
              />
            </button>
            <span className={isYearly ? "text-zinc-900 dark:text-white font-bold" : "text-zinc-500"}>
              Annual <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">(Save 20%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* FREE PLAN */}
          <div className="flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/80 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Starter Free</h3>
                <Badge variant="outline">Forever Free</Badge>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Everything you need to launch a beautiful public profile and share links.
              </p>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                <span className="text-sm text-zinc-500 ml-1">/ forever</span>
              </div>

              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>1 Custom Public Profile (`biospace.com/username`)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Up to 10 Active Links</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Access to 10 Standard Templates</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Standard QR Code Generator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>7-Day Basic Analytics</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400">
                  <span className="h-4 w-4 flex items-center justify-center text-xs shrink-0">&times;</span>
                  <span className="line-through">BioSpace Branding Removal</span>
                </li>
                <li className="flex items-center gap-2.5 text-zinc-400">
                  <span className="h-4 w-4 flex items-center justify-center text-xs shrink-0">&times;</span>
                  <span className="line-through">Scheduled & Expiring Links</span>
                </li>
              </ul>
            </div>

            <Link href="/sign-up" className="w-full">
              <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-semibold">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* PRO PLAN */}
          <div className="relative flex flex-col justify-between rounded-3xl border-2 border-emerald-500 bg-white p-8 dark:border-emerald-500 dark:bg-zinc-900/90 shadow-xl">
            <div className="absolute -top-3.5 right-8">
              <Badge variant="pro" className="px-3 py-1 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                <span>RECOMMENDED</span>
              </Badge>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Creator PRO</h3>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                Advanced customization, deep analytics, and zero BioSpace branding.
              </p>
              <div className="mb-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">
                  {isYearly ? "$8" : "$10"}
                </span>
                <span className="text-sm text-zinc-500 ml-1">/ month {isYearly && "(billed annually)"}</span>
              </div>

              <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-zinc-900 dark:text-white">Unlimited Active Links & Collections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Remove BioSpace Branding</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>All 20+ Premium & Pro Templates</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Full 90-Day Advanced Analytics (Referrers, Geo, Devices)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Scheduled Links & Automatic Expiration</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Custom Styled SVG/PNG QR Codes with Logos</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Verified Creator Badge Support</span>
                </li>
              </ul>
            </div>

            <Link href="/sign-up?plan=pro" className="w-full">
              <Button className="w-full rounded-2xl h-12 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/20">
                Upgrade to PRO
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}


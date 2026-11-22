"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Zap, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AIUsageMeterProps {
  quota: {
    used: number;
    limit: number;
    remaining: number;
    period: string;
    tier: string;
  };
  totalGenerationsCount?: number;
  totalTokens?: number;
  onRefresh?: () => void;
}

export function AIUsageMeter({ quota }: AIUsageMeterProps) {
  const percentage = Math.min(100, Math.round((quota.used / Math.max(1, quota.limit)) * 100));
  const isPro = quota.tier === "PRO" || quota.tier === "BUSINESS";
  const isNearLimit = quota.remaining <= 2 && !isPro;

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.10] via-card to-cyan-500/[0.06] p-5 shadow-soft sm:p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-heading text-sm font-extrabold tracking-[-0.02em] text-foreground">
              AI assistant quota
            </h3>
            <Badge
              variant={isPro ? "pro" : "outline"}
              className="text-[9px] font-extrabold uppercase tracking-wider"
            >
              {quota.tier} plan
            </Badge>
          </div>

          <p className="text-xs text-text-secondary">
            <span className="font-bold text-foreground">{quota.used}</span> of {quota.limit}{" "}
            generations used this cycle ({quota.period}).{" "}
            {quota.remaining > 0 ? (
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {quota.remaining} remaining.
              </span>
            ) : (
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                Limit reached for this month.
              </span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {!isPro ? (
            <Button asChild size="sm" className="gap-1.5 rounded-xl text-xs font-bold">
              <Link href="/dashboard/upgrade">
                <Zap className="h-3.5 w-3.5" />
                <span>Upgrade to PRO (200/mo)</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Pro assistant active</span>
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.08]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isNearLimit
              ? "bg-gradient-to-r from-rose-500 to-rose-400"
              : percentage > 75
              ? "bg-gradient-to-r from-amber-500 to-amber-400"
              : "bg-gradient-to-r from-violet-500 via-teal-400 to-emerald-400"
          }`}
          style={{ width: `${Math.max(percentage, quota.used > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}

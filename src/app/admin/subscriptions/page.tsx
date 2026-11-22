import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Sparkles,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const [totalUsers, proUsers, freeUsers, usersWithSubs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionTier: "PRO" } }),
    prisma.user.count({ where: { subscriptionTier: "FREE" } }),
    prisma.user.findMany({
      where: { subscriptionTier: "PRO" },
      include: { profile: true, subscription: true },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const estimatedMRR = proUsers * 10;
  const conversionRate =
    totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div>
      <AdminHeader
        title="Subscription & Billing Intelligence"
        description="Monitor Free vs Pro creator tier conversion, MRR estimates, and Stripe customer linkages."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* KPI summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="card-lift relative overflow-hidden p-5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
            />
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                Active pro creators
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
              {proUsers.toLocaleString()}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" />
              {conversionRate}% conversion
            </p>
          </Card>

          <Card className="card-lift relative overflow-hidden p-5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
            />
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                Starter free creators
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.03] text-cyan-600 dark:text-cyan-400">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
              {freeUsers.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-text-secondary">
              Potential upsell pool
            </p>
          </Card>

          <Card className="card-lift relative overflow-hidden p-5">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
            />
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                Estimated monthly run-rate
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.03] text-violet-600 dark:text-violet-300">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
              ${estimatedMRR.toLocaleString()}
            </p>
            <p className="mt-2 text-[11px] text-text-secondary">
              Based on $10/mo per PRO creator
            </p>
          </Card>
        </div>

        {/* Conversion bar */}
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                Free → PRO conversion
              </h2>
              <p className="mt-0.5 text-[11px] text-text-secondary">
                Share of all {totalUsers.toLocaleString()} creator accounts on the
                PRO tier
              </p>
            </div>
            <span className="font-heading text-lg font-extrabold tracking-[-0.03em] text-emerald-700 dark:text-emerald-300">
              {conversionRate}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Number(conversionRate)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="PRO conversion rate"
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/[0.06]"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-glow-sm transition-all duration-500"
              style={{ width: `${Math.min(100, Number(conversionRate))}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-secondary">
            <span className="font-semibold text-foreground">
              {proUsers.toLocaleString()} PRO
            </span>
            <span>{freeUsers.toLocaleString()} FREE</span>
          </div>
        </Card>

        {/* PRO subscriptions table */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Active PRO subscriptions
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  Stripe-linked creator billing records
                </p>
              </div>
            </div>
            <Badge variant="pro" className="shrink-0">
              {usersWithSubs.length} subscribers
            </Badge>
          </div>

          {usersWithSubs.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <CreditCard className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No PRO subscribers yet
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                No active PRO subscribers are recorded in the database.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "User",
                      "Profile",
                      "Plan Status",
                      "Stripe Ref",
                      "Subscribed Date",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {usersWithSubs.map((u) => (
                    <tr
                      key={u.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 text-[10px] font-extrabold uppercase text-amber-950 ring-1 ring-amber-500/20">
                            {(u.name || u.email).slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-bold text-foreground">
                              {u.name || "Creator"}
                            </div>
                            <div className="truncate text-[10.5px] text-text-secondary">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                        /{u.profile?.username || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="pro">PRO ACTIVE</Badge>
                      </td>
                      <td className="max-w-[14rem] px-4 py-3.5">
                        <span className="block truncate font-mono text-[10.5px] text-text-secondary">
                          {u.subscription?.stripeCustomerId || "manual_seed_grant"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] text-text-secondary">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

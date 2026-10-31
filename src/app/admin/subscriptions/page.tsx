import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, TrendingUp, Sparkles, DollarSign } from "lucide-react";

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

  return (
    <div>
      <AdminHeader
        title="Subscription & Billing Intelligence"
        description="Monitor Free vs Pro creator tier conversion, MRR estimates, and Stripe customer linkages."
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-6xl">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Active Pro Creators</span>
              <Sparkles className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {proUsers.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-emerald-600 font-semibold">
              {totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}% Conversion
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Starter Free Creators</span>
              <CreditCard className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              {freeUsers.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-zinc-400">Potential upsell pool</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Estimated Monthly Run-Rate</span>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-white">
              ${estimatedMRR.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-purple-600 font-semibold">Based on \$10/mo</p>
          </Card>
        </div>

        {/* Pro Subscriptions Table */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-500" />
            <span>Active Pro Subscriptions</span>
          </h3>

          {usersWithSubs.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              No active PRO subscribers recorded in the database yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Profile</th>
                    <th className="py-3 px-4">Plan Status</th>
                    <th className="py-3 px-4">Stripe Ref</th>
                    <th className="py-3 px-4">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {usersWithSubs.map((u) => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {u.name || "Creator"}
                        </div>
                        <div className="text-zinc-400 text-[11px]">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        /{u.profile?.username || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="pro">PRO ACTIVE</Badge>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
                        {u.subscription?.stripeCustomerId || "manual_seed_grant"}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono text-[11px]">
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


import React from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Eye,
  MousePointerClick,
  Percent,
  Link2,
  TrendingUp,
  ArrowRight,
  Plus,
  Palette,
  QrCode,
  Sparkles,
} from "lucide-react";
import { OverviewCharts } from "@/components/dashboard/overview-charts";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      links: {
        orderBy: { clicksCount: "desc" },
      },
      analyticsEvents: {
        take: 100,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const totalViews = profile?.analyticsEvents.filter((e) => e.type === "VIEW").length || 0;
  const totalClicks = profile?.links.reduce((acc, l) => acc + l.clicksCount, 0) || 0;
  const activeLinks = profile?.links.filter((l) => l.isEnabled).length || 0;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  // Top 3 performing links
  const topLinks = (profile?.links || []).slice(0, 3);

  return (
    <div>
      <DashboardHeader
        title={`Welcome back, ${profile?.displayName || user.name || "Creator"}!`}
        description="Here is an overview of your BioSpace link activity and visitor metrics."
        action={
          <Link href="/dashboard/links">
            <Button size="sm" className="rounded-xl gap-1.5 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              <span>Add Link</span>
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-8 space-y-8 max-w-5xl">
        {/* KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Total Profile Views</span>
              <Eye className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalViews.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              &uarr; Active tracking
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Total Link Clicks</span>
              <MousePointerClick className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalClicks.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
              Cumulative clicks
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Click-Through Rate</span>
              <Percent className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {ctr}%
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Visitor conversion
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Active Links</span>
              <Link2 className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {activeLinks}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Published on profile
            </p>
          </Card>
        </div>

        {/* Performance Chart Component */}
        <OverviewCharts />

        {/* Two-Column Grid: Top Links + Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Links */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span>Top-Performing Links</span>
              </h3>
              <Link href="/dashboard/links" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                Manage
              </Link>
            </div>

            {topLinks.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No links added yet.</p>
            ) : (
              <div className="space-y-3">
                {topLinks.map((l, i) => (
                  <div
                    key={l.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-800"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {l.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{l.url}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {l.clicksCount}
                      </span>
                      <span className="text-[10px] text-zinc-400 ml-1">clicks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions Card */}
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>Quick Actions</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Boost your profile engagement with these recommended shortcuts:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/dashboard/appearance">
                  <div className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500/50 dark:border-zinc-800 dark:hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40 text-center transition-all cursor-pointer">
                    <Palette className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs font-semibold block text-zinc-900 dark:text-white">Edit Theme</span>
                  </div>
                </Link>
                <Link href="/dashboard/templates">
                  <div className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500/50 dark:border-zinc-800 dark:hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40 text-center transition-all cursor-pointer">
                    <Sparkles className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                    <span className="text-xs font-semibold block text-zinc-900 dark:text-white">Templates</span>
                  </div>
                </Link>
                <Link href="/dashboard/qr-code">
                  <div className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500/50 dark:border-zinc-800 dark:hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40 text-center transition-all cursor-pointer">
                    <QrCode className="h-4 w-4 text-sky-500 mx-auto mb-1" />
                    <span className="text-xs font-semibold block text-zinc-900 dark:text-white">Get QR Code</span>
                  </div>
                </Link>
                <Link href="/dashboard/analytics">
                  <div className="p-3 rounded-xl border border-zinc-200 hover:border-emerald-500/50 dark:border-zinc-800 dark:hover:border-emerald-500/50 bg-zinc-50 dark:bg-zinc-800/40 text-center transition-all cursor-pointer">
                    <Percent className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-xs font-semibold block text-zinc-900 dark:text-white">Full Analytics</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>Profile Status</span>
              <Badge variant="success">Published & Live</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


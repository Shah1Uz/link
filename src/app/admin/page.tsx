import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  Eye,
  MousePointerClick,
  LayoutTemplate,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    totalUsers,
    totalProfiles,
    totalLinks,
    totalTemplates,
    totalViews,
    totalClicks,
    proUsers,
    recentUsers,
    pendingReports,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count(),
    prisma.link.count(),
    prisma.template.count({ where: { isPublished: true } }),
    prisma.analyticsEvent.count({ where: { type: "VIEW" } }),
    prisma.analyticsEvent.count({ where: { type: "CLICK" } }),
    prisma.user.count({ where: { subscriptionTier: "PRO" } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.adminAuditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const freeUsers = totalUsers - proUsers;

  return (
    <div>
      <AdminHeader
        title="Admin Mission Control"
        description="Global platform KPIs, user activity, content moderation flags, and audit telemetry."
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-6xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Total Users</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalUsers.toLocaleString()}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{freeUsers} Free</span>
              <span>&bull;</span>
              <span className="font-semibold text-amber-500">{proUsers} Pro</span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Public Profiles</span>
              <UserCheck className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalProfiles.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {totalLinks} links deployed
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Platform Impressions</span>
              <Eye className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalViews.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {totalClicks.toLocaleString()} total link clicks
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Published Themes</span>
              <LayoutTemplate className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {totalTemplates}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Across 10 categories
            </p>
          </Card>
        </div>

        {/* Content Moderation Alert Banner if reports exist */}
        {pendingReports > 0 && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <span className="font-bold text-sm">
                  {pendingReports} reported item{pendingReports > 1 ? "s" : ""} awaiting review
                </span>
                <p className="text-xs opacity-90">
                  Users or automated filters flagged links or profiles for policy review.
                </p>
              </div>
            </div>
            <Link href="/admin/moderation">
              <span className="text-xs font-bold underline cursor-pointer">
                Review Queue &rarr;
              </span>
            </Link>
          </div>
        )}

        {/* Two-Column Grid: Recent Users & Recent Audit Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                <span>Recent Registrations</span>
              </h3>
              <Link href="/admin/users" className="text-xs font-semibold text-emerald-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                      {u.name?.slice(0, 2) || u.email.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {u.name || "Anonymous User"}
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={u.subscriptionTier === "PRO" ? "pro" : "outline"} className="text-[9px]">
                      {u.subscriptionTier}
                    </Badge>
                    <Badge variant={u.role === "ADMIN" ? "destructive" : "secondary"} className="text-[9px]">
                      {u.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Admin Audit Logs */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-500" />
                <span>Recent Audit Activity</span>
              </h3>
              <Link href="/admin/logs" className="text-xs font-semibold text-red-600 hover:underline">
                Full Log
              </Link>
            </div>

            {recentAuditLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No audit records yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-zinc-400 font-sans">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      By: <span className="font-medium text-zinc-700 dark:text-zinc-300">{log.adminEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


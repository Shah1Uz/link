import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Eye,
  LayoutTemplate,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

/** Purely decorative micro-chart — communicates rhythm, not real values. */
function SparkBars({
  values,
  tone = "emerald",
}: {
  values: number[];
  tone?: "emerald" | "teal" | "cyan" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-400/80",
    teal: "from-teal-500/20 to-teal-400/80",
    cyan: "from-cyan-500/20 to-cyan-400/80",
    amber: "from-amber-500/20 to-amber-400/80",
  };

  return (
    <div aria-hidden="true" className="flex h-7 items-end gap-[3px] opacity-80">
      {values.map((height, index) => (
        <span
          key={index}
          style={{ height: `${height}%` }}
          className={`w-1 rounded-full bg-gradient-to-t ${tones[tone]}`}
        />
      ))}
    </div>
  );
}

function KpiTile({
  icon: Icon,
  label,
  value,
  footer,
  tone,
  spark,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  footer: React.ReactNode;
  tone: "emerald" | "teal" | "cyan" | "amber";
  spark: number[];
}) {
  const tileStyles: Record<typeof tone, string> = {
    emerald:
      "border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400",
    teal: "border-teal-500/20 bg-gradient-to-b from-teal-500/15 to-teal-500/[0.03] text-teal-600 dark:text-teal-400",
    cyan: "border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.03] text-cyan-600 dark:text-cyan-400",
    amber:
      "border-amber-500/20 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.03] text-amber-600 dark:text-amber-400",
  };

  return (
    <Card className="card-lift group relative overflow-hidden p-5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
      />
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${tileStyles[tone]}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <SparkBars values={spark} tone={tone} />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
        {label}
      </p>
      <p className="mt-1 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
        {value}
      </p>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] leading-tight text-text-secondary">
        {footer}
      </div>
    </Card>
  );
}

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
  const sparkA = [42, 68, 50, 84, 58, 94, 72];
  const sparkB = [58, 40, 76, 52, 88, 62, 96];
  const sparkC = [66, 44, 82, 56, 74, 48, 90];
  const sparkD = [38, 72, 54, 88, 46, 78, 64];

  return (
    <div>
      <AdminHeader
        title="Admin Mission Control"
        description="Global platform KPIs, user activity, content moderation flags, and audit telemetry."
      />

      <div className="mx-auto max-w-6xl space-y-6 p-6 sm:space-y-8 sm:p-8">
        {/* Command strip */}
        <section className="panel glint animate-fade-up relative isolate overflow-hidden p-6 sm:p-8">
          <div className="aurora" />
          <div
            aria-hidden="true"
            className="grid-pattern absolute inset-0 opacity-60 dark:opacity-25"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-glow"
                />
                Platform telemetry
              </span>

              <h2 className="mt-4 font-heading text-[1.75rem] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-4xl">
                Everything that matters,{" "}
                <span className="text-gradient-ink">right now.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                Live signals across BioSpace — creators, links, traffic and
                moderation. Every administrative action is written to the
                immutable audit trail.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Button asChild size="sm" className="gap-1.5 rounded-xl">
                  <Link href="/admin/moderation">
                    <span>Review queue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                >
                  <Link href="/admin/users">
                    <Users className="h-3.5 w-3.5" />
                    <span>User directory</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-xl"
                >
                  <Link href="/admin/logs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Audit trail</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Live status chips */}
            <div className="grid w-full shrink-0 grid-cols-2 gap-2.5 sm:gap-3 lg:w-64">
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-3 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  System
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-glow"
                  />
                  Operational
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-3 backdrop-blur-sm">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  Reports
                </p>
                <p className="mt-1 text-[13px] font-bold text-amber-700 dark:text-amber-300">
                  {pendingReports} pending
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  Creators
                </p>
                <p className="mt-1 text-[13px] font-bold text-foreground">
                  {totalUsers.toLocaleString()} total
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200/80 bg-white/60 p-3 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.04]">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  Live links
                </p>
                <p className="mt-1 text-[13px] font-bold text-foreground">
                  {totalLinks.toLocaleString()} deployed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KPI cards */}
        <div
          className="animate-fade-up grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ animationDelay: "80ms" }}
        >
          <KpiTile
            icon={Users}
            tone="emerald"
            label="Total users"
            value={totalUsers.toLocaleString()}
            spark={sparkA}
            footer={
              <>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {freeUsers.toLocaleString()} free
                </span>
                <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">
                  &middot;
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {proUsers.toLocaleString()} pro
                </span>
              </>
            }
          />

          <KpiTile
            icon={UserCheck}
            tone="teal"
            label="Public profiles"
            value={totalProfiles.toLocaleString()}
            spark={sparkB}
            footer={<span>{totalLinks.toLocaleString()} links deployed</span>}
          />

          <KpiTile
            icon={Eye}
            tone="cyan"
            label="Platform impressions"
            value={totalViews.toLocaleString()}
            spark={sparkC}
            footer={
              <span>{totalClicks.toLocaleString()} tracked link clicks</span>
            }
          />

          <KpiTile
            icon={LayoutTemplate}
            tone="amber"
            label="Published themes"
            value={totalTemplates.toLocaleString()}
            spark={sparkD}
            footer={<span>Across 10 creator categories</span>}
          />
        </div>

        {/* Pending reports callout */}
        {pendingReports > 0 && (
          <div
            className="animate-fade-up relative isolate flex flex-col gap-4 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.1] via-amber-400/[0.04] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-600 shadow-xs dark:text-amber-300">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                    Moderation queue needs attention
                  </h3>
                  <Badge variant="warning">{pendingReports} pending</Badge>
                </div>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-text-secondary">
                  Users or automated filters flagged links and profiles for
                  policy review. Resolve or dismiss each item to keep the
                  platform trustworthy.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 rounded-xl border-amber-500/40 text-amber-800 hover:bg-amber-500/10 dark:text-amber-300"
            >
              <Link href="/admin/moderation">
                <span>Review queue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* Recent registrations + audit feed */}
        <div
          className="animate-fade-up grid grid-cols-1 items-start gap-6 lg:grid-cols-2"
          style={{ animationDelay: "160ms" }}
        >
          {/* Recent registrations */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                    Recent registrations
                  </h3>
                  <p className="truncate text-[11px] text-text-secondary">
                    Newest creator accounts
                  </p>
                </div>
              </div>
              <Link
                href="/admin/users"
                className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-300"
              >
                <span>View all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-2.5 sm:p-3">
              {recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <Users className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    No registrations yet
                  </p>
                  <p className="max-w-xs text-[11px] leading-relaxed text-text-secondary">
                    New creator accounts will appear here as soon as they sign up.
                  </p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {recentUsers.map((u) => {
                    const displayName = u.name || "Anonymous User";
                    const avatarSrc = u.profile?.avatarUrl || u.avatar || null;
                    return (
                      <li
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-zinc-200/80 hover:bg-zinc-50/80 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/90 via-teal-400/90 to-cyan-400/90 text-[10px] font-extrabold uppercase text-emerald-950 ring-1 ring-emerald-500/20">
                            {avatarSrc ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={avatarSrc}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              displayName.slice(0, 2)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-bold text-foreground">
                              {displayName}
                            </div>
                            <div className="truncate text-[10px] text-text-secondary">
                              {u.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <Badge
                            variant={u.subscriptionTier === "PRO" ? "pro" : "outline"}
                            className="px-2 py-0.5 text-[9px]"
                          >
                            {u.subscriptionTier}
                          </Badge>
                          <Badge
                            variant={u.role === "ADMIN" ? "destructive" : "secondary"}
                            className="px-2 py-0.5 text-[9px]"
                          >
                            {u.role}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>

          {/* Recent audit activity */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.03] text-violet-600 dark:text-violet-300">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                    Recent audit activity
                  </h3>
                  <p className="truncate text-[11px] text-text-secondary">
                    Immutable admin action trail
                  </p>
                </div>
              </div>
              <Link
                href="/admin/logs"
                className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-300"
              >
                <span>Full log</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-2.5 sm:p-3">
              {recentAuditLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/[0.08] dark:bg-white/[0.03]">
                    <Clock className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">
                    No audit records yet
                  </p>
                  <p className="max-w-xs text-[11px] leading-relaxed text-text-secondary">
                    Administrative actions will be logged here automatically.
                  </p>
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {recentAuditLogs.map((log, index) => (
                    <li
                      key={log.id}
                      className="flex items-start gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 transition-colors hover:border-zinc-200/80 hover:bg-zinc-50/80 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.03]"
                    >
                      <div className="relative flex flex-col items-center self-stretch">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                        {index < recentAuditLogs.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="mt-1 w-px flex-1 bg-gradient-to-b from-emerald-500/30 to-transparent"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <Badge
                            variant="outline"
                            className="max-w-full truncate px-2 py-0.5 font-mono text-[9.5px]"
                          >
                            {log.action}
                          </Badge>
                          <span className="shrink-0 font-mono text-[9.5px] text-text-secondary">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10.5px] text-text-secondary">
                          by{" "}
                          <span className="font-semibold text-foreground">
                            {log.adminEmail}
                          </span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Footer note */}
        <div className="flex items-center justify-center gap-2 text-center">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <p className="text-[10.5px] font-medium tracking-wide text-text-secondary">
            BioSpace admin console — privileged access, all actions audited.
          </p>
        </div>
      </div>
    </div>
  );
}

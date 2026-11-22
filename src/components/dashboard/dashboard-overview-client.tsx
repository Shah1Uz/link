"use client";

import React from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MousePointerClick,
  Percent,
  Link2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Plus,
  Palette,
  QrCode,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Activity,
  BarChart3,
  Wand2,
} from "lucide-react";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { useI18n } from "@/components/i18n-provider";

type Trend = { dir: "up" | "down" | "flat"; label: string } | null;

function buildTrend(current: number, previous: number): Trend {
  if (current === 0 && previous === 0) return null;
  if (previous === 0) return { dir: "up", label: `${current} this week` };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { dir: "flat", label: "0%" };
  return { dir: pct > 0 ? "up" : "down", label: `${pct > 0 ? "+" : ""}${pct}%` };
}

function timeAgo(dateInput: Date | string) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const ACCENTS = {
  emerald: {
    tile: "border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400",
  },
  cyan: {
    tile: "border-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400",
  },
  violet: {
    tile: "border-violet-500/25 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.04] text-violet-600 dark:text-violet-400",
  },
  amber: {
    tile: "border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-600 dark:text-amber-400",
  },
} as const;

function TrendChip({ trend }: { trend: Trend }) {
  if (!trend) return null;
  const styles =
    trend.dir === "up"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : trend.dir === "down"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
      : "border-border/70 bg-surface/60 text-text-secondary";
  const Icon = trend.dir === "up" ? TrendingUp : trend.dir === "down" ? TrendingDown : Minus;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${styles}`}
    >
      <Icon className="h-3 w-3" />
      {trend.label}
    </span>
  );
}

export interface DashboardOverviewClientProps {
  displayName: string;
  username: string;
  isPublished: boolean;
  avatarUrl: string | null;
  bio: string | null;
  hasTheme: boolean;
  viewsAllTime: number;
  totalClicks: number;
  ctr: string;
  activeLinks: number;
  totalLinksCount: number;
  viewsThisWeek: number;
  viewsPrevWeek: number;
  clicksThisWeek: number;
  clicksPrevWeek: number;
  topLinks: Array<{
    id: string;
    title: string;
    url: string;
    clicksCount: number;
    isPinned: boolean;
  }>;
  maxClicks: number;
  recentEvents: Array<{
    id: string;
    type: string;
    linkId: string | null;
    country: string | null;
    device: string | null;
    referrer: string | null;
    createdAt: string;
  }>;
  allLinks: Array<{
    id: string;
    title: string;
  }>;
}

export function DashboardOverviewClient({
  displayName,
  username,
  isPublished,
  avatarUrl,
  bio,
  hasTheme,
  viewsAllTime,
  totalClicks,
  ctr,
  activeLinks,
  totalLinksCount,
  viewsThisWeek,
  viewsPrevWeek,
  clicksThisWeek,
  clicksPrevWeek,
  topLinks,
  maxClicks,
  recentEvents,
  allLinks,
}: DashboardOverviewClientProps) {
  const { t } = useI18n();

  const kpis = [
    {
      label: t.dashboard.profileViews,
      value: viewsAllTime.toLocaleString(),
      hint: t.dashboard.hints.views,
      icon: Eye,
      accent: "emerald" as const,
      trend: buildTrend(viewsThisWeek, viewsPrevWeek),
    },
    {
      label: t.dashboard.linkClicks,
      value: totalClicks.toLocaleString(),
      hint: t.dashboard.hints.clicks,
      icon: MousePointerClick,
      accent: "cyan" as const,
      trend: buildTrend(clicksThisWeek, clicksPrevWeek),
    },
    {
      label: t.dashboard.clickThroughRate,
      value: `${ctr}%`,
      hint: t.dashboard.hints.ctr,
      icon: Percent,
      accent: "violet" as const,
      trend: null as Trend,
    },
    {
      label: t.dashboard.activeLinks,
      value: String(activeLinks),
      hint: `${totalLinksCount} ${t.dashboard.hints.active}`,
      icon: Link2,
      accent: "amber" as const,
      trend: null as Trend,
    },
  ];

  const checklist = [
    { label: t.dashboard.checklist.avatar, done: Boolean(avatarUrl) },
    { label: t.dashboard.checklist.bio, done: Boolean(bio && bio.length > 0) },
    { label: t.dashboard.checklist.threeLinks, done: totalLinksCount >= 3 },
    { label: t.dashboard.checklist.theme, done: hasTheme },
    { label: t.dashboard.checklist.publish, done: isPublished },
  ];
  const completedSteps = checklist.filter((item) => item.done).length;
  const checklistProgress = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div>
      <DashboardHeader
        title={`${t.dashboard.welcomeBack}, ${displayName.split(" ")[0]}!`}
        description={t.dashboard.overviewSubtitle}
        action={
          <>
            <a href={`/${username}`} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t.dashboard.viewLivePage}</span>
              </Button>
            </a>
            <Link href="/dashboard/links">
              <Button size="sm" className="gap-1.5 rounded-xl text-xs font-semibold">
                <Plus className="h-4 w-4" />
                <span>{t.dashboard.addLink}</span>
              </Button>
            </Link>
          </>
        }
      />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="card-lift p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      {kpi.label}
                    </p>
                    <p className="mt-2 font-heading text-[1.6rem] font-extrabold leading-none tracking-[-0.04em] text-foreground tabular-nums sm:text-[2rem]">
                      {kpi.value}
                    </p>
                  </div>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${ACCENTS[kpi.accent].tile}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TrendChip trend={kpi.trend} />
                  <span className="text-[11px] text-text-secondary">{kpi.hint}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* AI assistant banner */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-500/[0.10] via-emerald-500/[0.05] to-cyan-500/[0.08] p-5 shadow-soft sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(60%_120%_at_100%_50%,rgba(139,92,246,0.18),transparent_70%)]"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_12px_26px_-12px_rgba(99,102,241,0.8)]">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h4 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                  <span>{t.dashboard.aiAssistant}</span>
                  <Badge variant="pro" className="text-[9px] font-extrabold uppercase">
                    New
                  </Badge>
                </h4>
                <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-text-secondary">
                  {t.dashboard.aiDescription}
                </p>
              </div>
            </div>
            <Link href="/dashboard/ai" className="shrink-0">
              <Button
                size="sm"
                className="gap-1.5 rounded-xl text-xs font-bold"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>{t.dashboard.openAssistant}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Performance chart */}
        <OverviewCharts />

        {/* Top links + quick actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-0 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                    {t.dashboard.topPerformingLinks}
                  </h3>
                  <p className="text-[11px] text-text-secondary">{t.dashboard.rankedByClicks}</p>
                </div>
              </div>
              <Link
                href="/dashboard/links"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400"
              >
                {t.dashboard.manage}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 sm:p-5">
              {topLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-9 text-center">
                  <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-text-secondary">
                    <Link2 className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-foreground">{t.dashboard.noLinksYet}</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-text-secondary">
                    {t.dashboard.noLinksDesc}
                  </p>
                  <Link href="/dashboard/links" className="mt-3">
                    <Button size="sm" className="gap-1.5 rounded-xl text-xs">
                      <Plus className="h-3.5 w-3.5" />
                      {t.dashboard.addLink}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/30 p-3 transition-all duration-200 ease-out-soft hover:border-emerald-500/30 hover:bg-surface/60"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold ${
                          index === 0
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950"
                            : "border border-border/70 bg-background/60 text-text-secondary"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-bold text-foreground">
                            {link.title}
                          </p>
                          {link.isPinned && (
                            <Badge variant="secondary" className="text-[9px]">
                              {t.dashboard.pinned}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                          {link.url}
                        </p>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                            style={{ width: `${Math.max(4, (link.clicksCount / maxClicks) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-heading text-sm font-extrabold tabular-nums text-foreground">
                          {link.clicksCount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-text-secondary">{t.dashboard.clicks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.dashboard.quickActions}
                </h3>
                <p className="text-[11px] text-text-secondary">{t.dashboard.recommendedSteps}</p>
              </div>
            </div>

            <div className="mt-4 grid flex-1 grid-cols-2 gap-2.5">
              {[
                { href: "/dashboard/appearance", label: t.dashboard.editTheme, icon: Palette, desc: t.dashboard.editThemeDesc },
                { href: "/dashboard/templates", label: t.dashboard.templatesAction, icon: Sparkles, desc: t.dashboard.templatesActionDesc },
                { href: "/dashboard/qr", label: t.dashboard.getQr, icon: QrCode, desc: t.dashboard.getQrDesc },
                { href: "/dashboard/analytics", label: t.dashboard.analyticsAction, icon: BarChart3, desc: t.dashboard.analyticsActionDesc },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group flex flex-col justify-between rounded-xl border border-border/70 bg-surface/40 p-3 transition-all duration-200 ease-out-soft hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-surface/70 hover:shadow-soft"
                  >
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="mt-2">
                      <p className="text-[12px] font-bold text-foreground">{action.label}</p>
                      <p className="text-[10px] text-text-secondary">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
              <span className="text-[11px] font-medium text-text-secondary">{t.dashboard.profileStatus}</span>
              <Badge variant={isPublished ? "success" : "warning"}>
                {isPublished ? t.dashboard.publishedLive : t.dashboard.hidden}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Recent activity + launch checklist */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-0 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Activity className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                    {t.dashboard.recentActivity}
                  </h3>
                  <p className="text-[11px] text-text-secondary">{t.dashboard.latestSignals}</p>
                </div>
              </div>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400"
              >
                {t.dashboard.allAnalytics}
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 sm:p-5">
              {recentEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-8 text-center">
                  <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-text-secondary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <p className="text-sm font-bold text-foreground">{t.dashboard.noActivityYet}</p>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
                    {t.dashboard.noActivityDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {recentEvents.map((event) => {
                    const isClick = event.type === "CLICK";
                    const linkTitle = isClick
                      ? allLinks.find((link) => link.id === event.linkId)?.title
                      : null;
                    const Icon = isClick ? MousePointerClick : Eye;
                    const meta = [event.country, event.device, event.referrer]
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(" · ");
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-foreground/[0.03] dark:hover:bg-white/[0.03]"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isClick
                              ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-foreground">
                            {isClick
                              ? `${t.dashboard.clickOn} ${linkTitle ? `“${linkTitle}”` : "link"}`
                              : t.dashboard.newProfileView}
                          </p>
                          {meta && (
                            <p className="truncate text-[10px] text-text-secondary">{meta}</p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-text-secondary">
                          {timeAgo(event.createdAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <Card className="flex flex-col p-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.dashboard.launchChecklist}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {completedSteps} / {checklist.length} {t.dashboard.complete}
                </p>
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>

            <ul className="mt-4 flex-1 space-y-2">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-text-secondary/50" />
                  )}
                  <span
                    className={`text-[12px] ${
                      item.done
                        ? "text-text-secondary line-through decoration-border"
                        : "font-medium text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {completedSteps === checklist.length ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-200">
                  {t.dashboard.profileOptimised}
                </p>
              </div>
            ) : (
              <Link href="/dashboard/bio" className="mt-4">
                <Button variant="outline" size="sm" className="w-full gap-1.5 rounded-xl text-xs">
                  {t.dashboard.finishSetup}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

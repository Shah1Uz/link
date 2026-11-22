"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/i18n-provider";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  Percent,
  Users,
  BarChart3,
  Globe2,
  Smartphone,
  Compass,
  Loader2,
  Layers,
} from "lucide-react";

const COLORS = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"];

const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--text-secondary))" };

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  borderColor: "hsl(var(--border))",
  borderRadius: "12px",
  color: "hsl(var(--popover-foreground))",
  fontSize: "12px",
  boxShadow: "0 18px 40px -20px rgba(9,11,17,0.35)",
};

const ACCENT_TILES = {
  emerald:
    "border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400",
  cyan: "border-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400",
  violet:
    "border-violet-500/25 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.04] text-violet-600 dark:text-violet-400",
  amber:
    "border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-600 dark:text-amber-400",
} as const;

export default function AnalyticsDashboardPage() {
  const { t } = useI18n();
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      try {
        const res = await fetch(`/api/analytics?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, [range]);

  const summary = data?.summary || { totalViews: 0, uniqueVisitors: 0, totalClicks: 0, ctr: "0.0" };
  const timeSeries = data?.timeSeries || [];
  const referrerBreakdown = data?.referrerBreakdown || [];
  const deviceBreakdown = data?.deviceBreakdown || [];
  const countryBreakdown = data?.countryBreakdown || [];

  const kpis = [
    { label: t.analyticsPage.kpis.totalViews, value: summary.totalViews.toLocaleString(), hint: t.analyticsPage.kpis.totalImpressions, icon: Eye, accent: "emerald" as const },
    { label: t.analyticsPage.kpis.uniqueVisitors, value: summary.uniqueVisitors.toLocaleString(), hint: t.analyticsPage.kpis.distinctAudience, icon: Users, accent: "cyan" as const },
    { label: t.analyticsPage.kpis.linkClicks, value: summary.totalClicks.toLocaleString(), hint: t.analyticsPage.kpis.clicksToLinks, icon: MousePointerClick, accent: "violet" as const },
    { label: t.analyticsPage.kpis.avgCtr, value: `${summary.ctr}%`, hint: t.analyticsPage.kpis.conversionRate, icon: Percent, accent: "amber" as const },
  ];

  const rangeButtons = [
    { id: "today", label: t.analyticsPage.ranges.today },
    { id: "7d", label: t.analyticsPage.ranges.d7 },
    { id: "30d", label: t.analyticsPage.ranges.d30 },
    { id: "90d", label: t.analyticsPage.ranges.d90 },
    { id: "all", label: t.analyticsPage.ranges.all },
  ];

  return (
    <div>
      <DashboardHeader
        title={t.analyticsPage.title}
        description={t.analyticsPage.description}
        action={
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-surface/50 p-1 text-[11px] font-semibold">
            {rangeButtons.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 transition-all text-[10px] sm:text-[11px] ${
                  range === r.id
                    ? "bg-card text-foreground shadow-xs"
                    : "text-text-secondary hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
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
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${ACCENT_TILES[kpi.accent]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-[11px] text-text-secondary">{kpi.hint}</p>
              </Card>
            );
          })}
        </div>

        {/* Time series */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.analyticsPage.chart.title}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {t.analyticsPage.chart.subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-text-secondary">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t.analyticsPage.chart.views}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                {t.analyticsPage.chart.clicks}
              </span>
            </div>
          </div>

          <div className="h-72 w-full px-2 py-4 sm:px-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-text-secondary" />
              </div>
            ) : timeSeries.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-surface/60 text-text-secondary">
                  <BarChart3 className="h-5 w-5" />
                </span>
                <p className="font-heading text-sm font-bold text-foreground">
                  {t.analyticsPage.chart.noTraffic}
                </p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
                  {t.analyticsPage.chart.noTrafficDesc}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                  <defs>
                    <linearGradient id="anViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="anClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis dataKey="date" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={6} />
                  <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
                  <Tooltip cursor={{ stroke: "hsl(var(--border))" }} contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#anViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#anClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Referrers + devices */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Compass className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.analyticsPage.trafficSources.title}
                </h3>
                <p className="text-[11px] text-text-secondary">{t.analyticsPage.trafficSources.subtitle}</p>
              </div>
            </div>

            <div className="p-5">
              {referrerBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-8 text-center">
                  <Layers className="mb-2 h-6 w-6 text-text-secondary/60" />
                  <p className="text-xs font-semibold text-foreground">{t.analyticsPage.trafficSources.noData}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    {t.analyticsPage.trafficSources.noDataDesc}
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {referrerBreakdown.map((r: any) => (
                    <div key={r.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">{r.name}</span>
                        <span className="font-mono text-[11px] text-text-secondary">
                          {r.value} {t.analyticsPage.trafficSources.hits}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                          style={{
                            width: `${Math.min(100, (r.value / (summary.totalViews || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-2.5 border-b border-border/70 px-5 py-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Smartphone className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.analyticsPage.devices.title}
                </h3>
                <p className="text-[11px] text-text-secondary">{t.analyticsPage.devices.subtitle}</p>
              </div>
            </div>

            <div className="p-5">
              {deviceBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-8 text-center">
                  <Smartphone className="mb-2 h-6 w-6 text-text-secondary/60" />
                  <p className="text-xs font-semibold text-foreground">{t.analyticsPage.devices.noData}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">
                    {t.analyticsPage.devices.noDataDesc}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex h-44 w-full items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={76}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {deviceBreakdown.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-[11px]">
                    {deviceBreakdown.map((d: any, i: number) => (
                      <span key={d.name} className="flex items-center gap-1.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="font-medium text-text-secondary">
                          {d.name}: {d.value}
                        </span>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Geo */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Globe2 className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  {t.analyticsPage.geo.title}
                </h3>
                <p className="text-[11px] text-text-secondary">{t.analyticsPage.geo.subtitle}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {countryBreakdown.length} {t.analyticsPage.geo.regions}
            </Badge>
          </div>

          <div className="p-5">
            {countryBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-surface/40 px-6 py-8 text-center">
                <Globe2 className="mb-2 h-6 w-6 text-text-secondary/60" />
                <p className="text-xs font-semibold text-foreground">{t.analyticsPage.geo.noData}</p>
                <p className="mt-1 text-[11px] text-text-secondary">
                  {t.analyticsPage.geo.noDataDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {countryBreakdown.map((c: any) => (
                  <div
                    key={c.country}
                    className="rounded-xl border border-border/70 bg-surface/40 p-3.5 transition-colors hover:border-emerald-500/30"
                  >
                    <p className="truncate text-[11px] font-medium text-text-secondary">
                      {c.country}
                    </p>
                    <p className="mt-1 font-heading text-lg font-extrabold tabular-nums text-foreground">
                      {c.count.toLocaleString()}
                      <span className="ml-1 text-[11px] font-normal text-text-secondary">
                        {t.analyticsPage.geo.views}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

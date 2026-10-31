"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  Calendar,
} from "lucide-react";

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"];

export default function AnalyticsDashboardPage() {
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
  const topLinks = data?.topLinks || [];
  const deviceBreakdown = data?.deviceBreakdown || [];
  const referrerBreakdown = data?.referrerBreakdown || [];
  const countryBreakdown = data?.countryBreakdown || [];

  return (
    <div>
      <DashboardHeader
        title="Analytics & Audience Insights"
        description="Comprehensive real-time telemetry on profile views, link clicks, devices, and traffic origins."
        action={
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "all", label: "All Time" },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  range === r.id
                    ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm font-bold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-4 sm:p-8 space-y-8 max-w-5xl">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Total Views</span>
              <Eye className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {summary.totalViews.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Total impressions</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Unique Visitors</span>
              <Users className="h-4 w-4 text-sky-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {summary.uniqueVisitors.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Distinct audience</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Total Link Clicks</span>
              <MousePointerClick className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {summary.totalClicks.toLocaleString()}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">Clicks to your links</p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs font-semibold">Avg. Click-Through</span>
              <Percent className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
              {summary.ctr}%
            </div>
            <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Conversion rate</p>
          </Card>
        </div>

        {/* TIME SERIES AREA CHART */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>Views & Clicks Over Time</span>
              </h3>
              <p className="text-xs text-zinc-500">Activity trend for selected period</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                <span>Clicks</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-zinc-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="anViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="anClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#888" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
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
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#anClicks)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* TWO-COLUMN GRID: Traffic Referrers & Device Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traffic Referrers */}
          <Card className="p-6">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="h-4 w-4 text-emerald-500" />
              <span>Traffic Sources & Referrers</span>
            </h3>

            {referrerBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No referrer data in this range</p>
            ) : (
              <div className="space-y-3">
                {referrerBreakdown.map((r: any) => (
                  <div key={r.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{r.name}</span>
                      <span className="text-zinc-500 font-mono">{r.value} hits</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (r.value / (summary.totalViews || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Device Breakdown */}
          <Card className="p-6">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-sky-500" />
              <span>Devices & Platforms</span>
            </h3>

            {deviceBreakdown.length === 0 ? (
              <p className="text-xs text-zinc-500 py-8 text-center">No device data in this range</p>
            ) : (
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#27272a",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 text-xs pt-2">
              {deviceBreakdown.map((d: any, i: number) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                    {d.name}: {d.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Geo Distribution Table */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe2 className="h-4 w-4 text-emerald-500" />
            <span>Country & Geographic Distribution</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {countryBreakdown.map((c: any) => (
              <div
                key={c.country}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40"
              >
                <div className="text-xs text-zinc-500 truncate">{c.country}</div>
                <div className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
                  {c.count.toLocaleString()}
                  <span className="text-[11px] text-zinc-400 font-normal ml-1">views</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


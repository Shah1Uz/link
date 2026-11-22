"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart3, ArrowUpRight, ChartNoAxesColumn } from "lucide-react";

const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--text-secondary))" };

export function OverviewCharts() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/analytics?range=14d");
        const json = await res.json();
        // Only render real telemetry — never fabricate traffic numbers.
        setData(Array.isArray(json.timeSeries) ? json.timeSeries : []);
      } catch (err) {
        console.error("Failed to load overview chart:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hasData = data.length > 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-heading text-[15px] font-bold tracking-[-0.02em] text-foreground">
              Profile performance
            </h3>
            <p className="text-xs text-text-secondary">
              Views and unique link clicks over the last 14 days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
            Clicks
          </span>
        </div>
      </div>

      <div className="h-64 w-full px-2 py-4 sm:h-72 sm:px-4">
        {loading ? (
          <div className="flex h-full items-end gap-2 rounded-xl px-4 pb-6">
            {[42, 64, 38, 78, 55, 88, 46, 70, 60, 82, 52, 74].map((height, index) => (
              <div
                key={index}
                className="shimmer flex-1 rounded-md border border-border/60 bg-foreground/[0.04]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : !hasData ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-surface/60 text-text-secondary">
              <ChartNoAxesColumn className="h-5 w-5" />
            </span>
            <p className="font-heading text-sm font-bold text-foreground">
              No traffic recorded yet
            </p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
              This chart only shows real visitor data. Once people open your BioSpace
              page, views and clicks will appear here.
            </p>
            <Link
              href="/dashboard/analytics"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/60 px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-emerald-500/40"
            >
              <span>Open analytics</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                dy={6}
              />
              <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "12px",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "12px",
                  boxShadow: "0 18px 40px -20px rgba(9,11,17,0.35)",
                }}
                labelStyle={{ color: "hsl(var(--text-secondary))", fontSize: "11px" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#viewsGrad)"
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#clicksGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Sparkles,
  DollarSign,
  TrendingUp,
  Search,
  Star,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  isPro: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  useCount: number;
  _count: { purchases: number; reviews: number };
}

export default function AdminMarketplacePage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [metrics, setMetrics] = useState({ totalTemplates: 0, totalPurchases: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadMarketplace = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/marketplace");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      toast.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const handleToggleFeatured = async (t: TemplateItem) => {
    try {
      const updated = !t.isFeatured;
      setTemplates(templates.map((item) => (item.id === t.id ? { ...item, isFeatured: updated } : item)));

      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: t.id, isFeatured: updated }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      toast.success(updated ? "Template marked as Featured" : "Template unfeatured");
    } catch {
      toast.error("Failed to update featured state");
      loadMarketplace();
    }
  };

  const handleTogglePublished = async (t: TemplateItem) => {
    try {
      const updated = !t.isPublished;
      setTemplates(templates.map((item) => (item.id === t.id ? { ...item, isPublished: updated } : item)));

      const res = await fetch("/api/admin/marketplace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: t.id, isPublished: updated }),
      });

      if (!res.ok) throw new Error("Failed to update publication");
      toast.success(updated ? "Template published to marketplace" : "Template unpublished");
    } catch {
      toast.error("Failed to update publication state");
      loadMarketplace();
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const kpis = [
    {
      label: "Catalog size",
      value: metrics.totalTemplates.toLocaleString(),
      icon: ShoppingBag,
      tile: "border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total sales volume",
      value: metrics.totalPurchases.toLocaleString(),
      icon: TrendingUp,
      tile: "border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.03] text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Marketplace gross",
      value: `$${metrics.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      tile: "border-violet-500/20 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.03] text-violet-600 dark:text-violet-300",
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Template Marketplace Management"
        description="Review community submissions, curate featured templates, and monitor creator marketplace commerce."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* KPI cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label} className="card-lift relative overflow-hidden p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      {kpi.label}
                    </p>
                    <p className="mt-2 font-heading text-3xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
                      {kpi.value}
                    </p>
                  </div>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${kpi.tile}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Inventory table */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Marketplace inventory &amp; curation
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  {filtered.length} of {templates.length} templates shown
                </p>
              </div>
            </div>

            <div className="w-full lg:max-w-xs">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category..."
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading marketplace inventory…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No templates found
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                Try a different search query to find marketplace inventory.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Template",
                      "Category",
                      "Price",
                      "Adoptions",
                      "Status",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary ${
                          index === 5 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="max-w-[22rem] px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span className="truncate">{t.name}</span>
                          {t.isFeatured && (
                            <Star
                              aria-label="Featured template"
                              className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                            />
                          )}
                        </div>
                        <div className="mt-0.5 line-clamp-1 text-[10.5px] text-text-secondary">
                          {t.description}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className="text-[10px] font-semibold">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11px] font-bold text-foreground">
                        {t.price > 0 ? `$${t.price.toFixed(2)}` : "Free"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] tabular-nums text-text-secondary">
                        {t.useCount} users
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={t.isPublished ? "success" : "secondary"}>
                          {t.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFeatured(t)}
                            className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                              t.isFeatured
                                ? "border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                                : ""
                            }`}
                          >
                            {t.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                          <Button
                            variant={t.isPublished ? "ghost" : "default"}
                            size="sm"
                            onClick={() => handleTogglePublished(t)}
                            className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                              t.isPublished
                                ? "text-text-secondary hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                                : ""
                            }`}
                          >
                            {t.isPublished ? "Unpublish" : "Publish"}
                          </Button>
                        </div>
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

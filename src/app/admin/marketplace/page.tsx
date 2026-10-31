"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Sparkles,
  DollarSign,
  TrendingUp,
  Search,
  Star,
  Check,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Template Marketplace Management
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Review community submissions, curate featured templates, and monitor creator marketplace commerce.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Catalog Size
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalTemplates}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Sales Volume
              </p>
              <h3 className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalPurchases}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Marketplace Gross
              </p>
              <h3 className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ${metrics.totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Table */}
      <Card className="rounded-2xl border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span>Marketplace Inventory & Curation</span>
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category..."
              className="pl-9 rounded-xl text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              Loading marketplace inventory...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-secondary">
              No templates found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-border text-text-secondary font-semibold uppercase">
                  <tr>
                    <th className="px-5 py-3">Template</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Adoptions</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{t.name}</span>
                          {t.isFeatured && (
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="text-text-secondary line-clamp-1 max-w-xs">{t.description}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="outline" className="rounded-lg text-[10px] font-semibold">
                          {t.category}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold">
                        {t.price > 0 ? `$${t.price.toFixed(2)}` : "Free"}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-text-secondary">
                        {t.useCount} users
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={t.isPublished ? "success" : "secondary"}
                          className="rounded-lg text-[10px]"
                        >
                          {t.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleFeatured(t)}
                          className="h-7 px-2.5 rounded-lg text-[11px]"
                        >
                          {t.isFeatured ? "Unfeature" : "Feature"}
                        </Button>
                        <Button
                          variant={t.isPublished ? "ghost" : "default"}
                          size="sm"
                          onClick={() => handleTogglePublished(t)}
                          className="h-7 px-2.5 rounded-lg text-[11px]"
                        >
                          {t.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


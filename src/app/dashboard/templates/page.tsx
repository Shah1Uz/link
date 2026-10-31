"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import { Sparkles, Check, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  layout: string;
  isPro: boolean;
  isFeatured: boolean;
  stylesJson: string;
}

const categories = [
  "All",
  "Minimal",
  "Creator",
  "Influencer",
  "Business",
  "Music",
  "Gaming",
  "Photography",
  "Portfolio",
  "Fashion",
  "Personal Brand",
];

export default function DashboardTemplatesPage() {
  const { updateTheme, updateProfile, subscriptionTier } = useDashboard();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [applyingSlug, setApplyingSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates);
        }
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  const handleApplyTemplate = async (template: TemplateItem) => {
    if (template.isPro && subscriptionTier !== "PRO") {
      toast.error("This is a PRO template. Please upgrade your subscription to use it.");
      return;
    }

    setApplyingSlug(template.slug);
    try {
      const res = await fetch("/api/templates/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateSlug: template.slug }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to apply template");

      // Update live preview context
      const parsedStyles = JSON.parse(template.stylesJson);
      updateTheme(parsedStyles);
      updateProfile({ layout: template.layout });

      toast.success(`Template "${template.name}" applied successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply template");
    } finally {
      setApplyingSlug(null);
    }
  };

  const filtered = selectedCat === "All"
    ? templates
    : templates.filter((t) => t.category.toLowerCase() === selectedCat.toLowerCase());

  return (
    <div>
      <DashboardHeader
        title="Template Gallery"
        description="Switch between 20+ professionally curated creator themes in one click without losing your links."
      />

      <div className="p-4 sm:p-8 space-y-6 max-w-6xl">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 transition-all ${
                selectedCat === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-zinc-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tpl) => {
              let styles: any = {};
              try {
                styles = JSON.parse(tpl.stylesJson);
              } catch {}

              const bgStyle = styles.backgroundGradient
                ? { background: styles.backgroundGradient }
                : { backgroundColor: styles.backgroundColor || "#0f172a" };

              const isApplying = applyingSlug === tpl.slug;

              return (
                <Card
                  key={tpl.id}
                  className="group flex flex-col justify-between overflow-hidden p-4 hover:shadow-lg transition-all duration-200"
                >
                  {/* Miniature Visual Preview */}
                  <div
                    className="relative h-48 w-full rounded-xl overflow-hidden p-3.5 flex flex-col items-center justify-between text-center select-none shadow-inner"
                    style={{ ...bgStyle, color: styles.textColor || "#fff" }}
                  >
                    <div className="w-full flex justify-between items-center text-[10px] opacity-75">
                      <span className="font-semibold">{tpl.layout.toUpperCase()}</span>
                      {tpl.isPro && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-bold text-[9px]">
                          PRO
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full border-2 border-white/30 bg-white/20 mb-1 flex items-center justify-center text-[10px] font-bold">
                        BIO
                      </div>
                      <div className="text-[11px] font-bold">{tpl.name}</div>
                    </div>

                    <div className="w-full space-y-1 px-3">
                      <div
                        className="w-full py-1 text-[9px] font-semibold truncate rounded shadow-sm"
                        style={{
                          backgroundColor: styles.buttonColor || "#fff",
                          color: styles.buttonTextColor || "#000",
                          borderRadius: styles.buttonRadius || "6px",
                        }}
                      >
                        Sample Link Button
                      </div>
                    </div>
                  </div>

                  {/* Info & Apply Button */}
                  <div className="pt-4 flex flex-col justify-between flex-1">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                          {tpl.name}
                        </h4>
                        <Badge variant="outline" className="text-[10px]">
                          {tpl.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-500 line-clamp-2">
                        {tpl.description}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleApplyTemplate(tpl)}
                      isLoading={isApplying}
                      className="w-full rounded-xl text-xs font-semibold"
                    >
                      <span>Apply Template</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { Sparkles, Loader2, Palette } from "lucide-react";
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
  const { t } = useI18n();
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
        title={t.templatesStudio.title}
        description={t.templatesStudio.description}
      />

      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all duration-200 ease-out-soft active:scale-95 ${
                selectedCat === cat
                  ? "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:text-emerald-200"
                  : "border-border/80 bg-surface/40 text-text-secondary hover:border-border hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-border/70 bg-card p-4"
              >
                <div className="shimmer h-44 w-full rounded-xl border border-border/60 bg-foreground/[0.04]" />
                <div className="mt-4 space-y-2">
                  <div className="h-3.5 w-2/3 rounded-full bg-foreground/[0.06]" />
                  <div className="h-2.5 w-full rounded-full bg-foreground/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-surface/30 px-6 py-16 text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/60 text-text-secondary">
              <Palette className="h-5 w-5" />
            </span>
            <p className="font-heading text-sm font-bold text-foreground">No templates in this category</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-text-secondary">
              Try another category — new themes are added regularly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="card-lift group flex flex-col justify-between overflow-hidden p-3.5"
                >
                  {/* Miniature preview */}
                  <div
                    className="relative flex h-44 w-full select-none flex-col items-center justify-between overflow-hidden rounded-xl p-3.5 text-center shadow-inner"
                    style={{ ...bgStyle, color: styles.textColor || "#fff" }}
                  >
                    <div className="flex w-full items-center justify-between text-[10px] opacity-75">
                      <span className="font-semibold uppercase tracking-wider">{tpl.layout}</span>
                      {tpl.isPro && (
                        <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-950">
                          PRO
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-[10px] font-bold backdrop-blur-sm">
                        BIO
                      </div>
                      <div className="text-[11px] font-bold">{tpl.name}</div>
                    </div>

                    <div className="w-full space-y-1 px-3">
                      <div
                        className="w-full truncate rounded py-1 text-[9px] font-semibold shadow-sm"
                        style={{
                          backgroundColor: styles.buttonColor || "#fff",
                          color: styles.buttonTextColor || "#000",
                          borderRadius: styles.buttonRadius || "6px",
                        }}
                      >
                        Sample link button
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between pt-3.5">
                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h4 className="truncate font-heading text-[13px] font-bold text-foreground">
                          {tpl.name}
                        </h4>
                        <Badge variant="outline" className="shrink-0 text-[9px]">
                          {tpl.category}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-text-secondary">
                        {tpl.description}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleApplyTemplate(tpl)}
                      isLoading={isApplying}
                      className="w-full rounded-xl text-xs font-semibold"
                    >
                      <span>Apply template</span>
                      <Sparkles className="ml-0 h-3.5 w-3.5" />
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

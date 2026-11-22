"use client";

import React, { useState } from "react";
import {
  Link2,
  Sparkles,
  BarChart2,
  ExternalLink,
  Check,
  CheckCircle2,
  ArrowRight,
  Loader2,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";

interface LinkOptimizerTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

export function LinkOptimizerTab({ onSuccessGeneration }: LinkOptimizerTabProps) {
  const { links, refreshDashboardData } = useDashboard();

  const [selectedLinkId, setSelectedLinkId] = useState<string>(links[0]?.id || "");
  const [targetAudience, setTargetAudience] = useState("Builders, clients, and community members");
  const [tone, setTone] = useState("energetic");
  const [language, setLanguage] = useState("en");

  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeOptimizedLinkId, setActiveOptimizedLinkId] = useState<string | null>(null);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const activeLink = links.find((l) => l.id === selectedLinkId) || links[0];

  const handleOptimizeLink = async (linkToOptimize: any) => {
    if (!linkToOptimize) return;
    setIsLoading(true);
    setSuggestions([]);
    setAppliedIndex(null);
    setActiveOptimizedLinkId(linkToOptimize.id);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "LINK_TITLE",
          data: {
            url: linkToOptimize.url,
            currentTitle: linkToOptimize.title,
            targetAudience,
            tone,
            language,
            count: 3,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Optimization failed");

      setSuggestions(json.data || []);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("AI generated high-CTR button titles! ⚡");
    } catch (err: any) {
      toast.error(err.message || "Failed to optimize link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTitle = async (newTitle: string, idx: number) => {
    if (!activeOptimizedLinkId) return;
    setApplyingIndex(idx);

    try {
      const res = await fetch("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "link",
          payload: {
            linkId: activeOptimizedLinkId,
            title: newTitle,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to update link");

      setAppliedIndex(idx);
      refreshDashboardData?.();
      toast.success("Link title updated in your active profile!");
    } catch (err: any) {
      toast.error(err.message || "Could not update link title");
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Analytics Grounding Banner */}
      <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-50/50 dark:bg-zinc-900/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <span>Real-World Performance Analyzer</span>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/20">
                  {links.length} Active Links Tracked
                </Badge>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl">
                Grounds title and CTA recommendations strictly on your real analytics data ({links.reduce((acc, l) => acc + (l.clicksCount || 0), 0)} total clicks). Never fabricates artificial metrics.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Links List */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Your Profile Links ({links.length})
          </h4>

          {links.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-500">
              No links created yet. Add links in the Links tab to optimize them here.
            </div>
          ) : (
            links.map((link) => {
              const isSelected = selectedLinkId === link.id;

              return (
                <Card
                  key={link.id}
                  onClick={() => {
                    setSelectedLinkId(link.id);
                    setActiveOptimizedLinkId(link.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/30 dark:bg-purple-950/20 shadow-xs ring-1 ring-purple-600/20"
                      : "border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {link.title}
                        </h5>
                        {link.isPinned && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 font-semibold">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {link.url}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-xl">
                      <BarChart2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{link.clicksCount || 0}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400 font-medium">
                      Position #{link.position + 1}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLinkId(link.id);
                        handleOptimizeLink(link);
                      }}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Optimize Title</span>
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right Optimization Studio */}
        <div className="lg:col-span-7 space-y-4">
          {activeLink ? (
            <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Selected Link
                  </span>
                  <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 truncate">
                    {activeLink.title}
                  </h4>
                </div>

                <Button
                  type="button"
                  onClick={() => handleOptimizeLink(activeLink)}
                  disabled={isLoading}
                  className="rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs gap-1.5 shadow-2xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>{isLoading ? "Analyzing..." : "Generate High-CTR Titles"}</span>
                </Button>
              </div>

              {/* Suggestions */}
              {isLoading && (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-2 animate-pulse">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                  <p className="text-xs text-zinc-500 font-medium">
                    Optimizing title structure, action verbs, and click triggers...
                  </p>
                </div>
              )}

              {!isLoading && suggestions.length === 0 && (
                <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 text-center space-y-2">
                  <Lightbulb className="h-6 w-6 text-amber-500 mx-auto" />
                  <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    Boost Click-Through Rate
                  </h5>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Click &ldquo;Generate High-CTR Titles&rdquo; to analyze this destination URL and replace vague link labels with high-converting action copy.
                  </p>
                </div>
              )}

              {!isLoading && suggestions.length > 0 && (
                <div className="space-y-3 animate-in fade-in">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Recommended High-Converting Titles
                  </h5>

                  {suggestions.map((title, idx) => {
                    const isApplying = applyingIndex === idx;
                    const isApplied = appliedIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isApplied
                            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                        }`}
                      >
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                          {title}
                        </p>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleApplyTitle(title, idx)}
                          disabled={isApplying}
                          className={`rounded-xl text-xs font-semibold h-8 shrink-0 gap-1.5 ${
                            isApplied
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950"
                          }`}
                        >
                          {isApplying ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isApplied ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5" />
                          )}
                          <span>{isApplied ? "Applied" : "Apply to Link"}</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Best Practice Advice */}
              <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/20 text-xs text-zinc-500 space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">
                  💡 Optimization Rules:
                </span>
                <p>
                  1. Put your most valuable link at Position #1 or pin it to the top.
                </p>
                <p>
                  2. Use specific benefits in the title (e.g. &ldquo;Download Free Kit&rdquo; rather than &ldquo;Free Kit&rdquo;).
                </p>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}


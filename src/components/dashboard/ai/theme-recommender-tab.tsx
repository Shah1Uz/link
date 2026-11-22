"use client";

import React, { useState } from "react";
import {
  Palette,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Layout,
  Type,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";
import { ThemeRecommendation } from "@/lib/ai/provider";

interface ThemeRecommenderTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

const VIBES = [
  { id: "modern", label: "💎 Modern & High-Tech" },
  { id: "cyber", label: "⚡ Dark Obsidian / Cyber" },
  { id: "minimal", label: "🌿 Clean & Minimalist" },
  { id: "sunset", label: "🌅 Warm Sunset & Velvet" },
  { id: "bold", label: "🎨 Bold Expressive Glow" },
];

export function ThemeRecommenderTab({ onSuccessGeneration }: ThemeRecommenderTabProps) {
  const { profile, updateProfile, updateTheme } = useDashboard();

  const [vibe, setVibe] = useState("cyber");
  const [preferredLayout, setPreferredLayout] = useState<string>(profile?.layout || "hero");

  const [isLoading, setIsLoading] = useState(false);
  const [themes, setThemes] = useState<ThemeRecommendation[]>([]);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);

  const handleGenerateThemes = async () => {
    setIsLoading(true);
    setThemes([]);
    setAppliedIndex(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "THEME_RECOMMEND",
          data: {
            category: profile?.category || "CREATOR",
            bio: profile?.bio || "",
            profession: profile?.displayName || "",
            vibe,
            preferredLayout,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Theme generation failed");

      setThemes(json.data || []);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Generated tailored design themes! 🎨");
    } catch (err: any) {
      toast.error(err.message || "Failed to recommend themes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTheme = async (theme: ThemeRecommendation, idx: number) => {
    setApplyingIndex(idx);
    try {
      const res = await fetch("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "theme",
          payload: { theme },
        }),
      });

      if (!res.ok) throw new Error("Failed to apply theme");

      // Update local dashboard context for real-time live mockup sync
      updateProfile({ layout: theme.layout });
      updateTheme({
        backgroundColor: theme.backgroundColor,
        backgroundType: theme.backgroundType,
        backgroundGradient: theme.backgroundGradient || null,
        accentColor: theme.accentColor,
        textColor: theme.textColor,
        buttonStyle: theme.buttonStyle,
        buttonColor: theme.buttonColor,
        buttonTextColor: theme.buttonTextColor,
        buttonBorderColor: theme.buttonBorderColor || null,
        buttonRadius: theme.buttonRadius,
        fontHeading: theme.fontHeading,
        fontBody: theme.fontBody,
      });

      setAppliedIndex(idx);
      toast.success(`Applied "${theme.name}" to your profile & live mockup! 🚀`);
    } catch (err: any) {
      toast.error(err.message || "Could not apply theme");
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Control Bar */}
      <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <span>AI Aesthetic & Palette Synthesizer</span>
            </h4>
            <p className="text-xs text-zinc-500">
              Analyzes your category ({profile?.category || "Creator"}) and generates cohesive typography, backgrounds, button geometries, and accent palettes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
            >
              {VIBES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={handleGenerateThemes}
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs px-5 shadow-xs gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span>{isLoading ? "Designing..." : "Synthesize Themes"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && themes.length === 0 && (
        <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-3">
          <Palette className="h-10 w-10 text-purple-400" />
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Generate Cohesive Color Palettes & Layouts
          </h4>
          <p className="text-xs text-zinc-500 max-w-md">
            Click &ldquo;Synthesize Themes&rdquo; above to generate 4 visual palettes customized to your content and apply them directly to your live profile.
          </p>
        </div>
      )}

      {/* Generated Theme Cards Grid */}
      {!isLoading && themes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
          {themes.map((item, idx) => {
            const isApplying = applyingIndex === idx;
            const isApplied = appliedIndex === idx;

            return (
              <Card
                key={idx}
                className={`overflow-hidden rounded-3xl border transition-all ${
                  isApplied
                    ? "border-emerald-500 shadow-sm ring-1 ring-emerald-500/20"
                    : "border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
                }`}
              >
                {/* Visual Canvas Miniature Preview */}
                <div
                  className="h-36 p-4 flex flex-col justify-between relative"
                  style={{
                    background:
                      item.backgroundType === "gradient" && item.backgroundGradient
                        ? item.backgroundGradient
                        : item.backgroundColor,
                    color: item.textColor,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-tight px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white">
                      {item.name}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 px-2 py-0.5 rounded-md bg-white/10">
                      {item.layout} layout
                    </span>
                  </div>

                  {/* Simulated Button Component */}
                  <div className="flex justify-center">
                    <div
                      className="px-5 py-2 text-xs font-bold shadow-md truncate max-w-[200px]"
                      style={{
                        backgroundColor: item.buttonColor,
                        color: item.buttonTextColor,
                        borderRadius: item.buttonRadius,
                        border: item.buttonBorderColor ? `1px solid ${item.buttonBorderColor}` : "none",
                      }}
                    >
                      Featured Link Button
                    </div>
                  </div>
                </div>

                {/* Details & Specs */}
                <div className="p-5 space-y-3 bg-white dark:bg-zinc-950">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                    {item.reasoning}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-semibold text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1">
                      <Type className="h-3 w-3" />
                      <span>{item.fontHeading}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Layout className="h-3 w-3" />
                      <span className="capitalize">{item.buttonStyle} Buttons</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="h-3 w-3 rounded-full border border-black/10 inline-block"
                        style={{ backgroundColor: item.accentColor }}
                      />
                      <span>{item.accentColor}</span>
                    </span>
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApplyTheme(item, idx)}
                      disabled={isApplying}
                      className={`rounded-xl text-xs font-semibold gap-1.5 ${
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
                      <span>{isApplied ? "Active on Profile" : "Apply Theme to Profile"}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


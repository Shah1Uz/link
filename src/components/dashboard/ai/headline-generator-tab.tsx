"use client";

import React, { useState } from "react";
import {
  Zap,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";

interface HeadlineGeneratorTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

const TONES = [
  { id: "bold", label: "🔥 Bold & Visionary" },
  { id: "minimalist", label: "🌿 Clean & Minimal" },
  { id: "tech_leader", label: "⚡ Tech Architect" },
  { id: "energetic", label: "🚀 High Growth" },
  { id: "professional", label: "💼 Executive" },
];

export function HeadlineGeneratorTab({ onSuccessGeneration }: HeadlineGeneratorTabProps) {
  const { profile, updateProfile } = useDashboard();

  const [name, setName] = useState(profile?.displayName || "Alex Rivera");
  const [profession, setProfession] = useState("Full-Stack Architect & YouTuber");
  const [category, setCategory] = useState(profile?.category || "CREATOR");
  const [tone, setTone] = useState("bold");
  const [language, setLanguage] = useState("en");
  const [count, setCount] = useState(4);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!name.trim() || !profession.trim()) {
      toast.error("Please provide your name and profession.");
      return;
    }

    setIsLoading(true);
    setResults([]);
    setAppliedIndex(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "HEADLINE",
          data: {
            name,
            profession,
            category,
            tone,
            language,
            count,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");

      setResults(json.data || []);
      setGenerationId(json.id || null);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Generated memorable headlines! 🔥");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate headlines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleApply = async (text: string, index: number) => {
    setApplyingIndex(index);
    try {
      const res = await fetch("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "headline",
          generationId,
          payload: { displayName: text },
        }),
      });

      if (!res.ok) throw new Error("Failed to apply headline");

      updateProfile({ displayName: text });
      setAppliedIndex(index);
      toast.success("Display headline updated on your profile! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Could not apply headline");
    } finally {
      setApplyingIndex(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Left */}
      <div className="lg:col-span-5 space-y-5">
        <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Zap className="h-4 w-4 text-amber-500" />
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              Headline Parameters
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Field / Profession
            </label>
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. AI Product Designer & Speaker"
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Desired Tone
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    tone === t.id
                      ? "border-amber-500 bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-500 shadow-2xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="uz">O&apos;zbekcha</option>
                <option value="ru">Русский</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Count
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value={3}>3 options</option>
                <option value={4}>4 options</option>
                <option value={5}>5 options</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs py-5 shadow-sm active:scale-98 transition-all gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-current text-amber-300" />
            )}
            <span>{isLoading ? "Forging Taglines..." : "Generate Taglines"}</span>
          </Button>
        </Card>
      </div>

      {/* Results Right */}
      <div className="lg:col-span-7 space-y-3">
        {isLoading && (
          <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Generating high-impact taglines...
            </h4>
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="p-10 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-2">
            <Zap className="h-8 w-8 text-amber-400" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              High-Converting Profile Headlines
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Catch attention in under 3 seconds with strategic, punchy subheadings customized to your exact field.
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Headline Suggestions ({results.length})
              </h4>
              <button
                onClick={handleGenerate}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </div>

            {results.map((headline, idx) => {
              const isCopied = copiedIndex === idx;
              const isApplying = applyingIndex === idx;
              const isApplied = appliedIndex === idx;

              return (
                <Card
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isApplied
                      ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20"
                      : "border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 hover:border-zinc-300"
                  }`}
                >
                  <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                    &ldquo;{headline}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleCopy(headline, idx)}
                      className="p-1.5 px-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleApply(headline, idx)}
                      disabled={isApplying}
                      className={`rounded-xl text-xs font-semibold h-8 gap-1.5 transition-all ${
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
                      <span>{isApplied ? "Applied" : "Use Headline"}</span>
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


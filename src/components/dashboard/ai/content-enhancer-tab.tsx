"use client";

import React, { useState } from "react";
import {
  Wand2,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";

interface ContentEnhancerTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

const GOALS = [
  { id: "conversion", label: "🎯 Maximize Conversion & Clicks" },
  { id: "punchy", label: "⚡ Punchy & High-Energy" },
  { id: "clarity", label: "📖 Maximum Clarity & Simplicity" },
  { id: "shorter", label: "✂️ Concise & Skimmable" },
];

export function ContentEnhancerTab({ onSuccessGeneration }: ContentEnhancerTabProps) {
  const { profile, updateProfile } = useDashboard();

  const [text, setText] = useState(
    profile?.bio || "I am a full stack engineer building tools and sharing tutorials on YouTube."
  );
  const [goal, setGoal] = useState<string>("conversion");
  const [tone, setTone] = useState("bold");
  const [language, setLanguage] = useState("en");

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ original: string; improved: string; changes: string[] } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const handleEnhance = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to improve.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setIsApplied(false);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CONTENT_IMPROVE",
          data: {
            text,
            goal,
            tone,
            language,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to enhance content");

      setResult(json.data);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Content enhanced with strategic improvements! ✨");
    } catch (err: any) {
      toast.error(err.message || "Failed to enhance content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.improved) return;
    navigator.clipboard.writeText(result.improved);
    setIsCopied(true);
    toast.success("Copied improved text!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleApplyToBio = async () => {
    if (!result?.improved) return;

    try {
      const res = await fetch("/api/ai/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "bio",
          payload: { bio: result.improved },
        }),
      });

      if (!res.ok) throw new Error("Failed to apply bio");

      updateProfile({ bio: result.improved });
      setIsApplied(true);
      toast.success("Applied to your profile bio! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Could not apply to bio");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Input Left */}
      <div className="lg:col-span-6 space-y-4">
        <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Wand2 className="h-4 w-4 text-purple-600" />
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              Original Text & Desired Goal
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Enter Text to Enhance
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Paste your current bio, announcement, or tagline here..."
              className="rounded-2xl text-xs font-medium"
            />
            <p className="text-[11px] text-zinc-400 text-right mt-1">
              {text.length} / 1000 characters
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Primary Goal
            </label>
            <div className="space-y-1.5">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    goal === g.id
                      ? "border-purple-600 bg-purple-50 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 shadow-2xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleEnhance}
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs py-5 shadow-sm active:scale-98 transition-all gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isLoading ? "Enhancing Copy..." : "Enhance with AI"}</span>
          </Button>
        </Card>
      </div>

      {/* Results Right */}
      <div className="lg:col-span-6 space-y-4">
        {isLoading && (
          <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-2 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Transforming your copy...
            </h4>
          </div>
        )}

        {!isLoading && !result && (
          <div className="p-10 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-2">
            <Wand2 className="h-8 w-8 text-purple-400" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Strategic Content Polishing
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Our AI rewrites your text with proven creator copywriting structures to boost readability and clarity.
            </p>
          </div>
        )}

        {!isLoading && result && (
          <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Optimized Result</span>
              </span>

              <span className="text-xs font-semibold text-zinc-400">
                {result.improved.length} chars
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                {result.improved}
              </p>
            </div>

            {/* Changes Made */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Improvements Applied:
              </span>
              <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
                {result.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                className="rounded-xl text-xs font-semibold gap-1.5"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{isCopied ? "Copied" : "Copy"}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleApplyToBio}
                className={`rounded-xl text-xs font-semibold gap-1.5 ${
                  isApplied
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950"
                }`}
              >
                {isApplied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                <span>{isApplied ? "Applied to Profile Bio" : "Apply as Bio"}</span>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


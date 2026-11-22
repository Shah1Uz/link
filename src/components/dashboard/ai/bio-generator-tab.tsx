"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";

interface BioGeneratorTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

const TONES = [
  { id: "professional", label: "💼 Professional" },
  { id: "playful", label: "✨ Playful & Casual" },
  { id: "bold", label: "🔥 Bold & Punchy" },
  { id: "minimalist", label: "🌿 Minimalist" },
  { id: "tech_leader", label: "⚡ Tech Architect" },
  { id: "energetic", label: "🚀 High Energy" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "uz", label: "O'zbekcha" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
];

export function BioGeneratorTab({ onSuccessGeneration }: BioGeneratorTabProps) {
  const { profile, updateProfile } = useDashboard();

  const [name, setName] = useState(profile?.displayName || "Alex Rivera");
  const [profession, setProfession] = useState("Full-Stack Engineer & Creator");
  const [category, setCategory] = useState(profile?.category || "CREATOR");
  const [interests, setInterests] = useState("Next.js, SaaS architecture, YouTube tutorials");
  const [targetAudience, setTargetAudience] = useState("Founders, developers, and tech builders");
  const [tone, setTone] = useState("bold");
  const [language, setLanguage] = useState("en");
  const [count, setCount] = useState(3);

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedText, setEditedText] = useState("");
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
          type: "BIO",
          data: {
            name,
            profession,
            category,
            interests,
            targetAudience,
            tone,
            language,
            count,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Generation failed");
      }

      setResults(json.data || []);
      setGenerationId(json.id || null);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Generated tailored bio variations! ✨");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate bios");
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
          target: "bio",
          generationId,
          payload: { bio: text },
        }),
      });

      if (!res.ok) throw new Error("Failed to apply bio");

      updateProfile({ bio: text });
      setAppliedIndex(index);
      toast.success("Bio successfully applied to your public profile! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Could not apply bio to profile");
    } finally {
      setApplyingIndex(null);
    }
  };

  const startEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditedText(text);
  };

  const saveEdit = (index: number) => {
    const updated = [...results];
    updated[index] = editedText;
    setResults(updated);
    setEditingIndex(null);
    toast.success("Variation updated!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Form Column */}
      <div className="lg:col-span-5 space-y-5">
        <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              AI Bio Parameters
            </h4>
          </div>

          {/* Name & Profession */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Your Name
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
                Profession / Title
              </label>
              <Input
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="Full-Stack Engineer"
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Interests & Keywords */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Key Topics / Interests / Skills
            </label>
            <Input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Next.js, AI tools, SaaS products, design"
              className="rounded-xl text-xs"
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Target Audience
            </label>
            <Input
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Founders, designers, creators"
              className="rounded-xl text-xs"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Writing Style & Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    tone === t.id
                      ? "border-purple-600 bg-purple-50 text-purple-900 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-500 shadow-2xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language & Variations Count */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-600"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Variations
              </label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10))}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-purple-600"
              >
                <option value={2}>2 variations</option>
                <option value={3}>3 variations</option>
                <option value={4}>4 variations</option>
                <option value={5}>5 variations</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs py-5 shadow-sm active:scale-98 transition-all gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isLoading ? "Synthesizing High-Impact Bios..." : "Generate Bio Variations"}</span>
          </Button>
        </Card>
      </div>

      {/* Right Results Column */}
      <div className="lg:col-span-7 space-y-4">
        {isLoading && (
          <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
            <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                AI Architect is crafting your bios...
              </h4>
              <p className="text-xs text-zinc-500 mt-1">
                Analyzing tone, audience hook, and conversion structure.
              </p>
            </div>
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="p-10 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Ready to generate your personal bio
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Adjust parameters on the left and click Generate to produce multiple high-converting variations with one-click profile application.
            </p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Generated Variations ({results.length})
              </h4>
              <button
                onClick={handleGenerate}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </div>

            {results.map((text, idx) => {
              const isEditing = editingIndex === idx;
              const isCopied = copiedIndex === idx;
              const isApplying = applyingIndex === idx;
              const isApplied = appliedIndex === idx;

              return (
                <Card
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all ${
                    isApplied
                      ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs"
                      : "border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={3}
                        maxLength={250}
                        className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 text-xs font-medium focus:outline-none focus:border-purple-600 bg-zinc-50 dark:bg-zinc-900"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(null)}
                          className="rounded-xl text-xs h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(idx)}
                          className="rounded-xl text-xs h-8 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium">
                        {text}
                      </p>

                      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-zinc-400">
                          {text.length} / 250 characters
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(idx, text)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                            title="Edit variation"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(text, idx)}
                            className="p-1.5 px-2.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                          >
                            {isCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span>{isCopied ? "Copied" : "Copy"}</span>
                          </button>

                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApply(text, idx)}
                            disabled={isApplying}
                            className={`rounded-xl text-xs font-semibold h-8 gap-1.5 transition-all ${
                              isApplied
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                                : "bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs"
                            }`}
                          >
                            {isApplying ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isApplied ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5" />
                            )}
                            <span>{isApplied ? "Applied to Profile" : "Apply to Profile"}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


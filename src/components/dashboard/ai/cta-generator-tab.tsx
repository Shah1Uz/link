"use client";

import React, { useState } from "react";
import {
  MousePointerClick,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface CTAGeneratorTabProps {
  onSuccessGeneration?: (quota: any) => void;
}

const OFFER_TYPES = [
  { id: "newsletter", label: "📬 Newsletter / Email List" },
  { id: "product", label: "🛍️ Digital Product / Store" },
  { id: "booking", label: "📅 Call / 1-on-1 Consultation" },
  { id: "portfolio", label: "💼 Work / Case Studies" },
  { id: "social", label: "🔔 Channel / Community Join" },
  { id: "course", label: "🎓 Masterclass / Course" },
];

export function CTAGeneratorTab({ onSuccessGeneration }: CTAGeneratorTabProps) {
  const [offerType, setOfferType] = useState<string>("newsletter");
  const [customContext, setCustomContext] = useState("");
  const [tone, setTone] = useState("energetic");
  const [language, setLanguage] = useState("en");

  const [isLoading, setIsLoading] = useState(false);
  const [ctas, setCtas] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setCtas([]);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CTA",
          data: {
            offerType,
            customContext,
            tone,
            language,
            count: 4,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to generate CTAs");

      setCtas(json.data || []);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Action-oriented CTAs generated! 🚀");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate CTAs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied CTA to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Parameters */}
      <div className="lg:col-span-5 space-y-4">
        <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <MousePointerClick className="h-4 w-4 text-purple-600" />
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50">
              CTA & Button Copy Settings
            </h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Select Offer Type
            </label>
            <div className="space-y-1.5">
              {OFFER_TYPES.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOfferType(o.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    offerType === o.id
                      ? "border-purple-600 bg-purple-50 text-purple-950 dark:bg-purple-950/40 dark:text-purple-200 shadow-2xs"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {o.label}
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
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="energetic">Energetic</option>
                <option value="bold">Bold & Direct</option>
                <option value="professional">Professional</option>
                <option value="playful">Playful</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full mt-2 rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs py-5 shadow-sm active:scale-98 transition-all gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isLoading ? "Generating CTAs..." : "Generate High-CTR CTAs"}</span>
          </Button>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:col-span-7 space-y-3">
        {isLoading && (
          <div className="p-8 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-2 animate-pulse">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Synthesizing persuasive action copy...
            </h4>
          </div>
        )}

        {!isLoading && ctas.length === 0 && (
          <div className="p-10 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-2">
            <MousePointerClick className="h-8 w-8 text-purple-400" />
            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Clear Call-To-Action Copy
            </h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Replace standard &ldquo;Click here&rdquo; buttons with compelling action phrases that tell visitors exactly what they will gain.
            </p>
          </div>
        )}

        {!isLoading && ctas.length > 0 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Action Phrases ({ctas.length})
              </h4>
              <button
                onClick={handleGenerate}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Regenerate</span>
              </button>
            </div>

            {ctas.map((cta, idx) => {
              const isCopied = copiedIndex === idx;

              return (
                <Card
                  key={idx}
                  className="p-4 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300"
                >
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {cta}
                  </p>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(cta, idx)}
                    className="rounded-xl text-xs font-semibold shrink-0 gap-1.5 h-8"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? "Copied" : "Copy"}</span>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


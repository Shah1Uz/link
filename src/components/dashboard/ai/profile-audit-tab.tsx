"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-context";
import { ProfileAuditResult } from "@/lib/ai/provider";

interface ProfileAuditTabProps {
  onSuccessGeneration?: (quota: any) => void;
  onNavigateToTab?: (tab: string) => void;
}

export function ProfileAuditTab({ onSuccessGeneration, onNavigateToTab }: ProfileAuditTabProps) {
  const { profile, links, theme } = useDashboard();

  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<ProfileAuditResult | null>(null);

  const handleRunAudit = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PROFILE_OPTIMIZE",
          data: {
            username: profile?.username || "creator",
            displayName: profile?.displayName || "",
            bio: profile?.bio || "",
            category: profile?.category || "CREATOR",
            linksCount: links.length,
            hasAvatar: Boolean(profile?.avatarUrl),
            hasBanner: Boolean(profile?.bannerUrl),
            themeName: theme?.backgroundType || "default",
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Audit failed");

      setAuditResult(json.data);
      if (onSuccessGeneration && json.quota) {
        onSuccessGeneration(json.quota);
      }
      toast.success("Profile conversion audit complete! 📊");
    } catch (err: any) {
      toast.error(err.message || "Failed to audit profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Full Profile Conversion Audit</span>
            </h4>
            <p className="text-xs text-zinc-500 mt-1">
              Evaluates your bio length, avatar quality, link balance, and mobile readability to score your conversion potential.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleRunAudit}
            disabled={isLoading}
            className="rounded-2xl bg-gradient-to-b from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-600 text-white font-bold text-xs px-6 py-5 shadow-xs gap-2 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isLoading ? "Auditing Profile..." : "Run AI Audit"}</span>
          </Button>
        </div>
      </Card>

      {/* Empty State */}
      {!isLoading && !auditResult && (
        <div className="p-12 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-3">
          <Star className="h-10 w-10 text-yellow-400 fill-current" />
          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
            Audit Your Profile Conversion Score
          </h4>
          <p className="text-xs text-zinc-500 max-w-md">
            Click &ldquo;Run AI Audit&rdquo; to benchmark your profile against industry standards for creator link-in-bio conversions.
          </p>
        </div>
      )}

      {/* Audit Result Display */}
      {!isLoading && auditResult && (
        <div className="space-y-6 animate-in fade-in">
          {/* Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="relative flex items-center justify-center">
                <span className="text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
                  {auditResult.score}
                </span>
                <span className="text-xs font-bold text-zinc-400 ml-1">/100</span>
              </div>
              <Badge
                variant={auditResult.score >= 80 ? "pro" : "outline"}
                className="mt-3 text-xs font-bold"
              >
                {auditResult.rating}
              </Badge>
              <span className="text-[11px] text-zinc-400 mt-2 font-medium">
                Overall Optimization Score
              </span>
            </Card>

            {/* Strengths Card */}
            <Card className="p-6 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 md:col-span-2 shadow-xs space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Profile Strengths</span>
              </h5>
              <div className="space-y-2">
                {auditResult.strengths.map((str, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Action Recommendations */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
              Priority Fixes & Suggestions ({auditResult.recommendations.length})
            </h5>

            {auditResult.recommendations.map((rec, i) => (
              <Card
                key={i}
                className="p-5 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        rec.priority === "HIGH"
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                          : rec.priority === "MEDIUM"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {rec.area}: {rec.issue}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    {rec.suggestion}
                  </p>
                </div>

                {onNavigateToTab && rec.actionType && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (rec.actionType === "GENERATE_BIO") onNavigateToTab("bio");
                      else if (rec.actionType === "ADD_LINKS") onNavigateToTab("links");
                    }}
                    className="rounded-xl text-xs font-semibold shrink-0 gap-1"
                  >
                    <span>Fix with AI</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </Card>
            ))}
          </div>

          {/* Quick Tips */}
          <Card className="p-5 rounded-3xl border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-50/60 dark:bg-zinc-900/30 shadow-xs space-y-2">
            <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
              <span>Conversion Pro-Tips for Creators</span>
            </h5>
            <ul className="text-xs text-zinc-500 space-y-1 list-disc list-inside">
              {auditResult.quickTips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}


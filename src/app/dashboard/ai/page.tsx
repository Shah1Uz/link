"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { AIUsageMeter } from "@/components/dashboard/ai/ai-usage-meter";
import { BioGeneratorTab } from "@/components/dashboard/ai/bio-generator-tab";
import { HeadlineGeneratorTab } from "@/components/dashboard/ai/headline-generator-tab";
import { ThemeRecommenderTab } from "@/components/dashboard/ai/theme-recommender-tab";
import { LinkOptimizerTab } from "@/components/dashboard/ai/link-optimizer-tab";
import { ProfileAuditTab } from "@/components/dashboard/ai/profile-audit-tab";
import { CTAGeneratorTab } from "@/components/dashboard/ai/cta-generator-tab";
import { ContentEnhancerTab } from "@/components/dashboard/ai/content-enhancer-tab";
import {
  Sparkles,
  Zap,
  Palette,
  Link2,
  ShieldCheck,
  MousePointerClick,
  Wand2,
} from "lucide-react";

const AI_TABS = [
  { id: "bio", label: "Bio Generator", icon: Sparkles },
  { id: "headline", label: "Headlines", icon: Zap },
  { id: "theme", label: "Theme Design", icon: Palette },
  { id: "links", label: "Link Optimizer", icon: Link2 },
  { id: "audit", label: "Profile Audit", icon: ShieldCheck },
  { id: "cta", label: "CTA Generator", icon: MousePointerClick },
  { id: "enhance", label: "Content Enhancer", icon: Wand2 },
];

export default function AIAssistantPage() {
  const { t } = useI18n();
  const { subscriptionTier } = useDashboard();
  const [activeTab, setActiveTab] = useState<string>("bio");

  const [quota, setQuota] = useState({
    used: 0,
    limit: subscriptionTier === "PRO" ? 200 : 10,
    remaining: subscriptionTier === "PRO" ? 200 : 10,
    period: "2026-11",
    tier: subscriptionTier || "FREE",
  });

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/ai/usage");
      if (res.ok) {
        const json = await res.json();
        if (json.stats?.quota) {
          setQuota(json.stats.quota);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleQuotaUpdate = (updatedQuota: any) => {
    if (updatedQuota) {
      setQuota(updatedQuota);
    } else {
      fetchUsage();
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t.aiStudio.title}
        description={t.aiStudio.description}
      />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <AIUsageMeter quota={quota} onRefresh={fetchUsage} />

        {/* Tab strip */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-surface/40 p-1.5 scrollbar-none">
          {AI_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition-all duration-200 ease-out-soft active:scale-[0.98] ${
                  isActive
                    ? "border border-border/70 bg-card text-foreground shadow-xs"
                    : "border border-transparent text-text-secondary hover:bg-foreground/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isActive ? "text-violet-600 dark:text-violet-400" : ""
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-1">
          {activeTab === "bio" && (
            <BioGeneratorTab onSuccessGeneration={handleQuotaUpdate} />
          )}
          {activeTab === "headline" && (
            <HeadlineGeneratorTab onSuccessGeneration={handleQuotaUpdate} />
          )}
          {activeTab === "theme" && (
            <ThemeRecommenderTab onSuccessGeneration={handleQuotaUpdate} />
          )}
          {activeTab === "links" && (
            <LinkOptimizerTab onSuccessGeneration={handleQuotaUpdate} />
          )}
          {activeTab === "audit" && (
            <ProfileAuditTab
              onSuccessGeneration={handleQuotaUpdate}
              onNavigateToTab={(t) => setActiveTab(t)}
            />
          )}
          {activeTab === "cta" && (
            <CTAGeneratorTab onSuccessGeneration={handleQuotaUpdate} />
          )}
          {activeTab === "enhance" && (
            <ContentEnhancerTab onSuccessGeneration={handleQuotaUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}

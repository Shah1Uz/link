"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { Save, User, Sparkles, Layers } from "lucide-react";
import { toast } from "sonner";
import { HeaderLayoutCard } from "@/components/dashboard/header-layout-card";
import { isPremiumTier } from "@/lib/utils";

const categories = [
  "CREATOR",
  "INFLUENCER",
  "BUSINESS",
  "DEVELOPER",
  "ARTIST",
  "PHOTOGRAPHER",
  "BLOGGER",
  "OTHER",
];

export default function BioEditPage() {
  const { t } = useI18n();
  const { profile, updateProfile, subscriptionTier } = useDashboard();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [category, setCategory] = useState(profile?.category || "CREATOR");
  const [layout, setLayout] = useState(profile?.layout || "classic");
  const [isPublished, setIsPublished] = useState(profile?.isPublished ?? true);
  const [verified, setVerified] = useState(profile?.verified ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const bioAutoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSaveProfile = (data: any, delay = 500) => {
    if (bioAutoSaveTimerRef.current) clearTimeout(bioAutoSaveTimerRef.current);
    bioAutoSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {}
    }, delay);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          bio,
          avatarUrl,
          category,
          layout,
          isPublished,
          verified: isPremiumTier(subscriptionTier) ? verified : undefined,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to update profile");

      updateProfile({
        displayName,
        bio,
        avatarUrl,
        category,
        layout,
        isPublished,
        verified: isPremiumTier(subscriptionTier) ? verified : false,
      });

      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title={t.bioStudio.title}
        description={t.bioStudio.description}
      />

      <form onSubmit={handleSave}>
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Header layout + avatar */}
          <HeaderLayoutCard
            layout={profile?.layout || layout}
            onLayoutChange={async (l) => {
              setLayout(l);
              updateProfile({ layout: l });
              try {
                await fetch("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ layout: l }),
                });
              } catch {}
            }}
            avatarUrl={profile?.avatarUrl || avatarUrl}
            onAvatarChange={async (u) => {
              setAvatarUrl(u);
              updateProfile({ avatarUrl: u });
              try {
                await fetch("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ avatarUrl: u }),
                });
              } catch {}
            }}
            bannerUrl={profile?.bannerUrl}
            onBannerChange={async (url) => {
              updateProfile({ bannerUrl: url });
              try {
                await fetch("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ bannerUrl: url }),
                });
              } catch {}
            }}
            title={profile?.displayName || displayName}
            onTitleChange={(val) => {
              setDisplayName(val);
              updateProfile({ displayName: val });
              triggerAutoSaveProfile({ displayName: val }, 500);
            }}
          />

          {/* Profile information */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                <User className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  Profile information
                </h2>
                <p className="text-[11px] text-text-secondary">
                  How you appear across your public BioSpace page.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-1.5">
                <Label htmlFor="bio-display-name">Display name</Label>
                <Input
                  id="bio-display-name"
                  placeholder="Alex Rivera"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    updateProfile({ displayName: e.target.value });
                    triggerAutoSaveProfile({ displayName: e.target.value }, 500);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio-description">Bio / tagline</Label>
                  <span className="text-[10px] font-semibold tabular-nums text-text-secondary">
                    {bio.length} / 250
                  </span>
                </div>
                <Textarea
                  id="bio-description"
                  placeholder="Tell your visitors who you are and what you create…"
                  value={bio}
                  maxLength={250}
                  onChange={(e) => {
                    setBio(e.target.value);
                    updateProfile({ bio: e.target.value });
                    triggerAutoSaveProfile({ bio: e.target.value }, 500);
                  }}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Profile category</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const isActive = category === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCategory(c);
                          updateProfile({ category: c });
                          triggerAutoSaveProfile({ category: c }, 0);
                        }}
                        className={`rounded-full border px-3.5 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200 ease-out-soft active:scale-95 ${
                          isActive
                            ? "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] dark:text-emerald-200"
                            : "border-border/80 bg-surface/40 text-text-secondary hover:border-border hover:text-foreground"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Visibility & badges */}
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] text-cyan-600 dark:text-cyan-400">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  Visibility & badges
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Control who can reach your page and what it displays.
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/70">
              <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
                <div>
                  <h4 className="text-[13px] font-bold text-foreground">
                    Publish public profile
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    When enabled, visitors can access biospace.com/{profile?.username}
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={(val) => {
                    setIsPublished(val);
                    updateProfile({ isPublished: val });
                    triggerAutoSaveProfile({ isPublished: val }, 0);
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[13px] font-bold text-foreground">
                      Verified creator badge
                    </h4>
                    {isPremiumTier(subscriptionTier) ? (
                      <Badge variant="verified" className="text-[9px]">
                        PRO ACTIVE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">
                        PRO FEATURE
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    Displays the blue verified checkmark next to your display name.
                  </p>
                </div>
                <Switch
                  checked={isPremiumTier(subscriptionTier) && verified}
                  disabled={!isPremiumTier(subscriptionTier)}
                  onCheckedChange={(val) => {
                    setVerified(val);
                    updateProfile({ verified: val });
                    triggerAutoSaveProfile({ verified: val }, 0);
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Sticky save bar */}
          <div className="sticky bottom-4 z-20">
            <div className="glint flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-background/90 p-3 shadow-lift backdrop-blur-xl">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="truncate text-[11px] font-medium text-text-secondary">
                  Unsaved changes are visible in the live preview.
                </p>
              </div>
              <Button
                type="submit"
                isLoading={isSaving}
                className="shrink-0 gap-1.5 rounded-xl text-xs font-bold"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save changes</span>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

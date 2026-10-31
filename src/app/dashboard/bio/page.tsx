"use client";

import React, { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import { Sparkles, Save, User, CheckCircle2, Layout, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AvatarUploader } from "@/components/shared/avatar-uploader";

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

const layouts = [
  { id: "classic", label: "Classic" },
  { id: "hero", label: "Hero Banner" },
  { id: "banner", label: "Top Banner" },
  { id: "cutout", label: "Cutout" },
  { id: "shape", label: "Shape Avatar" },
  { id: "minimal", label: "Minimalist" },
  { id: "gradient", label: "Gradient Glow" },
  { id: "modern", label: "Modern Floating" },
  { id: "glass", label: "Frosted Glass" },
  { id: "creator", label: "Creator Studio" },
];

export default function BioEditPage() {
  const { profile, updateProfile, subscriptionTier } = useDashboard();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  const [category, setCategory] = useState(profile?.category || "CREATOR");
  const [layout, setLayout] = useState(profile?.layout || "classic");
  const [isPublished, setIsPublished] = useState(profile?.isPublished ?? true);
  const [isSaving, setIsSaving] = useState(false);

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
        }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      const json = await res.json();

      updateProfile({
        displayName,
        bio,
        avatarUrl,
        category,
        layout,
        isPublished,
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
        title="My Bio Page"
        description="Configure your public display name, biography, category, and profile layout."
      />

      <div className="p-4 sm:p-8 max-w-3xl space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info Card */}
          <Card className="p-6 space-y-5">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Profile Information</span>
            </h3>

            {/* Avatar Uploader from Device */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Avatar Photo / Profil Rasmi
              </label>
              <AvatarUploader
                currentUrl={avatarUrl}
                onUploadSuccess={(url) => {
                  setAvatarUrl(url);
                  updateProfile({ avatarUrl: url });
                }}
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Display Name
              </label>
              <Input
                placeholder="Alex Rivera"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  updateProfile({ displayName: e.target.value });
                }}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Bio / Tagline
              </label>
              <Textarea
                placeholder="Tell your visitors who you are and what you create..."
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  updateProfile({ bio: e.target.value });
                }}
                rows={3}
              />
              <p className="mt-1 text-right text-[11px] text-zinc-400">
                {bio.length} / 250 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Profile Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      updateProfile({ category: c });
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      category === c
                        ? "bg-emerald-500 text-black shadow-sm"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Profile Layout Selector */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Layout className="h-4 w-4 text-emerald-500" />
              <span>Profile Layout</span>
            </h3>
            <p className="text-xs text-zinc-500">
              Select how your avatar, header, and badges are arranged on your public page.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {layouts.map((l) => {
                const isSelected = layout === l.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      setLayout(l.id);
                      updateProfile({ layout: l.id });
                    }}
                    className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <span className="text-xs">{l.label}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Visibility & Badges */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Publish Public Profile
                </h4>
                <p className="text-xs text-zinc-500">
                  When enabled, visitors can access biospace.com/{profile?.username}
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={(val) => {
                  setIsPublished(val);
                  updateProfile({ isPublished: val });
                }}
              />
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Verified Creator Badge
                  </h4>
                  {subscriptionTier === "PRO" ? (
                    <Badge variant="verified">PRO ACTIVE</Badge>
                  ) : (
                    <Badge variant="outline">PRO FEATURE</Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  Displays the blue verified checkmark next to your display name.
                </p>
              </div>
              <Switch
                checked={profile?.verified || false}
                disabled={subscriptionTier !== "PRO"}
                onCheckedChange={(val) => {
                  updateProfile({ verified: val });
                }}
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              isLoading={isSaving}
              className="rounded-2xl px-8 font-bold"
            >
              <Save className="h-4 w-4 mr-2" />
              <span>Save Changes</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


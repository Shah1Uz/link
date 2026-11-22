"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Save,
  Sparkles,
  Shield,
  Loader2,
  SlidersHorizontal,
  Megaphone,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";

function SectionHeading({
  icon: Icon,
  title,
  description,
  tone = "emerald",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  tone?: "emerald" | "cyan" | "violet" | "amber";
}) {
  const tones: Record<string, string> = {
    emerald:
      "border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400",
    cyan: "border-cyan-500/20 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.03] text-cyan-600 dark:text-cyan-400",
    violet:
      "border-violet-500/20 bg-gradient-to-b from-violet-500/15 to-violet-500/[0.03] text-violet-600 dark:text-violet-300",
    amber:
      "border-amber-500/20 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.03] text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${tones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <h3 className="font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-transparent px-1 py-3 transition-colors hover:border-zinc-200/80 hover:bg-zinc-50/60 dark:hover:border-white/[0.06] dark:hover:bg-white/[0.02]">
      <div className="min-w-0">
        <h4 className="text-xs font-bold text-foreground">{title}</h4>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
          {description}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [resSettings, resFlags] = await Promise.all([
          fetch("/api/admin/settings"),
          fetch("/api/admin/feature-flags"),
        ]);

        if (resSettings.ok) {
          const json = await resSettings.json();
          setSettings(json.settings);
        }
        if (resFlags.ok) {
          const jsonFlags = await resFlags.json();
          setFlags(jsonFlags.flags || []);
        }
      } catch {
        toast.error("Failed to load platform settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleToggleFlag = async (key: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      setFlags(flags.map((f) => (f.key === key ? { ...f, isEnabled: newVal } : f)));

      const res = await fetch("/api/admin/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, isEnabled: newVal }),
      });

      if (!res.ok) throw new Error("Failed to toggle flag");
      toast.success(`Feature flag '${key}' updated`);
    } catch {
      toast.error("Failed to update feature flag");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to update settings");
      toast.success("Platform settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div>
        <AdminHeader
          title="Platform Configuration"
          description="Sitewide identity, registration controls, quotas and feature rollouts."
        />
        <div className="mx-auto max-w-6xl p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-3">
                  <div className="shimmer h-9 w-9 rounded-xl bg-zinc-100 dark:bg-white/[0.05]" />
                  <div className="flex-1 space-y-2">
                    <div className="shimmer h-3 w-32 rounded-full bg-zinc-100 dark:bg-white/[0.05]" />
                    <div className="shimmer h-2.5 w-48 rounded-full bg-zinc-100 dark:bg-white/[0.04]" />
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="shimmer h-10 w-full rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
                  <div className="shimmer h-10 w-full rounded-xl bg-zinc-100 dark:bg-white/[0.04]" />
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
            <span>Loading platform configuration…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Platform & System Settings"
        description="Configure sitewide limits, registration availability, maintenance mode, and announcements."
      />

      <div className="mx-auto max-w-6xl p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* General platform identity */}
            <Card className="space-y-5 p-5 sm:p-6">
              <SectionHeading
                icon={Sparkles}
                title="General Platform Identity"
                description="Public brand name, logo and tagline used across BioSpace."
              />

              <div className="space-y-4 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="site-name">Website Name</Label>
                    <Input
                      id="site-name"
                      value={settings.siteName || ""}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="logo-url">Logo URL</Label>
                    <Input
                      id="logo-url"
                      value={settings.logoUrl || ""}
                      placeholder="/logo.svg"
                      onChange={(e) =>
                        setSettings({ ...settings, logoUrl: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="site-tagline">Site Description / Tagline</Label>
                  <Input
                    id="site-tagline"
                    value={settings.siteDescription || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, siteDescription: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Platform toggles */}
            <Card className="space-y-5 p-5 sm:p-6">
              <SectionHeading
                icon={Shield}
                title="Platform Toggles & Controls"
                description="Global switches for registration and maintenance mode."
                tone="cyan"
              />

              <div className="divide-y divide-zinc-100 border-t border-zinc-100 pt-2 dark:divide-white/[0.06] dark:border-white/[0.06]">
                <ToggleRow
                  title="User Registration"
                  description="Allow new creator signups through Clerk auth flows."
                  checked={settings.registrationEnabled ?? true}
                  onCheckedChange={(val) =>
                    setSettings({ ...settings, registrationEnabled: val })
                  }
                />
                <ToggleRow
                  title="Maintenance Mode"
                  description="Temporarily display a maintenance notice to public visitors."
                  checked={settings.maintenanceMode ?? false}
                  onCheckedChange={(val) =>
                    setSettings({ ...settings, maintenanceMode: val })
                  }
                />
              </div>
            </Card>

            {/* Plan limits */}
            <Card className="space-y-5 p-5 sm:p-6">
              <SectionHeading
                icon={Gauge}
                title="Plan Limits & Quotas"
                description="Maximum number of links each subscription tier can publish."
                tone="amber"
              />

              <div className="grid grid-cols-1 gap-4 border-t border-zinc-100 pt-4 sm:grid-cols-2 dark:border-white/[0.06]">
                <div className="space-y-1.5">
                  <Label htmlFor="free-links">Free Tier Max Links</Label>
                  <Input
                    id="free-links"
                    type="number"
                    value={settings.maxFreeLinks ?? 10}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxFreeLinks: parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pro-links">Pro Tier Max Links</Label>
                  <Input
                    id="pro-links"
                    type="number"
                    value={settings.maxProLinks ?? 100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxProLinks: parseInt(e.target.value) || 100,
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Announcement */}
            <Card className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <SectionHeading
                  icon={Megaphone}
                  title="Sitewide Announcement Banner"
                  description="Broadcast updates across the top of dashboard and landing pages."
                  tone="violet"
                />
                <Switch
                  checked={settings.announcementActive ?? false}
                  onCheckedChange={(val) =>
                    setSettings({ ...settings, announcementActive: val })
                  }
                />
              </div>

              <div className="space-y-1.5 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
                <Label htmlFor="announcement-text">Announcement Text</Label>
                <Input
                  id="announcement-text"
                  placeholder="Welcome to BioSpace 2.0! We have launched custom QR codes."
                  value={settings.announcementText || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, announcementText: e.target.value })
                  }
                />
                <p className="pt-1 text-[10.5px] text-text-secondary">
                  Visible on all public-facing pages while the banner is enabled.
                </p>
              </div>
            </Card>

            {/* Feature flags */}
            <Card className="space-y-5 p-5 sm:col-span-2 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionHeading
                  icon={SlidersHorizontal}
                  title="Enterprise Feature Flags & Capabilities"
                  description="Instantly toggle experimental modules and premium capabilities across production."
                />
                <Badge variant="secondary" className="shrink-0 tabular-nums">
                  {flags.length} flags
                </Badge>
              </div>

              <div className="divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
                {flags.length === 0 ? (
                  <p className="py-6 text-center text-xs text-text-secondary">
                    No feature flags registered yet.
                  </p>
                ) : (
                  flags.map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {f.name}
                          </span>
                          <code className="rounded-md border border-zinc-200/80 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-text-secondary dark:border-white/[0.08] dark:bg-white/[0.04]">
                            {f.key}
                          </code>
                          <Badge
                            variant={f.isEnabled ? "success" : "secondary"}
                            className="px-2 py-0 text-[9px]"
                          >
                            {f.isEnabled ? "On" : "Off"}
                          </Badge>
                        </div>
                        {f.description && (
                          <p className="mt-0.5 text-[11px] text-text-secondary">
                            {f.description}
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={f.isEnabled}
                        onCheckedChange={() => handleToggleFlag(f.key, f.isEnabled)}
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Save bar */}
          <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white/85 p-3 shadow-soft backdrop-blur-xl dark:border-white/[0.08] dark:bg-card/90 sm:px-4">
            <div className="flex items-center gap-2 text-[11px] text-text-secondary">
              <SettingsIcon className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                Changes are applied platform-wide and recorded in the audit log.
              </span>
            </div>
            <Button
              type="submit"
              size="default"
              isLoading={saving}
              className="gap-2 rounded-xl px-6 font-bold"
            >
              <Save className="h-4 w-4" />
              <span>Save Platform Settings</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

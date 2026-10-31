"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Sparkles, Shield, AlertTriangle, Loader2, ToggleLeft, Check } from "lucide-react";
import { toast } from "sonner";

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
        <AdminHeader title="Platform Configuration" />
        <div className="h-64 flex items-center justify-center text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" />
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

      <div className="p-6 sm:p-8 max-w-3xl space-y-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Platform Branding */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>General Platform Identity</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Website Name
                </label>
                <Input
                  value={settings.siteName || ""}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Logo URL
                </label>
                <Input
                  value={settings.logoUrl || ""}
                  placeholder="/logo.svg"
                  onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Site Description / Tagline
              </label>
              <Input
                value={settings.siteDescription || ""}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              />
            </div>
          </Card>

          {/* Sitewide Feature Flags */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Platform Toggles & Controls</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    User Registration
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Allow new creator signups through Clerk auth flows.
                  </p>
                </div>
                <Switch
                  checked={settings.registrationEnabled ?? true}
                  onCheckedChange={(val) =>
                    setSettings({ ...settings, registrationEnabled: val })
                  }
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Maintenance Mode
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Temporarily display a maintenance notice to public visitors.
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode ?? false}
                  onCheckedChange={(val) =>
                    setSettings({ ...settings, maintenanceMode: val })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Plan Limits */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Plan Limits & Quotas
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Free Tier Max Links
                </label>
                <Input
                  type="number"
                  value={settings.maxFreeLinks ?? 10}
                  onChange={(e) =>
                    setSettings({ ...settings, maxFreeLinks: parseInt(e.target.value) || 10 })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Pro Tier Max Links
                </label>
                <Input
                  type="number"
                  value={settings.maxProLinks ?? 100}
                  onChange={(e) =>
                    setSettings({ ...settings, maxProLinks: parseInt(e.target.value) || 100 })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Announcement Banner */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Sitewide Announcement Banner
                </h3>
                <p className="text-xs text-zinc-500">
                  Broadcast updates across the top of all dashboard and landing pages.
                </p>
              </div>
              <Switch
                checked={settings.announcementActive ?? false}
                onCheckedChange={(val) =>
                  setSettings({ ...settings, announcementActive: val })
                }
              />
            </div>

            <div>
              <Input
                placeholder="Welcome to BioSpace 2.0! We have launched custom QR codes."
                value={settings.announcementText || ""}
                onChange={(e) =>
                  setSettings({ ...settings, announcementText: e.target.value })
                }
              />
            </div>
          </Card>

          {/* Feature Flags & Gradual Rollouts */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>Enterprise Feature Flags & Capabilities</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Instantly toggle experimental modules and premium capabilities across production.
              </p>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {flags.map((f) => (
                <div key={f.key} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{f.name}</span>
                      <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                        {f.key}
                      </code>
                    </div>
                    {f.description && (
                      <p className="text-[11px] text-zinc-500 mt-0.5">{f.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={f.isEnabled}
                    onCheckedChange={() => handleToggleFlag(f.key, f.isEnabled)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" isLoading={saving} className="rounded-2xl px-10 font-bold">
              <Save className="h-4 w-4 mr-2" />
              <span>Save Platform Settings</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


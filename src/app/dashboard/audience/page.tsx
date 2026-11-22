"use client";

import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  Users,
  Download,
  Search,
  Mail,
  UserCheck,
  TrendingUp,
  Sparkles,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  UserX,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Layout,
  ExternalLink,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PublicNewsletterBlock } from "@/components/profile/public-newsletter-block";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  status: "PENDING" | "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
  source: string;
  subscribedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
  consents?: Array<{
    consentType: string;
    consentedAt: string;
    consentText: string;
  }>;
}

interface AudienceMetrics {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  newThisMonth: number;
}

export default function AudienceDashboardPage() {
  const { t } = useI18n();
  const { profile } = useDashboard();
  const [activeTab, setActiveTab] = useState<"subscribers" | "customizer" | "privacy">("subscribers");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [metrics, setMetrics] = useState<AudienceMetrics>({
    total: 0,
    active: 0,
    pending: 0,
    unsubscribed: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Newsletter Form Settings state
  const [newsletterEnabled, setNewsletterEnabled] = useState(true);
  const [newsletterTitle, setNewsletterTitle] = useState("Join my Newsletter");
  const [newsletterDescription, setNewsletterDescription] = useState(
    "Get exclusive updates, insights, and new project releases straight to your inbox."
  );
  const [newsletterButtonText, setNewsletterButtonText] = useState("Subscribe");
  const [newsletterPlaceholder, setNewsletterPlaceholder] = useState("Enter your email address...");
  const [newsletterSuccessMessage, setNewsletterSuccessMessage] = useState(
    "Thanks for subscribing! Check your email to confirm your subscription."
  );
  const [newsletterLayout, setNewsletterLayout] = useState<"card" | "minimal" | "inline" | "hero">("card");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== "ALL") queryParams.set("status", statusFilter);
      if (search.trim()) queryParams.set("search", search.trim());

      const res = await fetch(`/api/subscribers?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.newsletterSettings) {
          setNewsletterEnabled(data.newsletterSettings.newsletterEnabled ?? true);
          setNewsletterTitle(data.newsletterSettings.newsletterTitle || "Join my Newsletter");
          setNewsletterDescription(
            data.newsletterSettings.newsletterDescription ||
              "Get exclusive updates, insights, and new project releases straight to your inbox."
          );
          setNewsletterButtonText(data.newsletterSettings.newsletterButtonText || "Subscribe");
          setNewsletterPlaceholder(data.newsletterSettings.newsletterPlaceholder || "Enter your email address...");
          setNewsletterSuccessMessage(
            data.newsletterSettings.newsletterSuccessMessage ||
              "Thanks for subscribing! Check your email to confirm your subscription."
          );
          setNewsletterLayout(data.newsletterSettings.newsletterLayout || "card");
        }
      }
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubscribers();
  };

  const handleExportCSV = () => {
    window.open("/api/subscribers/export", "_blank");
    toast.success("Downloading subscribers CSV...");
  };

  const handleResendConfirmation = async (subscriberId: string, email: string) => {
    try {
      const res = await fetch(`/api/subscribers/${subscriberId}/resend`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend confirmation email");
      toast.success(data.message || `Confirmation email sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || "Could not resend confirmation");
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${email}? This action complies with GDPR erasure.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/subscribers/${subscriberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete subscriber");
      toast.success("Subscriber record permanently deleted");
      setSubscribers((prev) => prev.filter((s) => s.id !== subscriberId));
      setMetrics((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
    } catch {
      toast.error("Failed to delete subscriber record");
    }
  };

  const handleSaveNewsletterSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await fetch("/api/profile/newsletter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsletterEnabled,
          newsletterTitle,
          newsletterDescription,
          newsletterButtonText,
          newsletterPlaceholder,
          newsletterSuccessMessage,
          newsletterLayout,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save settings");
      toast.success("Newsletter form settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="flex-1 pb-16">
      <DashboardHeader
        heading={t.audience.title}
        text={t.audience.description}
      >
        <div className="flex items-center gap-2">
          {profile?.username && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-semibold gap-1.5"
            >
              <a href={`/${profile.username}`} target="_blank" rel="noreferrer">
                <span>{t.sidebar.viewPublicPage}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="rounded-xl border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-1.5"
          >
            <Download className="h-4 w-4" />
            <span>{t.audience.exportCsv}</span>
          </Button>
        </div>
      </DashboardHeader>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* KPI Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">Total Subscribers</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{metrics.total}</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">All-time list size</p>
            </div>
          </div>

          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">Active Verified</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{metrics.active}</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Double opt-in confirmed</p>
            </div>
          </div>

          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">Pending Confirmation</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-amber-500 tracking-tight">{metrics.pending}</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Awaiting email verification</p>
            </div>
          </div>

          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">Unsubscribed</span>
              <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <UserX className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{metrics.unsubscribed}</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Opted out with 1-click</p>
            </div>
          </div>

          <div className="card-lift p-4 rounded-2xl border border-border/80 bg-card shadow-soft flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">New This Month</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">+{metrics.newThisMonth}</div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">Last 30 days growth</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex overflow-x-auto scrollbar-none border-b border-border/70">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "subscribers"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Subscribers Directory ({subscribers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("customizer")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "customizer"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Layout className="h-4 w-4" />
            <span>Subscription Form Customizer</span>
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "privacy"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Privacy & Double Opt-In</span>
          </button>
        </div>

        {/* TAB 1: SUBSCRIBERS DIRECTORY */}
        {activeTab === "subscribers" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border/80 bg-card shadow-xs">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search subscribers by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-xl h-9 text-xs"
                />
              </form>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "ACTIVE", "PENDING", "UNSUBSCRIBED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      statusFilter === st
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {st === "ALL" ? "All Subscribers" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscribers Table */}
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-12 text-center text-zinc-500 text-sm">Loading subscribers...</div>
                ) : subscribers.length === 0 ? (
                  <div className="p-12 text-center text-text-secondary space-y-2">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-surface/60 text-text-secondary">
                      <Mail className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-bold text-foreground">No subscribers found</p>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      Share your BioSpace profile to collect email subscribers with automated double opt-in verification.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface/60 text-text-secondary uppercase tracking-wider font-bold border-b border-border/70">
                        <tr>
                          <th className="px-5 py-3.5">Subscriber</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Source</th>
                          <th className="px-5 py-3.5">Subscribed Date</th>
                          <th className="px-5 py-3.5">Confirmed Date</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {subscribers.map((s) => (
                          <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                            <td className="px-5 py-4">
                              <div className="font-bold text-zinc-900 dark:text-white text-sm">{s.email}</div>
                              {s.name && <div className="text-[11px] text-zinc-500">{s.name}</div>}
                            </td>
                            <td className="px-5 py-4">
                              <Badge
                                className={`text-[10px] font-bold ${
                                  s.status === "ACTIVE"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : s.status === "PENDING"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                                }`}
                              >
                                {s.status === "ACTIVE"
                                  ? "✓ Active"
                                  : s.status === "PENDING"
                                  ? "⏳ Pending Confirm"
                                  : "Opted Out"}
                              </Badge>
                            </td>
                            <td className="px-5 py-4 text-zinc-500 font-medium">
                              {s.source === "profile_page" ? "Profile Form" : s.source}
                            </td>
                            <td className="px-5 py-4 text-zinc-500">
                              {new Date(s.subscribedAt).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4 text-zinc-500">
                              {s.confirmedAt ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {new Date(s.confirmedAt).toLocaleDateString()}
                                </span>
                              ) : (
                                <span className="text-zinc-400 italic">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {s.status === "PENDING" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleResendConfirmation(s.id, s.email)}
                                    className="h-7 px-2 text-[11px] text-amber-500 hover:text-amber-600 font-semibold"
                                    title="Resend Double Opt-In Email"
                                  >
                                    <Send className="h-3 w-3 mr-1" />
                                    <span>Resend</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSubscriber(s.id, s.email)}
                                  className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-red-500"
                                  title="GDPR Delete Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: PUBLIC FORM CUSTOMIZER */}
        {activeTab === "customizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Configuration Form */}
            <div className="lg:col-span-7 space-y-4">
              <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">
                    Subscription Form Settings
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Customize the email collection block displayed on your BioSpace public page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <form onSubmit={handleSaveNewsletterSettings} className="space-y-4">
                    {/* Toggle Enable */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-white">Show on Public Profile</h5>
                        <p className="text-[11px] text-zinc-500">
                          Enables the subscription block on your live page.
                        </p>
                      </div>
                      <Switch
                        checked={newsletterEnabled}
                        onCheckedChange={setNewsletterEnabled}
                      />
                    </div>

                    {/* Layout Selector */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Block Layout</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "card", label: "Card", desc: "Rounded card" },
                          { id: "minimal", label: "Minimal", desc: "Compact bar" },
                          { id: "inline", label: "Inline", desc: "Borderless" },
                          { id: "hero", label: "Hero Banner", desc: "High-impact" },
                        ].map((ly) => (
                          <div
                            key={ly.id}
                            onClick={() => setNewsletterLayout(ly.id as any)}
                            className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                              newsletterLayout === ly.id
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold"
                                : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            <div className="text-xs">{ly.label}</div>
                            <div className="text-[10px] opacity-70 mt-0.5">{ly.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1">
                      <Label htmlFor="form-title" className="text-xs font-bold">Form Title *</Label>
                      <Input
                        id="form-title"
                        value={newsletterTitle}
                        onChange={(e) => setNewsletterTitle(e.target.value)}
                        required
                        className="rounded-xl h-10 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="form-desc" className="text-xs font-bold">Description / Incentive</Label>
                      <textarea
                        id="form-desc"
                        rows={2}
                        value={newsletterDescription}
                        onChange={(e) => setNewsletterDescription(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs leading-relaxed"
                      />
                    </div>

                    {/* Button Text & Placeholder */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="btn-text" className="text-xs font-bold">Button CTA *</Label>
                        <Input
                          id="btn-text"
                          value={newsletterButtonText}
                          onChange={(e) => setNewsletterButtonText(e.target.value)}
                          required
                          className="rounded-xl h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="placeholder-text" className="text-xs font-bold">Placeholder</Label>
                        <Input
                          id="placeholder-text"
                          value={newsletterPlaceholder}
                          onChange={(e) => setNewsletterPlaceholder(e.target.value)}
                          required
                          className="rounded-xl h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="space-y-1">
                      <Label htmlFor="success-msg" className="text-xs font-bold">Success Confirmation Message</Label>
                      <Input
                        id="success-msg"
                        value={newsletterSuccessMessage}
                        onChange={(e) => setNewsletterSuccessMessage(e.target.value)}
                        required
                        className="rounded-xl h-9 text-xs"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={savingSettings}
                      className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs py-5"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Form Configuration"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right: Live Profile Mockup Preview */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Interactive Live Preview</span>
                <Badge variant="outline" className="text-[10px]">
                  Layout: {newsletterLayout.toUpperCase()}
                </Badge>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center mx-auto text-sm">
                    {profile?.username?.slice(0, 2).toUpperCase() || "ME"}
                  </div>
                  <h4 className="font-bold text-white text-sm">@{profile?.username || "creator"}</h4>
                </div>

                {/* Render the configured block */}
                <PublicNewsletterBlock
                  profile={{
                    id: profile?.id || "preview",
                    username: profile?.username || "creator",
                    newsletterEnabled,
                    newsletterTitle,
                    newsletterDescription,
                    newsletterButtonText,
                    newsletterPlaceholder,
                    newsletterSuccessMessage,
                    newsletterLayout,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRIVACY & DOUBLE OPT-IN */}
        {activeTab === "privacy" && (
          <div className="space-y-4 max-w-3xl">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
              <CardHeader className="p-6 pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span>Privacy, GDPR & CAN-SPAM Compliance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  BioSpace enforces strict international standards to protect you and your subscribers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Strict Double Opt-In</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Every subscriber must confirm their email via a secure 24-hour verification token. Prevents fake emails, typos, and bot spam.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Tamper-Proof Consent Log</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Every signup records an immutable timestamp, consent statement, client IP address, and user-agent string in the database.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>1-Click Instant Unsubscribe</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Every email sent contains an RFC-compliant one-click unsubscribe link with a secure unique token.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-1.5">
                    <div className="font-bold text-xs text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Anti-Spam & Erasure</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Creators can permanently erase subscriber records upon request with full database cascade deletion.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Email Service Provider Configuration
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    BioSpace uses a multi-provider email architecture supporting Resend, SendGrid, and SMTP. In development, emails are safely logged and audited in <code className="font-mono text-emerald-400">EmailDeliveryLog</code>. To send live production emails:
                  </p>
                  <pre className="p-3 rounded-lg bg-zinc-950 text-emerald-400 text-xs font-mono overflow-x-auto">
{`RESEND_API_KEY="re_..."
EMAIL_FROM="BioSpace <newsletter@yourdomain.com>"`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

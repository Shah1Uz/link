"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  ExternalLink,
  Link2,
  Globe,
  Music,
  ShoppingBag,
  Activity,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  Loader2,
  Pin,
  MousePointerClick,
  Clock,
  CreditCard,
  Copy,
  Video,
  Image as ImageIcon,
  Calendar,
  Users,
  Cpu,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { toast } from "sonner";
import { cn, isPremiumTier } from "@/lib/utils";

interface UserDetailsDrawerProps {
  userId: string | null;
  onClose: () => void;
  onUserUpdated: (updatedUser: any) => void;
}

type DrawerTab =
  | "overview"
  | "links"
  | "music"
  | "domains"
  | "orders"
  | "activity";

export function UserDetailsDrawer({
  userId,
  onClose,
  onUserUpdated,
}: UserDetailsDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [impersonating, setImpersonating] = useState(false);

  const loadDetails = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ma'lumotlarni yuklab bo'lmadi");
      setDetails(data.user);
      setActivityLogs(data.activityLogs || []);
      setAdminAuditLogs(data.adminAuditLogs || []);
    } catch (err: any) {
      toast.error(err.message || "Foydalanuvchi ma'lumotlari yuklanmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setActiveTab("overview");
      loadDetails(userId);
    } else {
      setDetails(null);
      setActivityLogs([]);
      setAdminAuditLogs([]);
    }
  }, [userId, loadDetails]);

  useEffect(() => {
    if (!userId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [userId, onClose]);

  if (!userId) return null;

  const handlePatchUser = async (
    updates: {
      verified?: boolean;
      subscriptionTier?: string;
      role?: string;
      isSuspended?: boolean;
      isBanned?: boolean;
    },
    fieldKey: string
  ) => {
    if (!details) return;
    try {
      setUpdatingField(fieldKey);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: details.id, ...updates }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Yangilashda xatolik");

      setDetails((prev: any) =>
        prev
          ? {
              ...prev,
              ...updates,
              profile: prev.profile
                ? {
                    ...prev.profile,
                    ...(updates.verified !== undefined
                      ? { verified: updates.verified }
                      : updates.subscriptionTier !== undefined &&
                          !isPremiumTier(updates.subscriptionTier)
                        ? { verified: false }
                        : {}),
                  }
                : json.user?.profile || prev.profile,
            }
          : prev
      );
      if (json.user) onUserUpdated(json.user);

      if (updates.verified !== undefined) {
        toast.success(
          updates.verified
            ? "Ko'k galochka (Verified) berildi!"
            : "Verified belgisi olib tashlandi"
        );
      } else {
        toast.success("Foydalanuvchi holati yangilandi");
      }
    } catch (err: any) {
      toast.error(err.message || "Yangilash amalga oshmadi");
    } finally {
      setUpdatingField(null);
    }
  };

  const handleImpersonate = async () => {
    if (!details) return;
    try {
      setImpersonating(true);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: details.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impersonate boshlanmadi");

      toast.success(`@${details.profile?.username || details.email} sifatida kirilmoqda...`);
      window.location.href = data.redirectUrl || "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Foydalanuvchi sifatida kirib bo'lmadi");
      setImpersonating(false);
    }
  };

  const copyText = async (val: string) => {
    try {
      await navigator.clipboard.writeText(val);
      toast.success("Nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi");
    }
  };

  const profile = details?.profile;
  const theme = profile?.theme;
  const links: any[] = profile?.links || [];
  const domains: any[] = profile?.customDomains || [];
  const products: any[] = profile?.products || [];
  const orders: any[] = profile?.orders || [];
  const socialAccounts: any[] = profile?.socialAccounts || [];
  const isPremium = isPremiumTier(details?.subscriptionTier);
  const isVerified = Boolean(profile?.verified && isPremium);
  const avatarSrc = profile?.avatarUrl || details?.avatar || null;
  const displayName =
    profile?.displayName || details?.name || profile?.username || "Anonymous";

  const totalOrderRevenue = orders.reduce(
    (sum, o) => (o.status === "COMPLETED" ? sum + Number(o.amount || 0) : sum),
    0
  );

  const tabs: {
    id: DrawerTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }[] = [
    { id: "overview", label: "Umumiy", icon: UserCheck },
    { id: "links", label: "Linklar", icon: Link2, count: links.length },
    { id: "music", label: "Musiqa", icon: Music },
    { id: "domains", label: "Domenlar", icon: Globe, count: domains.length },
    { id: "orders", label: "Buyurtmalar", icon: ShoppingBag, count: orders.length },
    {
      id: "activity",
      label: "Faollik",
      icon: Activity,
      count: activityLogs.length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Foydalanuvchi batafsil ma'lumotlari"
    >
      <div
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-zinc-200/80 bg-background shadow-2xl dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drawer Header */}
        <div className="shrink-0 border-b border-zinc-200/80 bg-surface/60 px-5 py-4 backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.02]">
          <div className="flex items-start justify-between gap-3">
            {loading && !details ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-zinc-200 dark:bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-zinc-200 dark:bg-white/10" />
                  <div className="h-3 w-52 animate-pulse rounded bg-zinc-200 dark:bg-white/10" />
                </div>
              </div>
            ) : details ? (
              <div className="flex min-w-0 items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 text-sm font-extrabold uppercase text-emerald-950">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayName.slice(0, 2)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="truncate font-heading text-base font-extrabold tracking-tight text-foreground">
                      {displayName}
                    </h2>
                    {isVerified && <VerifiedBadge size="sm" />}
                    <Badge
                      variant={details.subscriptionTier === "PRO" ? "pro" : "outline"}
                      className="px-1.5 py-0 text-[9px]"
                    >
                      {details.subscriptionTier}
                    </Badge>
                    {details.isBanned ? (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[9px]">
                        BANNED
                      </Badge>
                    ) : details.isSuspended ? (
                      <Badge variant="warning" className="px-1.5 py-0 text-[9px]">
                        SUSPENDED
                      </Badge>
                    ) : (
                      <Badge variant="success" className="px-1.5 py-0 text-[9px]">
                        ACTIVE
                      </Badge>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span className="truncate">{details.email}</span>
                    {profile?.username && (
                      <>
                        <span>&middot;</span>
                        <a
                          href={`/${profile.username}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                        >
                          /{profile.username}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              aria-label="Yopish"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 text-text-secondary transition-colors hover:bg-zinc-100 hover:text-foreground dark:border-white/10 dark:hover:bg-white/[0.06]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Primary Actions Bar */}
          {details && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={isVerified || !isPremium ? "outline" : "default"}
                disabled={updatingField === "verified"}
                onClick={() => {
                  if (!isPremium) {
                    toast.error(
                      "Ko'k galochka (Verified) faqat Premium (PRO) obuna olgan foydalanuvchilarga beriladi. Avval PRO bering!"
                    );
                    return;
                  }
                  handlePatchUser({ verified: !isVerified }, "verified");
                }}
                className={cn(
                  "h-8 gap-1.5 rounded-xl px-3 text-xs font-bold",
                  !isPremium
                    ? "border-zinc-300/70 text-text-secondary opacity-70 dark:border-white/10"
                    : isVerified
                      ? "border-sky-500/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/15 dark:text-sky-300"
                      : "bg-sky-500 text-white hover:bg-sky-600"
                )}
              >
                {updatingField === "verified" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : !isPremium ? (
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                ) : (
                  <VerifiedBadge size="xs" />
                )}
                <span>
                  {!isPremium
                    ? "Verified (Faqat PRO)"
                    : isVerified
                      ? "Verified (Olib tashlash)"
                      : "Verified (Ko'k galochka berish)"}
                </span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={impersonating}
                onClick={handleImpersonate}
                className="h-8 gap-1.5 rounded-xl border-amber-500/35 bg-amber-500/10 px-3 text-xs font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-300"
              >
                {impersonating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                <span>Foydalanuvchi sifatida ko&apos;rish</span>
              </Button>

              {profile?.username && (
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 rounded-xl px-2.5 text-xs"
                >
                  <a
                    href={`/${profile.username}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ochiq profil</span>
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Navigation Tabs */}
          {details && (
            <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                      active
                        ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300"
                        : "text-text-secondary hover:bg-zinc-100 hover:text-foreground dark:hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="rounded-md bg-black/5 px-1.5 py-0.2 font-mono text-[10px] dark:bg-white/10">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Profil ma&apos;lumotlari yuklanmoqda...
              </p>
            </div>
          ) : !details ? (
            <p className="py-12 text-center text-xs text-text-secondary">
              Ma&apos;lumot topilmadi
            </p>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Stat Grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <MousePointerClick className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Ko&apos;rish / Klik</span>
                      </div>
                      <p className="mt-1.5 font-heading text-lg font-extrabold">
                        {profile?._count?.analyticsEvents ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <Link2 className="h-3.5 w-3.5 text-cyan-500" />
                        <span>Linklar</span>
                      </div>
                      <p className="mt-1.5 font-heading text-lg font-extrabold">
                        {profile?._count?.links ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <Users className="h-3.5 w-3.5 text-violet-500" />
                        <span>Obunachilar</span>
                      </div>
                      <p className="mt-1.5 font-heading text-lg font-extrabold">
                        {profile?._count?.subscribers ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span>Bronlar</span>
                      </div>
                      <p className="mt-1.5 font-heading text-lg font-extrabold">
                        {profile?._count?.bookings ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Bio & Profile Meta */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Profil ma&apos;lumotlari
                    </h3>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="flex justify-between gap-4">
                        <span className="text-text-secondary">User ID:</span>
                        <button
                          type="button"
                          onClick={() => copyText(details.id)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] hover:text-emerald-500"
                        >
                          {details.id}
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-text-secondary">Dizayn Layout:</span>
                        <span className="font-semibold uppercase">
                          {profile?.layout || "classic"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-text-secondary">Kategoriya:</span>
                        <span className="font-semibold">
                          {profile?.category || "CREATOR"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-text-secondary">Qo&apos;shilgan sana:</span>
                        <span className="font-mono text-[11px]">
                          {new Date(details.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-text-secondary">AI Foydalanish:</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Cpu className="h-3 w-3 text-violet-500" />
                          {details.aiUsage?.generationCount ?? 0} marta (
                          {details.aiUsage?.tokenCount ?? 0} token)
                        </span>
                      </div>
                      {details.subscription && (
                        <div className="flex justify-between gap-4">
                          <span className="text-text-secondary">Stripe obuna:</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                            <CreditCard className="h-3 w-3 text-emerald-500" />
                            {details.subscription.plan} ({details.subscription.status})
                          </span>
                        </div>
                      )}
                      {profile?.bio && (
                        <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06]">
                          <span className="block text-[11px] text-text-secondary mb-1">
                            Bio matni:
                          </span>
                          <p className="rounded-xl bg-zinc-50 p-2.5 text-xs leading-relaxed dark:bg-white/[0.03]">
                            {profile.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Social Accounts */}
                  {socialAccounts.length > 0 && (
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Ulangan ijtimoiy tarmoqlar ({socialAccounts.length})
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {socialAccounts.map((sa) => (
                          <a
                            key={sa.id}
                            href={sa.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200/80 bg-zinc-50 px-2.5 py-1.5 text-xs font-medium hover:border-emerald-500/40 dark:border-white/[0.08] dark:bg-white/[0.03]"
                          >
                            <span className="capitalize font-bold">
                              {sa.platform}:
                            </span>
                            <span className="text-text-secondary">
                              {sa.username}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Moderation Controls */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Admin boshqaruv tugmalari
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingField === "tier"}
                        onClick={() =>
                          handlePatchUser(
                            {
                              subscriptionTier:
                                details.subscriptionTier === "PRO" ? "FREE" : "PRO",
                            },
                            "tier"
                          )
                        }
                        className="h-8 gap-1.5 rounded-xl text-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                        {details.subscriptionTier === "PRO"
                          ? "FREE ga tushirish"
                          : "PRO berish"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingField === "role"}
                        onClick={() =>
                          handlePatchUser(
                            { role: details.role === "ADMIN" ? "USER" : "ADMIN" },
                            "role"
                          )
                        }
                        className="h-8 gap-1.5 rounded-xl text-xs"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                        {details.role === "ADMIN"
                          ? "USER roliga o'tkazish"
                          : "ADMIN qilish"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingField === "suspend"}
                        onClick={() =>
                          handlePatchUser(
                            { isSuspended: !details.isSuspended },
                            "suspend"
                          )
                        }
                        className="h-8 gap-1.5 rounded-xl text-xs"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        {details.isSuspended ? "Faollashtirish" : "Vaqtincha to'xtatish"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingField === "ban"}
                        onClick={() =>
                          handlePatchUser({ isBanned: !details.isBanned }, "ban")
                        }
                        className="h-8 gap-1.5 rounded-xl border-rose-500/30 text-xs text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        {details.isBanned ? "Ban dan chiqarish" : "Ban qilish"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LINKS */}
              {activeTab === "links" && (
                <div className="space-y-3">
                  {links.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-xs text-text-secondary dark:border-white/10">
                      Foydalanuvchi hali link qo&apos;shmagan
                    </div>
                  ) : (
                    links.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {link.isPinned && (
                              <Pin className="h-3 w-3 text-emerald-500" />
                            )}
                            <span className="truncate text-xs font-bold text-foreground">
                              {link.title}
                            </span>
                            <Badge
                              variant={link.isEnabled ? "success" : "secondary"}
                              className="px-1.5 py-0 text-[9px]"
                            >
                              {link.isEnabled ? "Yoniq" : "O'chiq"}
                            </Badge>
                            {link.collection?.title && (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-[9px]"
                              >
                                {link.collection.title}
                              </Badge>
                            )}
                          </div>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex max-w-full items-center gap-1 truncate font-mono text-[11px] text-text-secondary hover:text-emerald-500"
                          >
                            <span className="truncate">{link.url}</span>
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 font-mono text-[11px] font-bold dark:bg-white/[0.06]">
                            <MousePointerClick className="h-3 w-3 text-emerald-500" />
                            {link.clicksCount ?? 0}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: MUSIC & MEDIA */}
              {activeTab === "music" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                        <Music className="h-4 w-4 text-emerald-500" />
                        <span>Profil musiqasi (Spotify / Audio)</span>
                      </h3>
                      <Badge
                        variant={
                          theme?.spotifyMusicEnabled ? "success" : "secondary"
                        }
                      >
                        {theme?.spotifyMusicEnabled ? "Yoqilgan" : "O'chirilgan"}
                      </Badge>
                    </div>

                    {theme?.spotifyTrackTitle || theme?.spotifyTrackUrl ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                          {theme.spotifyTrackImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={theme.spotifyTrackImage}
                              alt={theme.spotifyTrackTitle || "Track cover"}
                              className="h-14 w-14 shrink-0 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                              <Music className="h-6 w-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-foreground">
                              {theme.spotifyTrackTitle || "Nomsiz trek"}
                            </p>
                            <p className="truncate text-xs text-text-secondary">
                              {theme.spotifyTrackArtist || "Noma'lum ijrochi"}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-text-secondary">
                              <span>
                                Ko&apos;rinish:{" "}
                                <strong className="text-foreground">
                                  {theme.spotifyMusicLayout || "floating"}
                                </strong>
                              </span>
                              <span>&middot;</span>
                              <span>
                                Autoplay:{" "}
                                <strong className="text-foreground">
                                  {theme.spotifyMusicAutoplay ? "Ha" : "Yo'q"}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {theme.spotifyTrackUrl && (
                          <a
                            href={theme.spotifyTrackUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                          >
                            <span>Trek havolasini ochish</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {theme.spotifyTrackPreview && (
                          <div className="pt-2">
                            <p className="mb-1.5 text-[11px] font-medium text-text-secondary">
                              Audio parcha (Preview):
                            </p>
                            <audio
                              controls
                              src={theme.spotifyTrackPreview}
                              className="h-9 w-full"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-text-secondary">
                        Foydalanuvchi profiliga musiqa biriktirmagan.
                      </p>
                    )}
                  </div>

                  {/* Background Visual Media */}
                  <div className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                      <ImageIcon className="h-4 w-4 text-cyan-500" />
                      <span>Orqa fon media fayllari</span>
                    </h3>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Fon turi:</span>
                        <span className="font-semibold uppercase">
                          {theme?.backgroundType || "color"}
                        </span>
                      </div>
                      {theme?.backgroundImage && (
                        <div className="pt-2">
                          <p className="mb-1 text-[11px] text-text-secondary">
                            Yuklangan orqa fon rasmi:
                          </p>
                          <a
                            href={theme.backgroundImage}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-xl border border-zinc-200/80 dark:border-white/10"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={theme.backgroundImage}
                              alt="Background wallpaper"
                              className="max-h-40 w-full object-cover"
                            />
                          </a>
                        </div>
                      )}
                      {theme?.backgroundVideo && (
                        <div className="pt-2">
                          <p className="mb-1 flex items-center gap-1 text-[11px] text-text-secondary">
                            <Video className="h-3.5 w-3.5 text-emerald-500" />
                            <span>Orqa fon videosi:</span>
                          </p>
                          <video
                            src={theme.backgroundVideo}
                            controls
                            muted
                            className="max-h-44 w-full rounded-xl border border-zinc-200/80 bg-black dark:border-white/10"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: DOMAINS */}
              {activeTab === "domains" && (
                <div className="space-y-3">
                  {domains.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-10 text-center text-xs text-text-secondary dark:border-white/10">
                      Ulangan shaxsiy domenlar yo&apos;q
                    </div>
                  ) : (
                    domains.map((dom) => (
                      <div
                        key={dom.id}
                        className="rounded-2xl border border-zinc-200/80 bg-card p-4 dark:border-white/[0.08]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-emerald-500" />
                            <span className="font-mono text-xs font-bold text-foreground">
                              {dom.domain}
                            </span>
                            {dom.isApex && (
                              <Badge variant="outline" className="text-[9px]">
                                APEX
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant={
                                dom.status === "ACTIVE"
                                  ? "success"
                                  : dom.status === "FAILED" ||
                                      dom.status === "SUSPENDED"
                                    ? "destructive"
                                    : "warning"
                              }
                            >
                              {dom.status}
                            </Badge>
                            <Badge variant="outline">SSL: {dom.sslStatus}</Badge>
                          </div>
                        </div>
                        {dom.errorMessage && (
                          <p className="mt-2 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                            {dom.errorMessage}
                          </p>
                        )}
                        <p className="mt-2 font-mono text-[10px] text-text-secondary">
                          Qo&apos;shilgan:{" "}
                          {new Date(dom.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: ORDERS & STORE */}
              {activeTab === "orders" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <p className="text-[10px] font-bold uppercase text-text-secondary">
                        Mahsulotlar
                      </p>
                      <p className="mt-1 font-heading text-lg font-extrabold">
                        {products.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <p className="text-[10px] font-bold uppercase text-text-secondary">
                        Buyurtmalar
                      </p>
                      <p className="mt-1 font-heading text-lg font-extrabold">
                        {orders.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]">
                      <p className="text-[10px] font-bold uppercase text-text-secondary">
                        Savdo tushumi
                      </p>
                      <p className="mt-1 font-heading text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                        ${totalOrderRevenue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-text-secondary dark:border-white/10">
                      Hozircha buyurtmalar yo&apos;q
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-card p-3.5 dark:border-white/[0.08]"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-bold text-foreground">
                                {order.product?.title || "Mahsulot"}
                              </span>
                              <Badge
                                variant={
                                  order.status === "COMPLETED"
                                    ? "success"
                                    : order.status === "FAILED" ||
                                        order.status === "REFUNDED"
                                      ? "destructive"
                                      : "warning"
                                }
                                className="px-1.5 py-0 text-[9px]"
                              >
                                {order.status}
                              </Badge>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-text-secondary">
                              {order.customerName || order.customerEmail} &middot;{" "}
                              <span className="font-mono">
                                {order.orderNumber || order.id.slice(0, 8)}
                              </span>
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-mono text-xs font-bold text-foreground">
                              {order.amount} {order.currency}
                            </p>
                            <p className="font-mono text-[10px] text-text-secondary">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: ACTIVITY LOGS */}
              {activeTab === "activity" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Foydalanuvchi faoliyati ({activityLogs.length})
                    </h3>
                    {activityLogs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-text-secondary dark:border-white/10">
                        ActivityLog yozuvlari hali yo&apos;q
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activityLogs.map((log) => (
                          <div
                            key={log.id}
                            className="rounded-2xl border border-zinc-200/80 bg-card p-3 dark:border-white/[0.08]"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px]"
                              >
                                {log.action}
                              </Badge>
                              <span className="font-mono text-[10px] text-text-secondary">
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {(log.resource || log.details) && (
                              <p className="mt-1.5 text-[11px] text-text-secondary break-all">
                                {log.resource ? `[${log.resource}] ` : ""}
                                {log.details || ""}
                              </p>
                            )}
                            {log.ipAddress && (
                              <p className="mt-1 font-mono text-[10px] text-text-secondary/75">
                                IP: {log.ipAddress}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {adminAuditLogs.length > 0 && (
                    <div>
                      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Admin harakatlari tarixi ({adminAuditLogs.length})
                      </h3>
                      <div className="space-y-2">
                        {adminAuditLogs.map((audit) => (
                          <div
                            key={audit.id}
                            className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge
                                variant="secondary"
                                className="font-mono text-[10px]"
                              >
                                {audit.action}
                              </Badge>
                              <span className="font-mono text-[10px] text-text-secondary">
                                {new Date(audit.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-text-secondary">
                              Admin:{" "}
                              <span className="font-semibold text-foreground">
                                {audit.adminEmail}
                              </span>
                            </p>
                            {audit.details && (
                              <p className="mt-1 font-mono text-[10px] text-text-secondary break-all">
                                {audit.details}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

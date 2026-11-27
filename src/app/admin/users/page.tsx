"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { UserDetailsDrawer } from "@/components/admin/user-details-drawer";
import {
  Users,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Loader2,
  ChevronDown,
  Sparkles,
  Zap,
  ZapOff,
  ShieldCheck,
  Eye,
  PanelRightOpen,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { isPremiumTier } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
  role: string;
  subscriptionTier: string;
  isSuspended: boolean;
  isBanned: boolean;
  createdAt: string;
  profile?: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl?: string | null;
    verified: boolean;
    isPublished: boolean;
    _count: {
      links: number;
      analyticsEvents: number;
      customDomains?: number;
      orders?: number;
    };
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected user for User Details Drawer
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // Delete modal
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (tierFilter) params.append("tier", tierFilter);
      if (verifiedFilter) params.append("verified", verifiedFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users || []);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, tierFilter, verifiedFilter]);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, tierFilter, verifiedFilter, fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateStatus = async (
    userId: string,
    updates: {
      isSuspended?: boolean;
      isBanned?: boolean;
      role?: string;
      subscriptionTier?: string;
      verified?: boolean;
    }
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user status");

      if (json.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? json.user : u))
        );
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  ...updates,
                  profile: u.profile
                    ? {
                        ...u.profile,
                        ...(updates.verified !== undefined
                          ? { verified: updates.verified }
                          : {}),
                      }
                    : u.profile,
                }
              : u
          )
        );
      }

      if (updates.verified !== undefined) {
        toast.success(
          updates.verified
            ? "Ko'k galochka (Verified) berildi!"
            : "Verified belgisi olib tashlandi"
        );
      } else {
        toast.success("User record updated successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const handleQuickImpersonate = async (userId: string, label: string) => {
    try {
      setImpersonatingId(userId);
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Impersonate boshlanmadi");

      toast.success(`${label} sifatida kirilmoqda...`);
      window.location.href = data.redirectUrl || "/dashboard";
    } catch (err: any) {
      toast.error(err.message || "Foydalanuvchi sifatida kirib bo'lmadi");
      setImpersonatingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");

      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
      if (selectedUserId === deleteUserId) setSelectedUserId(null);
      toast.success("User permanently deleted");
      setDeleteUserId(null);
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectClasses =
    "h-10 w-full appearance-none rounded-xl border border-zinc-200/90 bg-white/80 pl-8 pr-8 text-xs font-semibold text-foreground shadow-xs backdrop-blur-sm transition-colors hover:border-zinc-300 focus-visible:border-emerald-500/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:hover:border-white/20";

  return (
    <div>
      <AdminHeader
        title="User & Account Management"
        description="Search, verify creators, inspect full user activity, impersonate or moderate accounts."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* Quick User & Subscription Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 rounded-2xl flex items-center justify-between border-border/80">
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Total Users
              </p>
              <p className="text-2xl font-black text-foreground mt-1">
                {users.length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 rounded-2xl flex items-center justify-between border-border/80">
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                PRO Creators
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {users.filter((u) => u.subscriptionTier === "PRO").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </Card>

          <Card className="p-4 rounded-2xl flex items-center justify-between border-border/80">
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Verified
              </p>
              <p className="text-2xl font-black text-sky-500 mt-1">
                {users.filter((u) => isPremiumTier(u.subscriptionTier) && u.profile?.verified).length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <VerifiedBadge size="md" />
            </div>
          </Card>

          <Card className="p-4 rounded-2xl flex items-center justify-between border-border/80">
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Admins
              </p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* Search & filter bar */}
        <Card className="p-3 sm:p-4">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 lg:flex-row lg:items-center"
          >
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Search by email, name, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-32 sm:flex-none">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <select
                  aria-label="Filter by role"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
              </div>

              <div className="relative flex-1 sm:w-32 sm:flex-none">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <select
                  aria-label="Filter by subscription tier"
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All Tiers</option>
                  <option value="FREE">FREE</option>
                  <option value="PRO">PRO</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
              </div>

              <div className="relative flex-1 sm:w-36 sm:flex-none">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <select
                  aria-label="Filter by verified status"
                  value={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">All Verified</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
              </div>

              <Button type="submit" className="h-10 rounded-xl px-5 text-xs">
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Users table */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Creator directory
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  Qatorni bosing — foydalanuvchi linklari, domenlari, musiqasi va tarixini batafsil ko&apos;ring
                </p>
              </div>
            </div>
            {!loading && (
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {users.length} {users.length === 1 ? "user" : "users"}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading creator directory…
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <Users className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No matching users found
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                Try a different search query or clear the role and tier filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "User",
                      "Handle",
                      "Role / Plan",
                      "Status",
                      "Stats",
                      "Joined",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary ${
                          index === 6 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {users.map((u) => {
                    const profile = u.profile;
                    const displayName = profile?.displayName || u.name || "Anonymous";
                    const avatarSrc = profile?.avatarUrl || u.avatar || null;
                    const isPremium = isPremiumTier(u.subscriptionTier);
                    const isVerified = Boolean(profile?.verified && isPremium);
                    return (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className="group cursor-pointer transition-colors hover:bg-emerald-500/[0.04] dark:hover:bg-white/[0.03]"
                      >
                        {/* User identity */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400/90 via-teal-400/90 to-cyan-400/90 text-[10px] font-extrabold uppercase text-emerald-950 ring-1 ring-emerald-500/20">
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
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-bold text-foreground">
                                  {displayName}
                                </span>
                                {isVerified && <VerifiedBadge size="xs" />}
                              </div>
                              <div className="truncate text-[10.5px] text-text-secondary">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Profile username */}
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {profile ? (
                            <a
                              href={`/${profile.username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 transition-colors hover:text-emerald-600 hover:underline dark:text-emerald-300"
                            >
                              <span>/{profile.username}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-[11px] italic text-text-secondary">
                              No profile
                            </span>
                          )}
                        </td>

                        {/* Role & subscription */}
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-col gap-1.5 min-w-[130px]">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={u.subscriptionTier}
                                onChange={(e) =>
                                  handleUpdateStatus(u.id, {
                                    subscriptionTier: e.target.value,
                                  })
                                }
                                aria-label="Quick change subscription tier"
                                className={`h-6 rounded-lg px-2 text-[10px] font-bold border transition-colors cursor-pointer shadow-xs ${
                                  u.subscriptionTier === "PRO"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                }`}
                              >
                                <option value="FREE">Plan: FREE</option>
                                <option value="PRO">Plan: PRO ⭐</option>
                              </select>

                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleUpdateStatus(u.id, {
                                    role: e.target.value,
                                  })
                                }
                                aria-label="Quick change user role"
                                className={`h-6 rounded-lg px-2 text-[10px] font-bold border transition-colors cursor-pointer shadow-xs ${
                                  u.role === "ADMIN" || u.role === "SUPER_ADMIN"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700"
                                }`}
                              >
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN 🛡️</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              </select>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1">
                            {u.isBanned ? (
                              <Badge variant="destructive">BANNED</Badge>
                            ) : u.isSuspended ? (
                              <Badge variant="warning">SUSPENDED</Badge>
                            ) : (
                              <Badge variant="success">ACTIVE</Badge>
                            )}
                          </div>
                        </td>

                        {/* Profile stats */}
                        <td className="px-4 py-3.5">
                          {profile ? (
                            <span className="text-[11px] tabular-nums text-text-secondary">
                              <span className="font-semibold text-foreground">
                                {profile._count.links}
                              </span>{" "}
                              links
                              <span
                                aria-hidden="true"
                                className="mx-1 text-zinc-300 dark:text-zinc-600"
                              >
                                &middot;
                              </span>
                              <span className="font-semibold text-foreground">
                                {profile._count.analyticsEvents}
                              </span>{" "}
                              views
                            </span>
                          ) : (
                            <span className="text-text-secondary">&mdash;</span>
                          )}
                        </td>

                        {/* Joined */}
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] text-text-secondary">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-4 py-3.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {/* BATAFSIL DRAWER BUTTON */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUserId(u.id)}
                              className="h-7 rounded-lg px-2 text-[10.5px] font-semibold"
                              title="Batafsil profilni ochish"
                            >
                              <PanelRightOpen className="mr-1 h-3 w-3 text-emerald-500" />
                              <span>Batafsil</span>
                            </Button>

                            {/* 1-CLICK VERIFIED TOGGLE (PRO ONLY) */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!isPremium) {
                                  toast.error(
                                    "Ko'k galochka (Verified) faqat Premium (PRO) obuna olgan foydalanuvchilarga beriladi. Avval PRO bering!"
                                  );
                                  return;
                                }
                                handleUpdateStatus(u.id, {
                                  verified: !isVerified,
                                });
                              }}
                              className={`h-7 rounded-lg px-2 text-[10.5px] font-bold ${
                                !isPremium
                                  ? "border-zinc-200 text-text-secondary opacity-65 hover:border-amber-500/40 dark:border-white/10"
                                  : isVerified
                                    ? "border-sky-500/40 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 dark:text-sky-300"
                                    : "hover:border-sky-500/40 hover:text-sky-600"
                              }`}
                              title={
                                !isPremium
                                  ? "Faqat Premium (PRO) obuna olganlarga beriladi"
                                  : isVerified
                                    ? "Ko'k galochkani olib tashlash"
                                    : "Ko'k galochka (Verified) berish"
                              }
                            >
                              {!isPremium ? (
                                <Lock className="mr-1 h-3 w-3 text-amber-500" />
                              ) : (
                                <VerifiedBadge size="xs" className="mr-1" />
                              )}
                              <span>
                                {!isPremium
                                  ? "PRO kerak"
                                  : isVerified
                                    ? "Verified"
                                    : "Verify"}
                              </span>
                            </Button>

                            {/* IMPERSONATE BUTTON */}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={impersonatingId === u.id}
                              onClick={() =>
                                handleQuickImpersonate(
                                  u.id,
                                  profile?.username ? `@${profile.username}` : u.email
                                )
                              }
                              className="h-7 rounded-lg border-amber-500/30 px-2 text-[10.5px] font-semibold text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                              title="Foydalanuvchi sifatida ko'rish (Impersonate)"
                            >
                              {impersonatingId === u.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>

                            {/* 1-CLICK GRANT / REVOKE PRO */}
                            {u.subscriptionTier === "PRO" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(u.id, {
                                    subscriptionTier: "FREE",
                                  })
                                }
                                className="h-7 rounded-lg border-amber-500/30 px-2 text-[10.5px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                                title="Revoke PRO status (Downgrade to FREE)"
                              >
                                <ZapOff className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(u.id, {
                                    subscriptionTier: "PRO",
                                  })
                                }
                                className="h-7 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black px-2 text-[10.5px] font-bold hover:brightness-105 shadow-xs"
                                title="Grant PRO access instantly"
                              >
                                <Sparkles className="h-3 w-3 fill-current" />
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(u.id, {
                                  isSuspended: !u.isSuspended,
                                })
                              }
                              className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                                u.isSuspended
                                  ? "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                  : ""
                              }`}
                            >
                              {u.isSuspended ? "Reactivate" : "Suspend"}
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(u.id, {
                                  isBanned: !u.isBanned,
                                })
                              }
                              className={`h-7 rounded-lg px-2 text-[10.5px] font-semibold ${
                                u.isBanned
                                  ? "border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                                  : "border-rose-500/30 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                              }`}
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Delete ${displayName}`}
                              onClick={() => setDeleteUserId(u.id)}
                              className="h-7 w-7 rounded-lg text-text-secondary hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* User Details Slide-Over Drawer */}
      <UserDetailsDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUserUpdated={(updatedUser) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          );
        }}
      />

      {/* Delete user confirmation */}
      <ConfirmModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDeleteUser}
        isLoading={isDeleting}
        title="Delete User Account"
        description="Are you sure you want to completely purge this user, their profile, links, and all recorded analytics? This action cannot be undone."
        confirmText="Permanently Delete User"
      />
    </div>
  );
}

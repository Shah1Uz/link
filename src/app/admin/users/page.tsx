"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import {
  Users,
  Search,
  Filter,
  Shield,
  Ban,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscriptionTier: string;
  isSuspended: boolean;
  isBanned: boolean;
  createdAt: string;
  profile?: {
    id: string;
    username: string;
    displayName: string | null;
    verified: boolean;
    isPublished: boolean;
    _count: {
      links: number;
      analyticsEvents: number;
    };
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [loading, setLoading] = useState(true);

  // Delete modal
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (tierFilter) params.append("tier", tierFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setUsers(json.users);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleUpdateStatus = async (
    userId: string,
    updates: { isSuspended?: boolean; isBanned?: boolean; role?: string; subscriptionTier?: string }
  ) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user status");

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
      toast.success("User record updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
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
      toast.success("User permanently deleted");
      setDeleteUserId(null);
    } catch (err: any) {
      toast.error(err.message || "Error deleting user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminHeader
        title="User & Account Management"
        description="Search, filter, view stats, modify roles, or suspend/ban accounts."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* Search & Filter Bar */}
        <Card className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by email, name, or username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="">All Roles</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="">All Tiers</option>
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
              </select>

              <Button type="submit" size="sm" className="rounded-xl text-xs">
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Users Table Card */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              No matching users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Handle</th>
                    <th className="py-3.5 px-4">Role / Plan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Stats</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {users.map((u) => {
                    const profile = u.profile;
                    return (
                      <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                        {/* User Identity */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-900 dark:text-white">
                            {u.name || "Anonymous"}
                          </div>
                          <div className="text-zinc-400 text-[11px]">{u.email}</div>
                        </td>

                        {/* Profile Username */}
                        <td className="py-3.5 px-4">
                          {profile ? (
                            <a
                              href={`/${profile.username}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>/{profile.username}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic">No profile</span>
                          )}
                        </td>

                        {/* Role & Subscription Tier */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Badge variant={u.role === "ADMIN" ? "destructive" : "secondary"}>
                              {u.role}
                            </Badge>
                            <Badge variant={u.subscriptionTier === "PRO" ? "pro" : "outline"}>
                              {u.subscriptionTier}
                            </Badge>
                          </div>
                        </td>

                        {/* Status (Active / Suspended / Banned) */}
                        <td className="py-3.5 px-4">
                          {u.isBanned ? (
                            <Badge variant="destructive">BANNED</Badge>
                          ) : u.isSuspended ? (
                            <Badge variant="warning">SUSPENDED</Badge>
                          ) : (
                            <Badge variant="success">ACTIVE</Badge>
                          )}
                        </td>

                        {/* Profile stats */}
                        <td className="py-3.5 px-4 text-zinc-500">
                          {profile ? (
                            <span>
                              {profile._count.links} links &bull; {profile._count.analyticsEvents} views
                            </span>
                          ) : (
                            <span>&mdash;</span>
                          )}
                        </td>

                        {/* Join Date */}
                        <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Suspend */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(u.id, { isSuspended: !u.isSuspended })}
                              className="h-7 px-2 text-[11px]"
                            >
                              {u.isSuspended ? "Reactivate" : "Suspend"}
                            </Button>

                            {/* Toggle Ban */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(u.id, { isBanned: !u.isBanned })}
                              className={`h-7 px-2 text-[11px] ${u.isBanned ? "text-emerald-600" : "text-amber-600"}`}
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </Button>

                            {/* Delete User */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteUserId(u.id)}
                              className="h-7 w-7 text-zinc-400 hover:text-red-500"
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

      {/* Delete User Confirm Modal */}
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


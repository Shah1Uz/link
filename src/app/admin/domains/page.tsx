"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  ExternalLink,
  Clock,
  Loader2,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { toast } from "sonner";

interface AdminDomain {
  id: string;
  domain: string;
  status: "PENDING" | "VERIFYING" | "VERIFIED" | "PROVISIONING_SSL" | "ACTIVE" | "FAILED" | "SUSPENDED";
  sslStatus: "PENDING" | "ISSUING" | "ACTIVE" | "FAILED";
  isApex: boolean;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  profile: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    user: {
      id: string;
      email: string;
      subscriptionTier: string;
    };
  };
}

const domainStatusVariant = (status: AdminDomain["status"]): BadgeProps["variant"] => {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "FAILED":
    case "SUSPENDED":
      return "destructive";
    case "PENDING":
    case "VERIFYING":
      return "warning";
    case "PROVISIONING_SSL":
      return "verified";
    case "VERIFIED":
      return "verified";
    default:
      return "outline";
  }
};

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    failed: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Action Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<AdminDomain | null>(null);
  const [actionType, setActionType] = useState<"SUSPEND" | "UNSUSPEND" | "FORCE_VERIFY" | "DELETE">("SUSPEND");
  const [actionReason, setActionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/domains?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setDomains(data.domains || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [statusFilter, search]);

  const handleActionSubmit = async () => {
    if (!selectedDomain) return;
    try {
      setProcessing(true);
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: selectedDomain.id,
          action: actionType,
          reason: actionReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      toast.success(`Domain ${actionType.toLowerCase()} successful`);
      setActionModalOpen(false);
      setSelectedDomain(null);
      loadDomains();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const openAction = (domain: AdminDomain, type: typeof actionType) => {
    setSelectedDomain(domain);
    setActionType(type);
    setActionReason("");
    setActionModalOpen(true);
  };

  const metricTiles = [
    {
      label: "Total domains",
      value: metrics.total,
      icon: Globe,
      tone: "border-zinc-200/80 bg-white/70 text-foreground dark:border-white/[0.08] dark:bg-white/[0.03]",
      iconTone: "border-zinc-300/50 bg-zinc-100 text-zinc-500 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300",
      labelTone: "text-text-secondary",
    },
    {
      label: "Active & live",
      value: metrics.active,
      icon: CheckCircle2,
      tone: "border-emerald-500/20 bg-emerald-500/[0.05] text-foreground",
      iconTone: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      labelTone: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Pending / verifying",
      value: metrics.pending,
      icon: Clock,
      tone: "border-amber-500/20 bg-amber-500/[0.05] text-foreground",
      iconTone: "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      labelTone: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "DNS failed",
      value: metrics.failed,
      icon: AlertCircle,
      tone: "border-rose-500/20 bg-rose-500/[0.05] text-foreground",
      iconTone: "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      labelTone: "text-rose-700 dark:text-rose-300",
    },
    {
      label: "Suspended",
      value: metrics.suspended,
      icon: ShieldAlert,
      tone: "border-violet-500/20 bg-violet-500/[0.05] text-foreground",
      iconTone: "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
      labelTone: "text-violet-700 dark:text-violet-300",
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Custom Domain Operations"
        description="Audit connected custom domains, inspect DNS verification status, troubleshoot errors, and disable abusive domains."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* KPI metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {metricTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.label}
                className={`card-lift rounded-2xl border p-4 shadow-xs backdrop-blur-sm ${tile.tone}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-[9.5px] font-bold uppercase leading-tight tracking-[0.12em] ${tile.labelTone}`}
                  >
                    {tile.label}
                  </p>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${tile.iconTone}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-2 font-heading text-2xl font-extrabold leading-none tracking-[-0.04em] text-foreground">
                  {tile.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="group"
              aria-label="Filter domains by status"
              className="scrollbar-none -mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5"
            >
              {["ALL", "ACTIVE", "PENDING", "FAILED", "SUSPENDED"].map((st) => {
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    aria-pressed={active}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.08em] transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_8px_20px_-10px_rgba(16,185,129,0.8)]"
                        : "text-text-secondary hover:bg-zinc-900/[0.05] hover:text-foreground dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>

            <div className="w-full lg:max-w-xs">
              <Input
                placeholder="Search domain or creator..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </Card>

        {/* Domain table */}
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <Globe className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Connected domains
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  DNS verification, SSL provisioning and abuse controls
                </p>
              </div>
            </div>
            {!loading && (
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {domains.length} {domains.length === 1 ? "domain" : "domains"}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading domain operations…
              </p>
            </div>
          ) : domains.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <Globe className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No custom domains found
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                No domains match the current status filter or search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Domain",
                      "Creator / Profile",
                      "Status",
                      "SSL",
                      "Retries",
                      "Created",
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
                  {domains.map((d) => (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="max-w-[16rem] px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-mono text-[11px] font-bold text-foreground">
                            {d.domain}
                          </span>
                          {d.status === "ACTIVE" && (
                            <a
                              href={`https://${d.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Open ${d.domain}`}
                              className="shrink-0 text-text-secondary transition-colors hover:text-emerald-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {d.errorMessage && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-rose-600 dark:text-rose-400">
                            {d.errorMessage}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[14rem] px-4 py-3.5">
                        <div className="truncate text-[11px] font-semibold text-foreground">
                          @{d.profile.username}
                        </div>
                        <div className="truncate text-[10.5px] text-text-secondary">
                          {d.profile.user.email}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge variant={domainStatusVariant(d.status)}>
                          {d.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10.5px] font-semibold ${
                            d.sslStatus === "ACTIVE"
                              ? "text-emerald-700 dark:text-emerald-300"
                              : d.sslStatus === "FAILED"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-700 dark:text-amber-300"
                          }`}
                        >
                          <ShieldCheck className="h-3 w-3" />
                          {d.sslStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[10.5px] tabular-nums text-text-secondary">
                        {d.retryCount}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] text-text-secondary">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {d.status !== "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAction(d, "FORCE_VERIFY")}
                              className="h-7 rounded-lg border-violet-500/30 px-2 text-[10.5px] font-semibold text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
                            >
                              Force Verify
                            </Button>
                          )}

                          {d.status === "SUSPENDED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAction(d, "UNSUSPEND")}
                              className="h-7 rounded-lg border-emerald-500/30 px-2 text-[10.5px] font-semibold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                            >
                              Unsuspend
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openAction(d, "SUSPEND")}
                              className="h-7 rounded-lg px-2 text-[10.5px] font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                            >
                              Suspend
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${d.domain}`}
                            onClick={() => openAction(d, "DELETE")}
                            className="h-7 w-7 rounded-lg text-text-secondary hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
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
        </Card>
      </div>

      {/* Administrative action modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Admin Action: ${actionType}`}
        description="This action is recorded in the immutable admin audit log."
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary">
              Target domain
            </span>
            <span className="truncate font-mono text-[11px] font-bold text-foreground">
              {selectedDomain?.domain}
            </span>
          </div>

          {actionType === "SUSPEND" && (
            <div className="space-y-1.5">
              <Label htmlFor="suspension-reason">Suspension Reason *</Label>
              <Input
                id="suspension-reason"
                placeholder="e.g. Phishing report, copyright infringement, abuse"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={
                actionType === "SUSPEND" || actionType === "DELETE"
                  ? "destructive"
                  : "default"
              }
              disabled={processing}
              isLoading={processing}
              onClick={handleActionSubmit}
            >
              {`Confirm ${actionType}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

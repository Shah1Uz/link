"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  CheckCircle2,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface ReportItem {
  id: string;
  reason: string;
  details: string | null;
  reporterEmail: string | null;
  status: string;
  resolvedBy: string | null;
  createdAt: string;
  profile?: { id: string; username: string; displayName: string | null } | null;
  link?: { id: string; title: string; url: string } | null;
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation");
      if (res.ok) {
        const json = await res.json();
        setReports(json.reports);
      }
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateReport = async (reportId: string, status: "RESOLVED" | "DISMISSED") => {
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      toast.success(`Report marked as ${status.toLowerCase()}`);
    } catch {
      toast.error("Error updating report");
    }
  };

  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div>
      <AdminHeader
        title="Content Moderation & Reports"
        description="Review community reports, take action on suspicious URLs, and preserve platform safety."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* Safety banner */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-teal-500/[0.04] to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.1] text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Trust &amp; safety queue
                </h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-text-secondary">
                  Every report is reviewed by an administrator and recorded in the
                  audit trail. Resolve violations or dismiss false positives.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={pendingCount > 0 ? "warning" : "success"}>
                {pendingCount > 0
                  ? `${pendingCount} pending review`
                  : "Queue clear"}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/20 bg-gradient-to-b from-rose-500/15 to-rose-500/[0.03] text-rose-600 dark:text-rose-400">
                <Flag className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Reported content
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  Profiles and links flagged by users or filters
                </p>
              </div>
            </div>
            {!loading && (
              <Badge variant="secondary" className="shrink-0 tabular-nums">
                {reports.length} {reports.length === 1 ? "report" : "reports"}
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
              <p className="text-xs font-medium text-text-secondary">
                Loading moderation queue…
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                Moderation queue is clean
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                No pending content violation reports from users or automated
                filters. Great job keeping the platform safe.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Reason / Issue",
                      "Reported Target",
                      "Reporter",
                      "Status",
                      "Timestamp",
                      "Actions",
                    ].map((heading, index) => (
                      <th
                        key={heading}
                        className={`whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary ${
                          index === 5 ? "text-right" : ""
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.05]">
                  {reports.map((r) => (
                    <tr
                      key={r.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="max-w-[16rem] px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <Flag className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                          <span className="truncate">{r.reason}</span>
                        </div>
                        {r.details && (
                          <p className="mt-0.5 line-clamp-1 text-[10.5px] text-text-secondary">
                            {r.details}
                          </p>
                        )}
                      </td>

                      <td className="max-w-[18rem] px-4 py-3.5">
                        {r.profile && (
                          <a
                            href={`/${r.profile.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                          >
                            <span>/{r.profile.username}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {r.link && (
                          <div className="mt-0.5 line-clamp-1 text-[10.5px] text-text-secondary">
                            Link:{" "}
                            <span className="font-semibold text-foreground">
                              {r.link.title}
                            </span>{" "}
                            <span className="font-mono">({r.link.url})</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-text-secondary">
                        {r.reporterEmail || "Anonymous"}
                      </td>

                      <td className="px-4 py-3.5">
                        <Badge
                          variant={
                            r.status === "PENDING"
                              ? "warning"
                              : r.status === "RESOLVED"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[10.5px] text-text-secondary">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "PENDING" ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateReport(r.id, "RESOLVED")}
                                className="h-7 rounded-lg border-emerald-500/30 px-2 text-[10.5px] font-semibold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
                              >
                                Resolve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateReport(r.id, "DISMISSED")}
                                className="h-7 rounded-lg px-2 text-[10.5px] font-semibold text-text-secondary"
                              >
                                Dismiss
                              </Button>
                            </>
                          ) : (
                            <span className="text-[10.5px] italic text-text-secondary">
                              {r.resolvedBy ? `by ${r.resolvedBy}` : "—"}
                            </span>
                          )}
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
    </div>
  );
}

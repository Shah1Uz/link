"use client";

import React, { useState, useEffect } from "react";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Trash2,
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

  return (
    <div>
      <AdminHeader
        title="Content Moderation & Reports"
        description="Review community reports, take action on suspicious URLs, and preserve platform safety."
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-6xl">
        <Card className="overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-zinc-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                Moderation queue is clean!
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                No pending content violation reports from users or automated filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">Reason / Issue</th>
                    <th className="py-3.5 px-4">Reported Target</th>
                    <th className="py-3.5 px-4">Reporter</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Flag className="h-3.5 w-3.5 text-red-500" />
                          <span>{r.reason}</span>
                        </div>
                        {r.details && (
                          <div className="text-[11px] text-zinc-500 max-w-xs truncate mt-0.5">
                            {r.details}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {r.profile && (
                          <div className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            Profile: /{r.profile.username}
                          </div>
                        )}
                        {r.link && (
                          <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
                            Link: <span className="font-bold">{r.link.title}</span> ({r.link.url})
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-500">
                        {r.reporterEmail || "Anonymous"}
                      </td>

                      <td className="py-3.5 px-4">
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

                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "PENDING" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateReport(r.id, "RESOLVED")}
                                className="h-7 px-2 text-[11px] text-emerald-600"
                              >
                                Resolve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateReport(r.id, "DISMISSED")}
                                className="h-7 px-2 text-[11px] text-zinc-400"
                              >
                                Dismiss
                              </Button>
                            </>
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


import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, ShieldCheck, Clock, Fingerprint } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.adminAuditLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminHeader
        title="Immutable Admin Audit Logs"
        description="Tamper-evident record of administrative modifications, role changes, moderation actions, and setting updates."
      />

      <div className="mx-auto max-w-6xl space-y-5 p-6 sm:space-y-6 sm:p-8">
        {/* Integrity banner */}
        <div className="relative isolate overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.08] via-teal-500/[0.04] to-transparent p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.1] text-emerald-600 dark:text-emerald-300">
                <Fingerprint className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Append-only audit trail
                </h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-text-secondary">
                  Every privileged action is recorded with the acting admin,
                  target resource and timestamp. Entries cannot be edited or
                  deleted from the console.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge variant="success" className="gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                Integrity verified
              </Badge>
              <Badge variant="secondary" className="tabular-nums">
                {logs.length} entries
              </Badge>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 px-5 py-4 dark:border-white/[0.08] sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.03] text-emerald-600 dark:text-emerald-400">
                <History className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-heading text-sm font-bold tracking-[-0.01em] text-foreground">
                  Latest administrative actions
                </h2>
                <p className="truncate text-[11px] text-text-secondary">
                  Most recent 50 events, newest first
                </p>
              </div>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200/80 bg-zinc-50 text-zinc-400 dark:border-white/[0.08] dark:bg-white/[0.03]">
                <Clock className="h-5 w-5" />
              </span>
              <p className="font-heading text-sm font-bold text-foreground">
                No audit entries yet
              </p>
              <p className="max-w-sm text-xs leading-relaxed text-text-secondary">
                Administrative actions will appear here automatically once an
                admin makes a change.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200/80 bg-surface/60 dark:border-white/[0.08] dark:bg-white/[0.02]">
                    {[
                      "Action",
                      "Admin Email",
                      "Target Resource",
                      "Target ID",
                      "Details / Metadata",
                      "Timestamp",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="whitespace-nowrap px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono text-[10.5px] dark:divide-white/[0.05]">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-emerald-500/[0.03] dark:hover:bg-white/[0.025]"
                    >
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge
                          variant="outline"
                          className="px-2 py-0.5 font-mono text-[9.5px] font-semibold"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="max-w-[12rem] px-4 py-3">
                        <span className="block truncate font-sans text-[11px] font-semibold text-foreground">
                          {log.adminEmail}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-700 dark:text-emerald-300">
                        {log.targetResource}
                      </td>
                      <td className="max-w-[8rem] px-4 py-3 text-text-secondary">
                        <span className="block truncate">{log.targetId || "—"}</span>
                      </td>
                      <td className="max-w-[18rem] px-4 py-3 font-sans text-[10.5px] text-text-secondary">
                        <span className="block truncate">{log.details || "—"}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-sans text-[10.5px] text-text-secondary">
                        {new Date(log.createdAt).toLocaleString()}
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

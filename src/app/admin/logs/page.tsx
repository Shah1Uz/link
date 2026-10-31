import React from "react";
import { prisma } from "@/lib/prisma";
import { AdminHeader } from "@/components/layout/admin-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Shield, Clock } from "lucide-react";

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

      <div className="p-6 sm:p-8 space-y-6 max-w-6xl">
        <Card className="overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-500">
              No administrative audit entries logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Admin Email</th>
                    <th className="py-3.5 px-4">Target Resource</th>
                    <th className="py-3.5 px-4">Target ID</th>
                    <th className="py-3.5 px-4">Details / Metadata</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                      <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-medium text-zinc-700 dark:text-zinc-300">
                        {log.adminEmail}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.targetResource}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 truncate max-w-[120px]">
                        {log.targetId || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500 font-sans truncate max-w-xs">
                        {log.details || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-sans">
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


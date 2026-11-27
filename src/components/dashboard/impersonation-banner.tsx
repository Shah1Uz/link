"use client";

import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, Loader2, Eye } from "lucide-react";
import { useDashboard } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { impersonatedBy, profile, userEmail, subscriptionTier } = useDashboard();
  const [exiting, setExiting] = useState(false);

  if (!impersonatedBy) return null;

  const handleExit = async () => {
    try {
      setExiting(true);
      const res = await fetch("/api/admin/impersonate", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chiqishda xatolik");

      toast.success("Admin panelga qaytildi");
      window.location.href = data.redirectUrl || "/admin/users";
    } catch (err: any) {
      toast.error(err.message || "Admin rejimiga qaytib bo'lmadi");
      setExiting(false);
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-amber-500/30 bg-amber-500/15 px-4 py-2.5 backdrop-blur-xl dark:bg-amber-950/75">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-300">
            <Eye className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-foreground">
              <span>Admin ko&apos;rish rejimi:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">
                @{profile?.username || "user"}
              </span>
              <Badge
                variant={subscriptionTier === "PRO" ? "pro" : "outline"}
                className="px-1.5 py-0 text-[9px]"
              >
                {subscriptionTier}
              </Badge>
            </div>
            <p className="truncate text-[10.5px] text-text-secondary">
              {userEmail} sifatida ko&apos;rmoqdasiz (Admin: {impersonatedBy.email})
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handleExit}
          disabled={exiting}
          className="h-8 gap-1.5 rounded-xl bg-amber-500 px-3 text-xs font-bold text-amber-950 hover:bg-amber-400"
        >
          {exiting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5" />
          )}
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Adminga qaytish</span>
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plus,
  Eye,
  Palette,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-context";
import { DashboardNavList } from "@/components/layout/dashboard-sidebar";
import { useI18n } from "@/components/i18n-provider";

export function DashboardMobileNav() {
  const pathname = usePathname();
  const { profile, links, isMobilePreviewOpen, setIsMobilePreviewOpen } = useDashboard();
  const { t } = useI18n();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const username = profile?.username || "creator";

  // Hide mobile nav when on appearance page since MobileLiveDesignStudio renders its own 6-tool docked toolbar
  if (pathname.startsWith("/dashboard/appearance")) {
    return null;
  }

  // Calculate dynamic setup completion % (matching Screenshot 1)
  let score = 20; // base account
  if (profile?.displayName) score += 15;
  if (profile?.avatarUrl) score += 20;
  if (profile?.bio) score += 20;
  if (links && links.length > 0) score += 25;
  const setupPercent = Math.min(score, 100);

  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * setupPercent) / 100;

  return (
    <>
      {/* Mobile Drawer when Menu / More is tapped */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMenuDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 flex w-[20rem] max-w-[88vw] flex-col border-l border-border/80 bg-background shadow-2xl animate-in slide-in-from-right-6 duration-200">
            {/* Drawer Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950">
                  <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="font-heading text-sm font-extrabold tracking-tight">
                  {t.header.sections.profileStudio}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMenuDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface/80 hover:text-foreground transition-colors"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav list */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
              <DashboardNavList
                pathname={pathname}
                onNavigate={() => setMenuDrawerOpen(false)}
              />
            </div>

            {/* Bottom quick actions */}
            <div className="shrink-0 space-y-2 border-t border-border/70 p-3 bg-surface/30">
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2.5 text-xs font-semibold text-foreground shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-500" />
                  <span>{t.sidebar.viewPublicPage}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-text-secondary" />
              </a>
              <Link
                href="/dashboard/upgrade"
                onClick={() => setMenuDrawerOpen(false)}
                className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.sidebar.upgradePro}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Action Dock for Mobile (Matches Screenshot 1 Exactly) */}
      <div className="fixed inset-x-0 bottom-4 z-40 pointer-events-none flex justify-center px-4 lg:hidden">
        <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3">
          {/* Left: Circular Setup Progress Ring */}
          <Link
            href="/dashboard/settings"
            className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-background/90 p-1 shadow-lg ring-1 ring-border/80 backdrop-blur-xl transition-transform active:scale-95"
            title={`Profil sozlamasi: ${setupPercent}% tayyor`}
          >
            <div className="relative flex h-11 w-11 items-center justify-center">
              <svg className="h-11 w-11 -rotate-90 transform" viewBox="0 0 44 44">
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="22"
                  cy="22"
                  r={radius}
                  className="stroke-violet-500 transition-all duration-700 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center leading-[1]">
                <span className="text-[10px] font-black text-foreground">{setupPercent}%</span>
                <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight">
                  set up
                </span>
              </div>
            </div>
          </Link>

          {/* Right: Floating Action Capsule Dock [ + Add ] [ 👁 Preview ] [ 🖌 Design ] [ ⋯ ] */}
          <div className="flex flex-1 items-center justify-around gap-1 rounded-full border border-border/80 bg-background/95 px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            {/* 1. Add */}
            <Link
              href="/dashboard/links"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95",
                pathname.startsWith("/dashboard/links") || pathname === "/dashboard"
                  ? "text-foreground font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add</span>
            </Link>

            {/* 2. Preview */}
            <button
              type="button"
              onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95",
                isMobilePreviewOpen
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-4 w-4 stroke-[2.2]" />
              <span>Preview</span>
            </button>

            {/* 3. Design */}
            <Link
              href="/dashboard/appearance"
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all active:scale-95",
                pathname.startsWith("/dashboard/appearance")
                  ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Palette className="h-4 w-4 stroke-[2.2]" />
              <span>Design</span>
            </Link>

            {/* 4. More / Menu drawer toggle */}
            <button
              type="button"
              onClick={() => setMenuDrawerOpen(true)}
              className="flex flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all active:scale-95"
              title="Ko'proq menyular"
            >
              <MoreHorizontal className="h-4 w-4 stroke-[2.2]" />
              <span>Menyu</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Link2,
  Palette,
  Music,
  BarChart3,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-context";
import { DashboardNavList } from "@/components/layout/dashboard-sidebar";
import { useI18n } from "@/components/i18n-provider";

export function DashboardMobileNav() {
  const pathname = usePathname();
  const { profile } = useDashboard();
  const { t } = useI18n();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const username = profile?.username || "creator";

  const NAV_TABS = [
    {
      href: "/dashboard/links",
      label: t.sidebar.items.links,
      icon: Link2,
      isActive: pathname.startsWith("/dashboard/links") || pathname === "/dashboard",
    },
    {
      href: "/dashboard/appearance",
      label: t.sidebar.items.appearance,
      icon: Palette,
      isActive: pathname.startsWith("/dashboard/appearance"),
    },
    {
      href: "/dashboard/music",
      label: t.sidebar.items.music,
      icon: Music,
      badge: "NEW",
      isActive: pathname.startsWith("/dashboard/music"),
    },
    {
      href: "/dashboard/analytics",
      label: t.sidebar.items.analytics,
      icon: BarChart3,
      isActive: pathname.startsWith("/dashboard/analytics"),
    },
  ];

  return (
    <>
      {/* Mobile Drawer when "Menu / More" is tapped in bottom bar */}
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

            {/* Bottom quick action */}
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

      {/* Floating Bottom Nav Bar for Mobile Screens */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 backdrop-blur-xl px-2 py-1.5 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-1">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-bold transition-all duration-150 active:scale-95",
                  tab.isActive
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.12]"
                    : "text-text-secondary hover:text-foreground hover:bg-surface/50"
                )}
              >
                <div className="relative">
                  <Icon className="h-4 w-4" strokeWidth={tab.isActive ? 2.5 : 2} />
                  {tab.badge && (
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </div>
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}

          {/* More / Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMenuDrawerOpen(true)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-bold transition-all duration-150 active:scale-95",
              menuDrawerOpen
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.12]"
                : "text-text-secondary hover:text-foreground hover:bg-surface/50"
            )}
          >
            <Menu className="h-4 w-4" strokeWidth={2} />
            <span>{t.nav.navigation}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

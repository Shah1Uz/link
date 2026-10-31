"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  User,
  Link2,
  FolderTree,
  Palette,
  LayoutTemplate,
  BarChart3,
  QrCode,
  Settings,
  Zap,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import { useDashboard } from "@/context/dashboard-context";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bio", label: "My Bio Page", icon: User },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/collections", label: "Collections", icon: FolderTree },
  { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
  { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/qr-code", label: "QR Code", icon: QrCode },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile, subscriptionTier } = useDashboard();
  const username = profile?.username || "creator";
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`;

  return (
    <aside className="w-64 border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      {/* Brand & Profile Bar */}
      <div>
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-zinc-900 dark:text-white">Bio<span className="text-emerald-500">Space</span></span>
          </Link>
          <Badge variant={subscriptionTier === "PRO" ? "pro" : "outline"} className="text-[10px] uppercase font-bold">
            {subscriptionTier}
          </Badge>
        </div>

        {/* Public URL Quick Access Card */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 dark:bg-zinc-900/60 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
            <span>Your Live Link</span>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-500 transition-colors flex items-center gap-0.5"
            >
              <span>View</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center justify-between gap-1 text-xs">
            <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate">
              /{username}
            </span>
            <CopyButton text={publicUrl} size="sm" className="h-7 px-2 text-[11px]" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Upgrade / Admin CTA */}
      <div className="p-3 space-y-2 border-t border-zinc-200/80 dark:border-zinc-800/80">
        {subscriptionTier !== "PRO" && (
          <Link href="/dashboard/upgrade">
            <div className="rounded-2xl p-3.5 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Upgrade to PRO</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Unlock custom themes, remove branding & unlimited links.
              </p>
            </div>
          </Link>
        )}

        <Link href="/admin">
          <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-zinc-500 hover:text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5 mr-2" />
            <span>Admin Control Panel</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}


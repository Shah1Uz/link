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
  Users,
  ShoppingBag,
  Calendar,
  Globe,
  Music,
  LogOut,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { openPlatformTour } from "@/lib/tour-bus";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import { useDashboard } from "@/context/dashboard-context";
import { useClerk, useUser } from "@clerk/nextjs";
import { useI18n } from "@/components/i18n-provider";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  /** Optional prefix used for "active" detection when the route differs. */
  matchPrefix?: string;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

/**
 * Single source of truth for dashboard navigation — shared by the desktop
 * sidebar and the mobile drawer in the dashboard header.
 */
export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: "Studio",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/bio", label: "My Bio Page", icon: User },
      { href: "/dashboard/links", label: "Links", icon: Link2 },
      { href: "/dashboard/collections", label: "Collections", icon: FolderTree },
    ],
  },
  {
    label: "Design",
    items: [
      { href: "/dashboard/appearance", label: "Appearance", icon: Palette },
      { href: "/dashboard/music", label: "Music", icon: Music, badge: "NEW" },
      { href: "/dashboard/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/dashboard/qr", label: "QR Studio", icon: QrCode, matchPrefix: "/dashboard/qr" },
    ],
  },
  {
    label: "Grow",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/audience", label: "Audience", icon: Users },
      { href: "/dashboard/bookings", label: "Bookings", icon: Calendar, badge: "NEW" },
      { href: "/dashboard/store", label: "Store", icon: ShoppingBag, badge: "SHOP" },
      { href: "/dashboard/domains", label: "Domains", icon: Globe, badge: "PRO" },
    ],
  },
  {
    label: "Intelligence",
    items: [{ href: "/dashboard/ai", label: "AI Assistant", icon: Sparkles, badge: "AI" }],
  },
  {
    label: "Account",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

export function isDashboardNavActive(pathname: string, item: DashboardNavItem) {
  if (item.matchPrefix) {
    return pathname === item.href || pathname.startsWith(item.matchPrefix);
  }
  if (item.href === "/dashboard") return pathname === "/dashboard";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const BADGE_STYLES = {
  NEW: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PRO: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  AI: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  SHOP: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
} as const;

export function DashboardNavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { t } = useI18n();

  const groupLabels: Record<string, string> = {
    Studio: t.sidebar.groups.studio,
    Design: t.sidebar.groups.design,
    Grow: t.sidebar.groups.grow,
    Intelligence: t.sidebar.groups.intelligence,
    Account: t.sidebar.groups.account,
  };

  const itemLabels: Record<string, string> = {
    "/dashboard": t.sidebar.items.overview,
    "/dashboard/bio": t.sidebar.items.myBio,
    "/dashboard/links": t.sidebar.items.links,
    "/dashboard/collections": t.sidebar.items.collections,
    "/dashboard/appearance": t.sidebar.items.appearance,
    "/dashboard/music": t.sidebar.items.music,
    "/dashboard/templates": t.sidebar.items.templates,
    "/dashboard/qr": t.sidebar.items.qr,
    "/dashboard/analytics": t.sidebar.items.analytics,
    "/dashboard/audience": t.sidebar.items.audience,
    "/dashboard/bookings": t.sidebar.items.bookings,
    "/dashboard/store": t.sidebar.items.store,
    "/dashboard/domains": t.sidebar.items.domains,
    "/dashboard/ai": t.sidebar.items.ai,
    "/dashboard/settings": t.sidebar.items.settings,
  };

  return (
    <nav className="space-y-5" aria-label="Dashboard navigation">
      {DASHBOARD_NAV_GROUPS.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary/80">
            {groupLabels[group.label] || group.label}
          </p>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = isDashboardNavActive(pathname, item);
            const localizedLabel = itemLabels[item.href] || item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-xl px-2.5 py-[7px] text-[13px] font-semibold transition-all duration-200 ease-out-soft active:scale-[0.99]",
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/[0.14] via-emerald-500/[0.05] to-transparent text-emerald-800 dark:text-emerald-200"
                    : "text-text-secondary hover:bg-foreground/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]"
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 shadow-glow-sm"
                  />
                )}
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                    isActive
                      ? "border-emerald-500/30 bg-emerald-500/[0.14] text-emerald-600 dark:text-emerald-300"
                      : "border-border/70 bg-surface/60 text-text-secondary group-hover:border-border group-hover:text-foreground dark:bg-white/[0.03]"
                  )}
                >
                  <Icon className="h-[14px] w-[14px]" strokeWidth={2.25} />
                </span>
                <span className="truncate">{localizedLabel}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto shrink-0 rounded-full border px-1.5 py-[1px] text-[9px] font-extrabold tracking-wide",
                      BADGE_STYLES[item.badge as keyof typeof BADGE_STYLES] ||
                        BADGE_STYLES.NEW
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile, subscriptionTier, isAdmin, userEmail, userRole } = useDashboard();
  const { user: clerkUser } = useUser();
  const { t } = useI18n();
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase();

  const isUserAdmin = Boolean(
    isAdmin ||
    clerkEmail === "shahuztech@gmail.com" ||
    userEmail?.toLowerCase() === "shahuztech@gmail.com" ||
    (userRole && (userRole === "SUPER_ADMIN" || userRole === "ADMIN"))
  );

  const username = profile?.username || "creator";
  const publicUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`;
  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.warn("Logout endpoint error:", e);
    }

    try {
      const cookieNames = [
        "biospace_session",
        "__session",
        "__client_uat",
        "__clerk_db_jwt",
        "__clerk_handshake",
      ];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        if (typeof window !== "undefined" && window.location.hostname) {
          document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        }
      });
    } catch {}

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}

    try {
      if (clerk && typeof clerk.signOut === "function") {
        await clerk.signOut({ redirectUrl: "/sign-in" });
        return;
      }
    } catch (err) {
      console.warn("Clerk signOut error:", err);
    }

    window.location.replace("/sign-in");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[16.5rem] shrink-0 flex-col border-r border-border/70 bg-background/70 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45),0_10px_22px_-10px_rgba(16,185,129,0.8)]">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-[15px] font-extrabold tracking-[-0.03em] text-foreground">
            Bio<span className="text-gradient-ink">Space</span>
          </span>
        </Link>
        <Badge
          variant={subscriptionTier === "PRO" ? "pro" : "outline"}
          className="text-[9px] font-extrabold uppercase tracking-wider"
        >
          {subscriptionTier}
        </Badge>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-none">
        {/* Public URL */}
        <div className="panel glint p-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
              Live link
            </span>
            <a
              href={`/${username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              <span>Open</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="mt-2 flex items-center justify-between gap-1.5">
            <span className="truncate font-mono text-xs font-bold text-foreground">
              /{username}
            </span>
            <CopyButton text={publicUrl} size="sm" className="h-6 px-1.5 text-[10px]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-text-secondary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>{profile?.isPublished === false ? "Profile hidden" : "Published & live"}</span>
          </div>
        </div>

        <DashboardNavList pathname={pathname} />
      </div>

      {/* Bottom: plan + admin */}
      <div className="shrink-0 space-y-2 border-t border-border/70 bg-background/60 p-3 backdrop-blur-xl">
        {subscriptionTier !== "PRO" ? (
          <Link href="/dashboard/upgrade" className="group block">
            <div className="glint relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.14] via-teal-500/[0.06] to-transparent p-3.5 transition-all duration-300 ease-out-soft hover:border-emerald-500/45">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                  <span>{t.sidebar.upgradePro}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-600 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-emerald-400" />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-text-secondary">
                {t.sidebar.upgradeSub}
              </p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-emerald-950">
              <Zap className="h-3 w-3 fill-current" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-foreground">{t.sidebar.creatorPro}</p>
              <p className="text-[10px] text-text-secondary">{t.sidebar.allUnlocked}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => openPlatformTour()}
          className="flex w-full items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/40 cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-500" />
            <span>{t.sidebar.tourBtn}</span>
          </div>
          <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
            TOUR
          </span>
        </button>

        {isUserAdmin && (
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-[12px] font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-500/15 hover:border-emerald-500/40 shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">{t.sidebar.adminPanel}</span>
            </div>
            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-300">
              ADMIN
            </span>
          </Link>
        )}

        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="flex w-full items-center justify-between rounded-xl border border-border/70 bg-surface/50 px-3 py-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400 transition-all hover:bg-rose-500/10 hover:border-rose-500/30 disabled:opacity-60 cursor-pointer shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-3.5 w-3.5" />
            <span>{isSigningOut ? t.sidebar.signingOut : t.sidebar.signOut}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}

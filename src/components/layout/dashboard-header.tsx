"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Eye,
  ExternalLink,
  Menu,
  Sparkles,
  X,
  Search,
  ChevronRight,
  Settings,
  User,
  Palette,
  LogOut,
  LayoutDashboard,
  ArrowUpRight,
  Command,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { openPlatformTour } from "@/lib/tour-bus";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useDashboard } from "@/context/dashboard-context";
import { useClerk, useUser } from "@clerk/nextjs";
import { useI18n } from "@/components/i18n-provider";
import {
  DASHBOARD_NAV_GROUPS,
  DashboardNavList,
} from "@/components/layout/dashboard-sidebar";

interface DashboardHeaderProps {
  title?: string;
  heading?: string;
  description?: string;
  text?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const SECTIONS = [
  { test: /^\/dashboard$/, key: "overview" as const },
  { test: /^\/dashboard\/(bio|links|collections)/, key: "profileStudio" as const },
  { test: /^\/dashboard\/(appearance|music|templates|qr)/, key: "designStudio" as const },
  { test: /^\/dashboard\/ai/, key: "aiStudio" as const },
  { test: /^\/dashboard\/(analytics|audience|bookings|store|domains)/, key: "growth" as const },
  { test: /^\/dashboard\/(settings|upgrade)/, key: "account" as const },
];

/** Reactively closes a popover when the pointer leaves it or Escape is pressed. */
function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);
  return ref;
}

export function DashboardHeader({
  title,
  heading,
  description,
  text,
  action,
  children,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { profile, isMobilePreviewOpen, setIsMobilePreviewOpen, isAdmin, userEmail, userRole } = useDashboard();
  const { user: clerkUser } = useUser();
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress?.toLowerCase();

  const isUserAdmin = Boolean(
    isAdmin ||
    clerkEmail === "shahuztech@gmail.com" ||
    userEmail?.toLowerCase() === "shahuztech@gmail.com" ||
    (userRole && (userRole === "SUPER_ADMIN" || userRole === "ADMIN"))
  );

  const username = profile?.username || "creator";
  const displayTitle = title || heading || "";
  const displayDescription = description || text;
  const displayAction = action || children;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const menuRef = useDismiss(menuOpen, () => setMenuOpen(false));
  const searchRef = useDismiss(searchOpen, () => setSearchOpen(false));

  const sectionKey = useMemo(
    () => SECTIONS.find((entry) => entry.test.test(pathname))?.key || "profileStudio",
    [pathname]
  );
  const section = t.header.sections[sectionKey] || t.header.sections.profileStudio;

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
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
    const items = DASHBOARD_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        label: itemLabels[item.href] || item.label,
        group: groupLabels[group.label] || group.label,
      }))
    );
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.href.toLowerCase().includes(q)
    );
  }, [query, t]);

  const clerk = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const avatarUrl =
    profile?.avatarUrl ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80";

  return (
    <>
      {/* Mobile navigation drawer — rendered outside the header so `fixed` is never clipped */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[19rem] max-w-[86vw] flex-col border-r border-border/70 bg-background shadow-lift animate-in slide-in-from-left-6">
            <div className="flex h-14 shrink-0 items-center justify-between px-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.45)]">
                  <Sparkles className="h-4 w-4" strokeWidth={2.5} />
                </span>
                <span className="font-heading text-[15px] font-extrabold tracking-[-0.03em]">
                  Bio<span className="text-gradient-ink">Space</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <DashboardNavList
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="shrink-0 space-y-2 border-t border-border/70 p-3">
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-border/70 bg-surface/60 px-3 py-2.5 text-[12px] font-semibold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.sidebar.viewPublicPage}</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-text-secondary" />
              </a>
              <Link
                href="/dashboard/upgrade"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5 text-[12px] font-bold text-emerald-700 dark:text-emerald-300"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{t.sidebar.upgradePro}</span>
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 transition-colors hover:bg-rose-500/15 disabled:opacity-60 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isSigningOut ? t.sidebar.signingOut : t.sidebar.signOut}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-30">
        {/* Sticky app bar */}
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-1.5 sm:gap-2 px-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/60 text-text-secondary transition-colors hover:text-foreground lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 shrink-0 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
              <span className="hidden font-heading text-[13px] font-extrabold tracking-[-0.03em] min-[440px]:inline">
                Bio<span className="text-gradient-ink">Space</span>
              </span>
            </Link>

            <nav
              aria-label="Breadcrumb"
              className="hidden items-center gap-1.5 text-[12px] font-medium text-text-secondary sm:flex"
            >
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground"
              >
                {t.nav.dashboard}
              </Link>
              <ChevronRight className="h-3 w-3 opacity-60" />
              <span className="font-semibold text-foreground">{section}</span>
            </nav>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Quick jump / search */}
              <div className="relative hidden md:block" ref={searchRef}>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen((open) => !open);
                    setQuery("");
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-surface/50 px-3 text-[12px] font-medium text-text-secondary transition-colors hover:border-border hover:text-foreground"
                  aria-label="Search dashboard pages"
                  aria-expanded={searchOpen}
                >
                  <Search className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">{t.header.search}</span>
                  <kbd className="hidden items-center gap-0.5 rounded-md border border-border/70 bg-background/70 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-text-secondary lg:inline-flex">
                    <Command className="h-2.5 w-2.5" /> K
                  </kbd>
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-border/80 bg-popover/95 shadow-lift backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2.5">
                      <Search className="h-3.5 w-3.5 text-text-secondary" />
                      <input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t.header.searchPlaceholder}
                        aria-label="Search pages"
                        className="w-full bg-transparent text-[13px] font-medium text-foreground placeholder:text-text-secondary/70 focus:outline-none"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto p-1.5">
                      {searchResults.length === 0 ? (
                        <p className="px-3 py-6 text-center text-xs text-text-secondary">
                          {t.header.noMatch} “{query}”.
                        </p>
                      ) : (
                        searchResults.slice(0, 10).map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]"
                            >
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/70 bg-surface/60 text-text-secondary">
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="truncate">{item.label}</span>
                              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-text-secondary/70">
                                {item.group}
                              </span>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Platform Tour button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPlatformTour()}
                className="gap-1.5 rounded-xl text-xs font-semibold border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15"
                title={t.header.tour}
              >
                <HelpCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">{t.header.tour}</span>
              </Button>

              {/* Live public profile */}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl text-xs font-semibold"
                >
                  <span>{t.header.viewBio}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>

              {/* Mobile live preview toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
                className="h-9 w-9 p-0 rounded-xl text-xs font-semibold xl:hidden sm:h-9 sm:w-auto sm:px-3 sm:gap-1.5 shrink-0"
                title={isMobilePreviewOpen ? t.header.hide : t.header.preview}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isMobilePreviewOpen ? t.header.hide : t.header.preview}
                </span>
              </Button>

              <div className="hidden h-6 w-px bg-border/70 sm:block" />

              <div className="shrink-0">
                <LanguageToggle />
              </div>
              <div className="shrink-0">
                <ThemeToggle />
              </div>

              {/* Avatar menu */}
              <div className="relative shrink-0" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-label="Account menu"
                  aria-expanded={menuOpen}
                  className="group flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/70 bg-surface/50 p-0.5 pr-1 transition-colors hover:border-emerald-500/40"
                >
                  <span className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-transparent transition-all group-hover:ring-emerald-500/40 shrink-0">
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  </span>
                  <ChevronRight className="hidden h-3 w-3 rotate-90 text-text-secondary sm:block" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-border/80 bg-popover/95 shadow-lift backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-2.5 border-b border-border/70 p-3">
                      <span className="h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-foreground">
                          {profile?.displayName || "Creator"}
                        </p>
                        <p className="truncate text-[11px] text-text-secondary">
                          @{username}
                        </p>
                      </div>
                    </div>
                    <div className="p-1.5">
                      {[
                        { href: "/dashboard/settings", label: t.sidebar.items.settings, icon: Settings },
                        { href: "/dashboard/bio", label: t.sidebar.items.myBio, icon: User },
                        { href: "/dashboard/appearance", label: t.sidebar.items.appearance, icon: Palette },
                        { href: "/dashboard", label: t.sidebar.items.overview, icon: LayoutDashboard },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]"
                          >
                            <Icon className="h-3.5 w-3.5 text-text-secondary" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <a
                        href={`/${username}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-text-secondary" />
                        <span>{t.sidebar.viewPublicPage}</span>
                      </a>

                      {isUserAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[12px] font-bold text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-500/10"
                        >
                          <span className="flex items-center gap-2.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{t.sidebar.adminPanel}</span>
                          </span>
                          <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-emerald-600 dark:text-emerald-300">
                            ADMIN
                          </span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-border/70 p-1.5">
                      <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12px] font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400 disabled:opacity-60 cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>{isSigningOut ? t.sidebar.signingOut : t.sidebar.signOut}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page hero */}
        <div className="relative isolate overflow-hidden border-b border-border/60">
          <div aria-hidden="true" className="aurora" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid-pattern opacity-[0.55] dark:opacity-40"
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 pb-6 pt-5 sm:px-6 sm:pt-8 sm:pb-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
            <div className="min-w-0 flex-1 space-y-1.5 sm:space-y-2">
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {section}
              </span>
              {displayTitle && (
                <h1 className="font-heading text-xl sm:text-[2rem] lg:text-[2.15rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-foreground break-words">
                  {displayTitle}
                </h1>
              )}
              {displayDescription && (
                <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-text-secondary break-words">
                  {displayDescription}
                </p>
              )}
            </div>
            {displayAction && (
              <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">{displayAction}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

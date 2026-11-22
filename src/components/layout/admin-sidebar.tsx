"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  LayoutTemplate,
  Flag,
  CreditCard,
  Settings,
  History,
  LayoutDashboard,
  ArrowLeft,
  ShoppingBag,
  LifeBuoy,
  Globe,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Admin identity is resolved server-side in `src/app/admin/layout.tsx` and
 * handed to the client sidebar. Every field is optional so the shell still
 * renders when the session payload is partial.
 */
export interface AdminIdentity {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
}

interface AdminSidebarProps {
  admin?: AdminIdentity;
}

interface AdminNavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Aliased routes (e.g. /admin/moderation mirrors /admin/reports). */
  aliases?: string[];
}

const navGroups: { label: string; items: AdminNavItem[] }[] = [
  {
    label: "Command",
    items: [{ href: "/admin", label: "Mission Control", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      {
        href: "/admin/reports",
        label: "Reports & Moderation",
        icon: Flag,
        aliases: ["/admin/moderation"],
      },
      { href: "/admin/templates", label: "Templates", icon: LayoutTemplate },
      { href: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
      { href: "/admin/support", label: "Support Tickets", icon: LifeBuoy },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/domains", label: "Custom Domains", icon: Globe },
      { href: "/admin/settings", label: "Platform Settings", icon: Settings },
      {
        href: "/admin/audit-logs",
        label: "Audit Logs",
        icon: History,
        aliases: ["/admin/logs"],
      },
    ],
  },
];

/** Event dispatched by the admin header's mobile menu button. */
export const ADMIN_SIDEBAR_TOGGLE_EVENT = "biospace:admin-sidebar-toggle";

function isItemActive(pathname: string | null, item: AdminNavItem) {
  if (!pathname) return false;
  if (pathname === item.href) return true;
  if (pathname.startsWith(`${item.href}/`)) return true;
  return (item.aliases ?? []).some(
    (alias) => pathname === alias || pathname.startsWith(`${alias}/`)
  );
}

function initialsOf(admin?: AdminIdentity) {
  const source = admin?.name?.trim() || admin?.email?.trim() || "Admin";
  const letters = source
    .replace(/[^a-zA-Z0-9]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (letters || "AD").toUpperCase();
}

interface SidebarPanelProps {
  pathname: string | null;
  admin?: AdminIdentity;
  onNavigate?: () => void;
  onClose?: () => void;
}

function SidebarPanel({ pathname, admin, onNavigate, onClose }: SidebarPanelProps) {
  const roleLabel = (admin?.role || "ADMIN").replace(/_/g, " ");

  return (
    <>
      {/* Brand block */}
      <div className="flex h-[4.5rem] shrink-0 items-center justify-between gap-2 border-b border-zinc-200/80 px-4 dark:border-white/[0.08]">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="group flex min-w-0 items-center gap-2.5 rounded-2xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-emerald-500/40"
        >
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-glow-sm">
            <ShieldAlert className="h-[18px] w-[18px]" />
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/35 to-transparent"
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-[15px] font-extrabold tracking-[-0.02em] text-foreground">
              Bio<span className="text-gradient-ink">Space</span>
            </span>
            <span className="mt-0.5 block text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
              Admin Console
            </span>
          </span>
        </Link>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-zinc-900/[0.05] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 dark:hover:bg-white/[0.06]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-2 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-glow" />
            Live
          </span>
        )}
      </div>

      {/* Grouped navigation */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 scrollbar-none">
        <nav aria-label="Admin navigation" className="pt-1">
          {navGroups.map((group) => (
            <div key={group.label} className="pt-4 first:pt-2">
              <p className="px-2.5 pb-1.5 text-[9.5px] font-bold uppercase tracking-[0.2em] text-text-secondary/70">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 outline-none transition-all duration-200 ease-out-soft focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                          active
                            ? "bg-gradient-to-r from-emerald-500/[0.14] via-teal-500/[0.07] to-transparent text-foreground"
                            : "text-text-secondary hover:bg-zinc-900/[0.04] hover:text-foreground dark:hover:bg-white/[0.05]"
                        )}
                      >
                        {active && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.65)]"
                          />
                        )}
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                            active
                              ? "border-emerald-500/25 bg-gradient-to-b from-emerald-500/20 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-300"
                              : "border-transparent text-text-secondary group-hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[13px] leading-6",
                            active ? "font-bold" : "font-medium"
                          )}
                        >
                          {item.label}
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-all duration-200",
                            active
                              ? "text-emerald-500/80"
                              : "opacity-0 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-60"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Admin identity card */}
      <div className="shrink-0 space-y-2 border-t border-zinc-200/80 p-3 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-2.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-[11px] font-extrabold text-emerald-950 shadow-glow-sm">
            {admin?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={admin.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initialsOf(admin)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold leading-tight text-foreground">
              {admin?.name || "Administrator"}
            </p>
            <p className="mt-0.5 truncate text-[10px] leading-tight text-text-secondary">
              {admin?.email || "admin@biospace.app"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-glow-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-1">
          <Badge variant="success" className="gap-1 px-2 py-0.5">
            <ShieldCheck className="h-3 w-3" />
            {roleLabel}
          </Badge>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-text-secondary/70">
            Restricted
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 rounded-xl text-xs"
        >
          <Link href="/dashboard" onClick={onNavigate}>
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Creator Dashboard</span>
          </Link>
        </Button>
      </div>
    </>
  );
}

export function AdminSidebar({ admin }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The admin header renders the mobile trigger on every page. A tiny window
  // event keeps both client components in sync without extra providers.
  useEffect(() => {
    const toggle = () => setMobileOpen((open) => !open);
    window.addEventListener(ADMIN_SIDEBAR_TOGGLE_EVENT, toggle);
    return () => window.removeEventListener(ADMIN_SIDEBAR_TOGGLE_EVENT, toggle);
  }, []);

  // Close the drawer on navigation and on Escape.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 flex-col border-r border-zinc-200/80 bg-background/80 backdrop-blur-xl dark:border-white/[0.08] dark:bg-background/80 lg:flex">
        <SidebarPanel pathname={pathname} admin={admin} />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn("lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close navigation overlay"
          tabIndex={mobileOpen ? 0 : -1}
          inert={!mobileOpen}
          onClick={() => setMobileOpen(false)}
          className={cn(
            "fixed inset-0 z-[60] cursor-default bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          inert={!mobileOpen}
          className={cn(
            "fixed inset-y-0 left-0 z-[61] flex w-[17rem] max-w-[85vw] flex-col border-r border-zinc-200/80 bg-background shadow-lift transition-transform duration-300 ease-out-expo dark:border-white/[0.08]",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-label="Admin navigation drawer"
        >
          <SidebarPanel
            pathname={pathname}
            admin={admin}
            onNavigate={() => setMobileOpen(false)}
            onClose={() => setMobileOpen(false)}
          />
        </aside>
      </div>
    </>
  );
}

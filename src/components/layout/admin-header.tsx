"use client";

import React from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADMIN_SIDEBAR_TOGGLE_EVENT } from "@/components/layout/admin-sidebar";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  /** Optional identity chip shown at the end of the action row. */
  adminName?: string | null;
  adminEmail?: string | null;
  adminAvatarUrl?: string | null;
  role?: string | null;
}

function AdminIdentityChip({
  adminName,
  adminAvatarUrl,
  role,
}: {
  adminName?: string | null;
  adminAvatarUrl?: string | null;
  role?: string | null;
}) {
  const roleLabel = (role || "ADMIN").replace(/_/g, " ");
  return (
    <div
      className="hidden h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 p-[1.5px] shadow-glow-sm sm:flex"
      title={`${adminName || "Administrator"} · ${roleLabel}`}
      aria-label={`Signed in as ${adminName || "Administrator"} (${roleLabel})`}
      role="img"
    >
      <div className="flex h-full w-full items-center justify-center rounded-full bg-background text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
        {adminAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={adminAvatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
      </div>
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
  adminName,
  adminAvatarUrl,
  role,
}: AdminHeaderProps) {
  const openMobileNav = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(ADMIN_SIDEBAR_TOGGLE_EVENT));
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200/80 bg-background/75 backdrop-blur-xl dark:border-white/[0.08] dark:bg-background/70">
      {/* Hairline aurora accent along the bottom edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent"
      />

      <div className="flex min-h-[4.5rem] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={openMobileNav}
            aria-label="Open admin navigation"
            className="h-9 w-9 shrink-0 rounded-xl lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-glow-sm animate-glow"
              />
              <p className="truncate text-[9.5px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                BioSpace Admin
              </p>
            </div>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              <h1 className="truncate font-heading text-[17px] font-extrabold leading-tight tracking-[-0.03em] text-foreground sm:text-xl">
                {title}
              </h1>
              <Badge
                variant="outline"
                className="hidden shrink-0 border-emerald-500/30 bg-emerald-500/[0.06] text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-300 lg:inline-flex"
              >
                Admin
              </Badge>
            </div>
            {description && (
              <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-text-secondary sm:text-xs">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {action}

          <span
            aria-hidden="true"
            className="mx-0.5 hidden h-6 w-px bg-zinc-200 dark:bg-white/10 sm:block"
          />

          <LanguageToggle className="hidden sm:inline-block" />
          <ThemeToggle />

          <AdminIdentityChip
            adminName={adminName}
            adminAvatarUrl={adminAvatarUrl}
            role={role}
          />
        </div>
      </div>
    </header>
  );
}

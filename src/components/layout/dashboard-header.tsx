"use client";

import React from "react";
import Link from "next/link";
import { Eye, ExternalLink, Menu, Sparkles, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useDashboard } from "@/context/dashboard-context";
import { SignOutButton } from "@clerk/nextjs";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  const { profile, isMobilePreviewOpen, setIsMobilePreviewOpen } = useDashboard();
  const username = profile?.username || "creator";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}

        {/* Mobile Preview Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobilePreviewOpen(!isMobilePreviewOpen)}
          className="lg:hidden rounded-xl gap-1.5 text-xs font-semibold"
        >
          <Eye className="h-4 w-4" />
          <span>{isMobilePreviewOpen ? "Hide Preview" : "Preview"}</span>
        </Button>

        {/* View Live Public Profile */}
        <a
          href={`/${username}`}
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex"
        >
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 font-semibold">
            <span>View Bio</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>

        <LanguageToggle />
        <ThemeToggle />

        {/* Avatar Profile Link */}
        <Link href="/dashboard/settings">
          <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-zinc-200 dark:ring-zinc-800 hover:ring-emerald-500 transition-all">
            <img
              src={
                profile?.avatarUrl ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
              }
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
      </div>
    </header>
  );
}


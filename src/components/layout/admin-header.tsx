"use client";

import React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ArrowLeft } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminHeader({ title, description, action }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {title}
          </h1>
          <Badge variant="destructive" className="text-[9px] font-bold">
            ADMIN
          </Badge>
        </div>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {action}
        <ThemeToggle />
      </div>
    </header>
  );
}


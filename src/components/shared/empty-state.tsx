import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative isolate flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-zinc-200/90 bg-zinc-50/50 p-8 text-center dark:border-white/10 dark:bg-white/[0.02]",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]"
      />
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:text-emerald-400 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-text-secondary">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

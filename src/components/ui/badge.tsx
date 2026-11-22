import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "pro" | "verified" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-900 text-zinc-50 shadow-xs dark:bg-zinc-100 dark:text-zinc-900",
    secondary: "bg-zinc-100 text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-300",
    pro: "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-amber-950 font-semibold shadow-[0_6px_16px_-8px_rgba(245,158,11,0.8)]",
    verified:
      "border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:text-sky-300",
    success:
      "border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:text-emerald-300",
    warning:
      "border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:text-amber-300",
    destructive:
      "border border-rose-500/25 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:text-rose-300",
    outline: "border border-zinc-200/90 text-zinc-700 dark:border-white/10 dark:text-zinc-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

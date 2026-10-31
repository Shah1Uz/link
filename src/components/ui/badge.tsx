import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "pro" | "verified" | "success" | "warning" | "destructive" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900",
    secondary: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    pro: "bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-sm",
    verified: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
    destructive: "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30",
    outline: "border border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}


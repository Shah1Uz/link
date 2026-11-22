import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 flex items-center text-text-secondary">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-xl border border-zinc-200/90 bg-white/80 px-3.5 text-sm font-medium text-foreground shadow-xs backdrop-blur-sm transition-all duration-200 placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-emerald-500/60 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-white/20 dark:focus-visible:border-emerald-400/50 dark:focus-visible:bg-white/[0.05] dark:focus-visible:ring-emerald-400/10",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-rose-500/70 focus-visible:border-rose-500 focus-visible:ring-rose-500/15",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-text-secondary">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

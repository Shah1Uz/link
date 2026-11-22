import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[96px] w-full resize-y rounded-xl border border-zinc-200/90 bg-white/80 px-3.5 py-2.5 text-sm font-medium text-foreground shadow-xs backdrop-blur-sm transition-all duration-200 placeholder:font-normal placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-emerald-500/60 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:hover:border-white/20 dark:focus-visible:border-emerald-400/50 dark:focus-visible:bg-white/[0.05] dark:focus-visible:ring-emerald-400/10",
            error && "border-rose-500/70 focus-visible:border-rose-500 focus-visible:ring-rose-500/15",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

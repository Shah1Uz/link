import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "neon"
    | "glass";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      asChild = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-[-0.01em] transition-all duration-200 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985]";

    const variants = {
      // Aurora brand gradient with an inner top highlight
      default:
        "bg-gradient-to-b from-emerald-500 to-emerald-600 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),0_10px_24px_-12px_rgba(16,185,129,0.75)] hover:from-emerald-400 hover:to-emerald-600 hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_16px_32px_-14px_rgba(16,185,129,0.85)] dark:text-emerald-950",
      secondary:
        "bg-zinc-100 text-zinc-900 shadow-xs hover:bg-zinc-200/90 dark:bg-white/[0.06] dark:text-zinc-100 dark:hover:bg-white/[0.1]",
      outline:
        "border border-zinc-200/90 bg-white/60 text-zinc-800 shadow-xs backdrop-blur-sm hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-200 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white",
      ghost:
        "text-zinc-600 hover:bg-zinc-900/[0.05] hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white",
      link: "h-auto p-0 text-emerald-700 underline-offset-4 hover:text-emerald-600 hover:underline dark:text-emerald-400",
      destructive:
        "bg-gradient-to-b from-rose-500 to-rose-600 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_10px_24px_-12px_rgba(244,63,94,0.7)] hover:from-rose-400 hover:to-rose-600",
      neon: "bg-emerald-400 text-emerald-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5),0_0_0_1px_rgba(16,185,129,0.3),0_0_28px_-4px_rgba(16,185,129,0.65)] hover:bg-emerald-300 hover:shadow-[0_0_36px_-4px_rgba(16,185,129,0.85)]",
      glass:
        "border border-white/25 bg-white/10 text-white backdrop-blur-xl hover:border-white/35 hover:bg-white/20",
    };

    const sizes = {
      default: "h-10 rounded-xl px-4 text-sm",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-2xl px-7 text-[15px]",
      icon: "h-10 w-10 rounded-xl p-0",
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(baseStyles, variants[variant], sizes[size], (children as any).props.className, className),
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

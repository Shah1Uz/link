"use client";

import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className={`h-9 w-9 rounded-xl border border-zinc-200/80 bg-white/70 p-0 text-text-secondary shadow-xs backdrop-blur-sm transition-colors hover:border-zinc-300 hover:bg-white hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.06] ${className || ""}`}
      aria-label="Toggle theme"
      title={`Theme: ${theme} (Current: ${resolvedTheme})`}
    >
      {theme === "light" && <Sun className="h-4 w-4 text-amber-500 transition-all" />}
      {theme === "dark" && <Moon className="h-4 w-4 text-indigo-400 transition-all" />}
      {theme === "system" && <Laptop className="h-4 w-4 text-emerald-500 transition-all" />}
    </Button>
  );
}

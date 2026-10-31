"use client";

import React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

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
      className={`h-9 w-9 rounded-xl p-0 hover:bg-surface text-secondary hover:text-foreground transition-colors ${className || ""}`}
      title={`Theme: ${theme} (Current: ${resolvedTheme})`}
      aria-label="Toggle theme"
    >
      {theme === "light" && <Sun className="h-4 w-4 text-amber-500 transition-all" />}
      {theme === "dark" && <Moon className="h-4 w-4 text-indigo-400 transition-all" />}
      {theme === "system" && <Laptop className="h-4 w-4 text-emerald-500 transition-all" />}
    </Button>
  );
}


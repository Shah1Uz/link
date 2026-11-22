"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  ArrowRight,
  Layers,
  LayoutTemplate,
  CreditCard,
  Info,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";
import { openPlatformTour } from "@/lib/tour-bus";

const navLinks = [
  { href: "/features", key: "features" as const, icon: Layers },
  { href: "/templates", key: "templates" as const, icon: LayoutTemplate },
  { href: "/pricing", key: "pricing" as const, icon: CreditCard },
  { href: "/about", key: "about" as const, icon: Info },
  { href: "/faq", key: "faq" as const, icon: HelpCircle },
];

export function MarketingNavbar() {
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-out-expo",
        scrolled
          ? "border-b border-zinc-200/70 bg-background/80 shadow-soft backdrop-blur-xl dark:border-white/[0.07] dark:bg-background/70"
          : "border-b border-transparent bg-background/50 backdrop-blur-md dark:bg-background/40"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="BioSpace home"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-glow-sm ring-1 ring-white/25 transition-transform duration-300 ease-out-expo group-hover:scale-105 group-hover:rotate-[-4deg]">
            <Sparkles className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} />
          </span>
          <span className="font-heading text-[1.15rem] font-extrabold tracking-[-0.03em] text-foreground">
            Bio<span className="text-gradient-ink">Space</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-xl px-3.5 py-2 text-[13.5px] font-semibold tracking-[-0.01em] transition-colors duration-200",
                  active
                    ? "bg-zinc-900/[0.05] text-foreground dark:bg-white/[0.07] dark:text-white"
                    : "text-text-secondary hover:bg-zinc-900/[0.035] hover:text-foreground dark:hover:bg-white/[0.05] dark:hover:text-white"
                )}
              >
                {t.nav[link.key]}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-3.5 -bottom-px h-px bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent transition-opacity duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openPlatformTour()}
            className="rounded-xl gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
            title={t.nav.tour}
          >
            <HelpCircle className="h-4 w-4 text-emerald-500" />
            <span className="hidden lg:inline">{t.nav.tour}</span>
          </Button>
          <LanguageToggle />
          <ThemeToggle />
          <span
            aria-hidden="true"
            className="mx-1 hidden h-5 w-px bg-border/80 lg:block"
          />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="rounded-xl">
              {t.nav.signIn}
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="group rounded-xl px-4">
              <span>{t.nav.getStarted}</span>
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-marketing-menu"
            className="rounded-xl"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-marketing-menu"
          className="absolute inset-x-0 top-full origin-top border-b border-zinc-200/80 bg-background/95 shadow-lift backdrop-blur-2xl animate-in slide-in-from-top duration-200 md:hidden dark:border-white/[0.08] dark:bg-background/95"
        >
          <div className="container mx-auto px-4 pb-5 pt-3 sm:px-6">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
              {t.nav.navigation}
            </p>
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                      active
                        ? "bg-emerald-500/[0.08] text-foreground dark:bg-emerald-500/[0.1] dark:text-white"
                        : "text-text-secondary hover:bg-zinc-900/[0.04] hover:text-foreground dark:hover:bg-white/[0.05] dark:hover:text-white"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl border transition-colors",
                        active
                          ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : "border-zinc-200/80 bg-white/60 text-text-secondary dark:border-white/[0.08] dark:bg-white/[0.04]"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">{t.nav[link.key]}</span>
                    <ChevronRight className="h-4 w-4 text-text-secondary/60 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openPlatformTour();
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-2.5 text-[15px] font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                <HelpCircle className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left">{t.nav.tour}</span>
              <ChevronRight className="h-4 w-4 text-emerald-500" />
            </button>

            <div className="mt-4 flex flex-col gap-2 border-t border-zinc-200/80 pt-4 dark:border-white/[0.08]">
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl">
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="group w-full rounded-xl">
                  <span>{t.nav.getStarted}</span>
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <span className="text-zinc-900 dark:text-white">Bio<span className="text-emerald-500">Space</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <Link href="/features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/templates" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-zinc-950 dark:hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="rounded-xl px-4 group">
              <span>Get Started</span>
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-zinc-200 bg-white p-5 md:hidden dark:border-zinc-800 dark:bg-zinc-950 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-3 pb-4 text-base font-medium text-zinc-700 dark:text-zinc-300">
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-500"
            >
              Features
            </Link>
            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-500"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-500"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-500"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-emerald-500"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Log In
              </Button>
            </Link>
            <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


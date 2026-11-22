import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Home,
  LayoutTemplate,
  CreditCard,
  HelpCircle,
  Mail,
} from "lucide-react";

const quickLinks = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/pricing", icon: CreditCard, label: "Pricing" },
  { href: "/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/contact", icon: Mail, label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="relative isolate flex flex-1 items-center overflow-hidden px-4 py-20 sm:px-6 sm:py-24">
        <div aria-hidden="true" className="aurora" />
        <div aria-hidden="true" className="aurora-tight" />
        <div
          aria-hidden="true"
          className="grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-60 dark:opacity-40"
        />

        <div className="container mx-auto">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="eyebrow">
              <Compass className="h-3 w-3" />
              Error 404
            </span>

            {/* Big branded 404 */}
            <div className="relative mt-6 select-none">
              <span className="bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text font-heading text-[7.5rem] font-black leading-none tracking-[-0.06em] text-transparent drop-shadow-glow sm:text-[10.5rem] dark:from-emerald-300 dark:via-teal-300 dark:to-cyan-400">
                404
              </span>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-8 top-4 h-2.5 w-2.5 animate-float rounded-full bg-emerald-400/80"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-6 top-16 h-2 w-2 animate-float rounded-full bg-cyan-400/80 [animation-delay:1.2s]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 right-10 h-1.5 w-1.5 animate-float rounded-full bg-teal-400/80 [animation-delay:2s]"
              />
            </div>

            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              This link floated away.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-secondary">
              The profile or page you are looking for doesn&apos;t exist, has been
              claimed by another creator, or was moved.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="group w-full rounded-2xl px-6">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Back to Home</span>
                </Button>
              </Link>
              <Link href="/templates" className="w-full sm:w-auto">
                <Button size="lg" className="group w-full rounded-2xl px-6">
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Explore Creators</span>
                </Button>
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-12 w-full border-t border-zinc-200/70 pt-8 dark:border-white/[0.08]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                Or try one of these
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-text-secondary backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-emerald-400/30 dark:hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5 text-emerald-500" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { TestimonialsAndFAQ } from "@/components/marketing/testimonials-faq";
import {
  Sparkles,
  MessageSquare,
  CreditCard,
  LayoutTemplate,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickLinks = [
  {
    href: "/contact",
    icon: MessageSquare,
    title: "Contact support",
    description: "Reach a human — we usually reply within a few hours.",
  },
  {
    href: "/pricing",
    icon: CreditCard,
    title: "Pricing & billing",
    description: "Compare plans, billing cycles, and what is included.",
  },
  {
    href: "/templates",
    icon: LayoutTemplate,
    title: "Templates gallery",
    description: "Preview every layout and find the one that fits your brand.",
  },
];

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-zinc-200/70 pb-14 pt-16 dark:border-white/[0.06] sm:pb-16 sm:pt-24">
          <div aria-hidden="true" className="aurora" />
          <div aria-hidden="true" className="aurora-tight" />
          <div
            aria-hidden="true"
            className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] opacity-50 dark:opacity-30"
          />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow animate-fade-up">
                <Sparkles className="h-3 w-3" />
                Support Center
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                How can we{" "}
                <span className="text-gradient-ink">help you today?</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                Answers about plans, templates, analytics, and everything in between.
                If you cannot find what you need, our team is one message away.
              </p>
            </div>

            {/* Quick help cards */}
            <div className="mx-auto mt-12 grid max-w-4xl animate-fade-up grid-cols-1 gap-4 [animation-delay:240ms] md:grid-cols-3">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="panel card-lift group relative flex flex-col p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600 transition-transform duration-300 ease-out-expo group-hover:scale-105 dark:text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-text-secondary/50 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-300" />
                    </div>
                    <h2 className="mt-4 font-heading text-base font-bold text-foreground">
                      {link.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {link.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <TestimonialsAndFAQ />

        {/* Closing CTA */}
        <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="container mx-auto">
            <div className="border-gradient glint relative isolate overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-lift sm:p-12">
              <div aria-hidden="true" className="aurora" />
              <div className="relative mx-auto max-w-xl">
                <h2 className="text-balance font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground">
                  Ready when you are.
                </h2>
                <p className="mx-auto mt-3 text-[15px] leading-relaxed text-text-secondary">
                  Claim your link, pick a template, and publish a profile that feels
                  unmistakably yours.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="group w-full rounded-2xl px-7">
                      Get started free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6">
                      Contact support
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

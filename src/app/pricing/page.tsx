import React from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialsAndFAQ } from "@/components/marketing/testimonials-faq";
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const assurances = [
  "Free forever plan",
  "No hidden fees",
  "Cancel anytime",
];

const included = [
  {
    icon: Zap,
    title: "Unlimited profile views",
    description: "Your public page never gets throttled, whatever plan you are on.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "SSL hosting, URL sanitization, and privacy-friendly analytics.",
  },
  {
    icon: Sparkles,
    title: "Every template included",
    description: "Start with any layout — switch freely without losing your links.",
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden pb-10 pt-16 sm:pb-12 sm:pt-24">
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
                Pricing & Plans
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                Simple pricing.{" "}
                <span className="text-gradient-ink">Serious upside.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                Start for free and upgrade when your audience grows. Every plan is
                designed to make your link the hardest-working page you own.
              </p>
              <div className="mt-7 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 [animation-delay:240ms]">
                {assurances.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PricingSection showHeading={false} />

        {/* Included in every plan */}
        <section className="relative isolate overflow-hidden border-t border-zinc-200/70 bg-surface/40 py-16 dark:border-white/[0.06] dark:bg-white/[0.012] sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <span className="eyebrow">
                <ShieldCheck className="h-3 w-3" />
                Included in every plan
              </span>
              <h2 className="mt-5 font-heading text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                No fine print. No surprises.
              </h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
              {included.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="panel card-lift group p-6">
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600 transition-transform duration-300 ease-out-expo group-hover:scale-105 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
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
                  Not sure which plan fits?
                </h2>
                <p className="mx-auto mt-3 text-[15px] leading-relaxed text-text-secondary">
                  Start on the free plan — you can upgrade the moment you need deeper
                  analytics or branded profiles.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="group w-full rounded-2xl px-7 sm:w-auto">
                      Start free
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6 sm:w-auto">
                      Talk to our team
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

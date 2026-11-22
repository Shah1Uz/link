import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { InteractiveHero } from "@/components/marketing/interactive-hero";
import { FeaturesShowcase } from "@/components/marketing/features-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialsAndFAQ } from "@/components/marketing/testimonials-faq";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        <InteractiveHero />
        <FeaturesShowcase />
        <HowItWorks />
        <PricingSection />
        <TestimonialsAndFAQ />

        {/* Closing CTA */}
        <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="container mx-auto">
            <div className="border-gradient glint relative isolate overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-lift sm:p-14">
              <div aria-hidden="true" className="aurora" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/[0.07] via-transparent to-cyan-500/[0.05]"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
              />

              <div className="relative mx-auto max-w-2xl">
                <span className="eyebrow">
                  <Sparkles className="h-3 w-3" />
                  Start in under 2 minutes
                </span>
                <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  Your whole world,{" "}
                  <span className="text-gradient-ink">one link away.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary sm:text-base">
                  Join 250,000+ creators building a home for everything they make. Free
                  forever, no credit card required.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up">
                    <Button size="lg" className="group w-full rounded-2xl px-8 shadow-glow sm:w-auto">
                      <span>Claim your BioSpace link</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6 sm:w-auto">
                      Compare plans
                    </Button>
                  </Link>
                </div>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  {["Free forever plan", "No credit card required", "Cancel anytime"].map(
                    (item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                        {item}
                      </span>
                    )
                  )}
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

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, UserPlus, Sliders, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    title: "Claim your unique link",
    description:
      "Sign up in 30 seconds and secure your personal biospace.com/username before someone else does.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Add your links & customize",
    description:
      "Connect YouTube, Instagram, GitHub, newsletters, or shop URLs. Choose from 20+ designer templates.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Share everywhere & analyze",
    description:
      "Place your link in social bios, email signatures, or print your QR code. Watch clicks grow in real-time.",
    icon: Share2,
  },
];

const assurances = ["No credit card required", "Free forever plan", "Setup in under 2 minutes"];

export function HowItWorks() {
  return (
    <section className="section-pad relative isolate overflow-hidden">
      <div aria-hidden="true" className="aurora opacity-60" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-10 -z-10 h-[380px] w-[46rem] max-w-[95vw] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-500/[0.09] via-teal-500/[0.04] to-transparent blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-xl text-center sm:mb-16">
          <span className="eyebrow">
            <Sparkles className="h-3 w-3" />
            Simple 3-Step Setup
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            How <span className="text-gradient-ink">BioSpace</span> works
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-text-secondary sm:text-base">
            From registration to public profile in under 2 minutes.
          </p>
        </div>

        <div className="relative">
          {/* Mobile vertical connector */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-12 left-6 top-8 w-px bg-gradient-to-b from-emerald-500/50 via-teal-500/25 to-transparent md:hidden"
          />
          {/* Desktop horizontal connector */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-6 hidden h-px bg-gradient-to-r from-emerald-500/10 via-emerald-500/40 to-cyan-500/10 md:block"
          />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="group relative flex flex-col gap-5">
                  {/* Icon bubble */}
                  <div className="relative z-10 flex items-center gap-3 md:flex-col md:items-start md:gap-4">
                    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-background text-emerald-600 shadow-soft ring-1 ring-white/60 transition-transform duration-300 ease-out-expo group-hover:scale-105 dark:border-emerald-400/20 dark:text-emerald-300 dark:ring-white/5">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-[9px] font-bold text-white shadow-xs ring-2 ring-background">
                        {index + 1}
                      </span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary/80 md:mt-1">
                      Step {item.step}
                    </span>
                  </div>

                  {/* Step card */}
                  <div className="panel card-lift group relative flex-1 overflow-hidden p-6 md:p-7">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -top-4 select-none font-heading text-[4.5rem] font-black leading-none text-foreground/[0.035] dark:text-white/[0.04]"
                    >
                      {item.step}
                    </span>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <h3 className="relative font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
                      {item.title}
                    </h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-5">
          <Link href="/sign-up">
            <Button size="lg" className="group rounded-2xl px-8 font-semibold shadow-glow">
              <span>Create Your Free Bio Link</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {assurances.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary"
              >
                <Check className="h-3.5 w-3.5 text-emerald-500" strokeWidth={3} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

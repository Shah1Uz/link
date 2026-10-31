import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, UserPlus, Sliders, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    title: "Claim your unique link",
    description: "Sign up in 30 seconds and secure your personal biospace.com/username before someone else does.",
    icon: UserPlus,
  },
  {
    step: "02",
    title: "Add your links & customize",
    description: "Connect YouTube, Instagram, GitHub, newsletters, or shop URLs. Choose from 20+ designer templates.",
    icon: Sliders,
  },
  {
    step: "03",
    title: "Share everywhere & analyze",
    description: "Place your link in social bios, email signatures, or print your QR code. Watch clicks grow in real-time.",
    icon: Share2,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Simple 3-Step Setup
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            How BioSpace Works
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            From registration to public profile in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl border border-zinc-200/80 bg-white p-8 dark:border-zinc-800/80 dark:bg-zinc-900/60 shadow-sm"
              >
                <div className="text-4xl font-black text-zinc-200 dark:text-zinc-800 mb-4 select-none">
                  {item.step}
                </div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <Link href="/sign-up">
            <Button size="lg" className="rounded-2xl px-8 group font-semibold">
              <span>Create Your Free Bio Link</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}


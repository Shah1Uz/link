import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Palette,
  BarChart3,
  QrCode,
  FolderTree,
  Calendar,
  Lock,
  Globe2,
  Zap,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Palette,
    title: "Advanced Appearance Editor",
    description:
      "Craft bespoke layouts (Classic, Hero, Cutout, Modern, Glass). Customize backgrounds, gradients, buttons, and high-fashion typography.",
    tile: "from-emerald-400 via-emerald-500 to-teal-600 text-white",
  },
  {
    icon: FolderTree,
    title: "Link Collections & Groups",
    description:
      "Organize dozens of URLs into clean collapsible collections like 'Music Releases', 'Merch', 'Socials', or 'Portfolio'.",
    tile: "from-teal-400 via-teal-500 to-cyan-600 text-white",
  },
  {
    icon: BarChart3,
    title: "Deep Real-Time Analytics",
    description:
      "Gain privacy-friendly insights on total views, link click-through rates, top traffic referrers, device breakdown, and geo distribution.",
    tile: "from-cyan-400 via-sky-500 to-blue-600 text-white",
  },
  {
    icon: QrCode,
    title: "Customizable QR Code Studio",
    description:
      "Generate high-resolution PNG and SVG vector QR codes. Style foregrounds and backgrounds to match your physical cards and flyers.",
    tile: "from-violet-400 via-violet-500 to-fuchsia-600 text-white",
  },
  {
    icon: Calendar,
    title: "Scheduled Publishing & Expiration",
    description:
      "Time-release limited drop links, flash sale announcements, or sponsor campaigns with automatic start and expiration dates.",
    tile: "from-amber-300 via-amber-400 to-orange-500 text-amber-950",
  },
  {
    icon: Globe2,
    title: "Platform Auto-Detection",
    description:
      "Paste any URL and BioSpace instantly detects Instagram, TikTok, YouTube, Telegram, Spotify, GitHub, and 20+ other networks.",
    tile: "from-emerald-300 via-teal-400 to-cyan-500 text-teal-950",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "Built with strict URL scheme sanitization, server-side authentication, role-based controls, and immutable admin audit logging.",
    tile: "from-rose-400 via-rose-500 to-pink-600 text-white",
  },
  {
    icon: Zap,
    title: "Sub-Second Global Speeds",
    description:
      "Engineered with Next.js Server Components and edge caching for lighting-fast profile loading on any mobile network.",
    tile: "from-cyan-300 via-cyan-400 to-teal-500 text-cyan-950",
  },
];

const featuredIndexes = [0, 5];

export function FeaturesShowcase() {
  return (
    <section className="section-pad relative isolate overflow-hidden border-y border-zinc-200/70 bg-surface/40 dark:border-white/[0.06] dark:bg-white/[0.012]">
      <div
        aria-hidden="true"
        className="dot-pattern pointer-events-none absolute inset-0 -z-10 opacity-50 dark:opacity-30"
      />

      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
          <span className="eyebrow">
            <Sparkles className="h-3 w-3" />
            Built for Modern Creators
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Everything you need to{" "}
            <span className="text-gradient-ink">grow your audience</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
            BioSpace combines the simplicity of a minimalist links page with the deep
            customization, analytics, and speed expected by modern creators and agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((item, index) => {
            const Icon = item.icon;
            const featured = featuredIndexes.includes(index);
            return (
              <article
                key={item.title}
                className={cn(
                  "panel card-lift group relative flex flex-col overflow-hidden p-6 sm:p-7",
                  featured && "glint md:col-span-2"
                )}
              >
                {/* Hover wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-cyan-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                {/* Corner glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex items-start justify-between">
                  <span
                    className={cn(
                      "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-out-expo group-hover:-rotate-3 group-hover:scale-105",
                      item.tile
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <span className="font-heading text-[11px] font-bold tracking-[0.14em] text-text-secondary/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mt-5 font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
                  {item.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>

                <div className="relative mt-5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700/0 transition-colors duration-300 group-hover:text-emerald-700 dark:text-emerald-300/0 dark:group-hover:text-emerald-300">
                  <span>Included in every plan</span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </article>
            );
          })}

          {/* CTA card closes out the bento grid */}
          <article className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.1] via-surface/70 to-cyan-500/[0.08] p-6 shadow-soft backdrop-blur-xl transition-shadow duration-300 hover:shadow-lift dark:border-emerald-400/20 dark:from-emerald-400/[0.09] dark:via-white/[0.02] dark:to-cyan-400/[0.06] sm:p-7 md:col-span-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-3xl"
            />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" />
                All of this, out of the box
              </span>
              <h3 className="mt-4 font-heading text-xl font-bold tracking-[-0.02em] text-foreground sm:text-2xl">
                Ready to build your corner of the internet?
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
                Launch a profile that looks custom-built in minutes — no designers,
                no code, no compromises.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap items-center gap-2.5">
              <Link href="/sign-up">
                <Button size="sm" className="group/cta rounded-xl">
                  Start for free
                  <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/templates">
                <Button size="sm" variant="outline" className="rounded-xl">
                  Explore templates
                </Button>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

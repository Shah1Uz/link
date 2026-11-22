import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  Check,
  Users,
  Smartphone,
  SlidersHorizontal,
  Palette,
  Star,
} from "lucide-react";

export const dynamic = "force-dynamic";

const templatePerks = [
  {
    icon: Smartphone,
    title: "Pixel-perfect on every screen",
    description:
      "Each layout is mobile-tuned first, then scaled gracefully up to ultra-wide desktops.",
  },
  {
    icon: SlidersHorizontal,
    title: "Switch without losing data",
    description:
      "Your links, collections, and bio live separately from the theme — swap freely, anytime.",
  },
  {
    icon: Palette,
    title: "Fully themeable",
    description:
      "Every template exposes colors, gradients, radii, and typography so it becomes truly yours.",
  },
];

export default async function TemplatesGalleryPage() {
  const templates = await prisma.template.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { useCount: "desc" }],
  });

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
            className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] opacity-50 dark:opacity-30"
          />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow animate-fade-up">
                <Sparkles className="h-3 w-3" />
                Designer Templates
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl lg:text-6xl">
                20+ handcrafted{" "}
                <span className="text-gradient-ink">themes.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                Every template is pixel-perfect, mobile-optimized, and fully
                customizable. Switch anytime without re-entering your links.
              </p>
              <div className="mt-7 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 [animation-delay:240ms]">
                {[
                  `${templates.length || "20+"} live templates`,
                  "4 layout systems",
                  "Free to preview",
                ].map((item) => (
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

        {/* Gallery */}
        <section className="section-pad relative isolate overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6">
            {templates.length === 0 ? (
              <div className="panel mx-auto max-w-lg p-10 text-center">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  Templates are on the way
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  Our design team is polishing the next collection. Check back soon, or
                  start with the default layout.
                </p>
                <Link href="/sign-up" className="mt-6 inline-block">
                  <Button className="rounded-xl">Get started free</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {templates.map((tpl) => {
                  let styles: {
                    backgroundColor?: string;
                    textColor?: string;
                    buttonColor?: string;
                    buttonTextColor?: string;
                    buttonRadius?: string;
                    backgroundGradient?: string;
                  } = {
                    backgroundColor: "#0f172a",
                    textColor: "#fff",
                    buttonColor: "#22c55e",
                    buttonRadius: "12px",
                    backgroundGradient: "",
                  };
                  try {
                    styles = JSON.parse(tpl.stylesJson);
                  } catch {}

                  const bgStyle = styles.backgroundGradient
                    ? { background: styles.backgroundGradient }
                    : { backgroundColor: styles.backgroundColor || "#0f172a" };

                  return (
                    <article
                      key={tpl.id}
                      className="panel card-lift group relative flex flex-col overflow-hidden p-3"
                    >
                      {/* Miniature rendered preview card */}
                      <div
                        className="relative flex h-60 w-full select-none flex-col items-center justify-between overflow-hidden rounded-2xl p-4 text-center shadow-inner ring-1 ring-inset ring-white/10"
                        style={{ ...bgStyle, color: styles.textColor || "#fff" }}
                      >
                        {/* Subtle sheen */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        />

                        {/* Top status */}
                        <div className="relative flex w-full items-center justify-between text-[9px] font-semibold uppercase tracking-[0.12em] opacity-70">
                          <span>{tpl.layout}</span>
                          <div className="flex items-center gap-1">
                            {tpl.isFeatured && (
                              <span className="flex items-center gap-0.5 rounded-full bg-amber-400/90 px-1.5 py-0.5 text-[8px] font-bold text-amber-950">
                                <Star className="h-2 w-2 fill-amber-950" />
                                FEATURED
                              </span>
                            )}
                            {tpl.isPro && (
                              <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[8px] font-bold text-black">
                                PRO
                              </span>
                            )}
                            {!tpl.isPro && !tpl.isFeatured && (
                              <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] font-bold">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Miniature Avatar & Name */}
                        <div className="relative flex flex-col items-center">
                          <div className="mb-1.5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-[10px] font-bold">
                            BIO
                          </div>
                          <div className="text-xs font-bold">{tpl.name}</div>
                          <div className="text-[10px] opacity-75">@{tpl.slug}</div>
                        </div>

                        {/* Miniature Links */}
                        <div className="relative w-full space-y-1.5 px-2">
                          <div
                            className="w-full truncate py-1.5 text-[10px] font-semibold shadow-sm"
                            style={{
                              backgroundColor: styles.buttonColor || "#fff",
                              color: styles.buttonTextColor || "#000",
                              borderRadius: styles.buttonRadius || "8px",
                            }}
                          >
                            Featured Work & Updates
                          </div>
                          <div
                            className="w-full truncate py-1.5 text-[10px] font-semibold opacity-90 shadow-sm"
                            style={{
                              backgroundColor: styles.buttonColor || "#fff",
                              color: styles.buttonTextColor || "#000",
                              borderRadius: styles.buttonRadius || "8px",
                            }}
                          >
                            Follow My Journey
                          </div>
                        </div>
                      </div>

                      {/* Info below */}
                      <div className="flex flex-1 flex-col pt-4">
                        <div>
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <h2 className="truncate font-heading text-base font-bold text-foreground">
                              {tpl.name}
                            </h2>
                            <Badge variant="outline" className="shrink-0 text-[10px]">
                              {tpl.category}
                            </Badge>
                          </div>
                          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-text-secondary">
                            {tpl.description}
                          </p>
                        </div>

                        <div className="mb-auto flex items-center gap-1.5 text-[10px] font-medium text-text-secondary/80">
                          <Users className="h-3 w-3" />
                          <span>Used by {tpl.useCount.toLocaleString()} creators</span>
                        </div>

                        <Link href={`/sign-up?template=${tpl.slug}`} className="mt-4 block">
                          <Button
                            variant="default"
                            size="sm"
                            className="group/btn w-full rounded-xl font-semibold"
                          >
                            <span>Use This Template</span>
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Perks */}
        <section className="relative isolate overflow-hidden border-t border-zinc-200/70 bg-surface/40 py-16 dark:border-white/[0.06] dark:bg-white/[0.012] sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <span className="eyebrow">
                <Sparkles className="h-3 w-3" />
                Built on a real design system
              </span>
              <h2 className="mt-5 font-heading text-2xl font-extrabold tracking-[-0.03em] text-foreground sm:text-3xl">
                A template is just the starting point.
              </h2>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-3">
              {templatePerks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.title} className="panel card-lift group p-6">
                    <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-600 transition-transform duration-300 ease-out-expo group-hover:scale-105 dark:text-emerald-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading text-base font-bold text-foreground">
                      {perk.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                      {perk.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 sm:pb-32">
          <div className="container mx-auto">
            <div className="border-gradient glint relative isolate overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-lift sm:p-12">
              <div aria-hidden="true" className="aurora" />
              <div className="relative mx-auto max-w-xl">
                <h2 className="text-balance font-heading text-3xl font-extrabold tracking-[-0.03em] text-foreground">
                  Pick a template. Make it yours.
                </h2>
                <p className="mx-auto mt-3 text-[15px] leading-relaxed text-text-secondary">
                  Claim your username, choose a layout, and publish in under two
                  minutes — no design skills required.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link href="/sign-up" className="w-full sm:w-auto">
                    <Button size="lg" className="group w-full rounded-2xl px-7">
                      Claim your link
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/features" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full rounded-2xl px-6">
                      See all features
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Star, ChevronDown, Sparkles, Quote, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote:
      "BioSpace doubled my YouTube and newsletter conversion rates in week one. The templates look like custom design work from a top studio.",
    author: "Elena Rostova",
    role: "Tech YouTuber & Indie Hacker",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote:
      "The scheduled links feature is pure gold for limited fashion drops. I set the expiry timer and go to sleep without worrying about dead inventory links.",
    author: "Marcus Chen",
    role: "Streetwear Brand Founder",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    quote:
      "Legacy link-in-bio tools felt stale and generic. Switching to BioSpace gave my agency's client roster the premium aesthetic that matches our branding standards.",
    author: "Sophie Laurent",
    role: "Creative Director at Studio Luxe",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

const faqs = [
  {
    q: "Can I use BioSpace for free?",
    a: "Yes! BioSpace offers a generous Starter Free plan that allows you to claim your unique URL (biospace.com/yourname), add up to 10 active links, pick from standard templates, and view basic analytics forever.",
  },
  {
    q: "How is BioSpace different from legacy link-in-bio tools?",
    a: "BioSpace offers a more polished modern design aesthetic, full layout customization (Hero, Banner, Glass, Cutout, Modern), link scheduling, deep referrer analytics, vector QR code export, and a much cleaner creator experience.",
  },
  {
    q: "Can I schedule links to publish and expire automatically?",
    a: "Yes! Pro users can set exact start and end timestamps for any link. This is ideal for ticket sales, podcast launches, sponsor promotions, and product drops.",
  },
  {
    q: "Can I switch templates without losing my links?",
    a: "Absolutely. Your links, collections, and profile bio are preserved independently of your theme. You can switch between all 20+ templates with a single click at any time.",
  },
  {
    q: "How do custom QR codes work?",
    a: "Every BioSpace profile comes with an automatically generated QR code that links directly to your public page. You can customize the foreground color, background color, and download it in high-res PNG or scalable SVG format.",
  },
  {
    q: "Is there an admin moderation system?",
    a: "Yes. BioSpace features a comprehensive server-side admin dashboard with user management, reported link moderation, audit logs, template editors, and platform settings.",
  },
];

export function TestimonialsAndFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="section-pad relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-zinc-300/60 to-transparent dark:via-white/10"
      />

      <div className="container mx-auto px-4 sm:px-6">
        {/* Testimonials */}
        <div className="mx-auto mb-14 max-w-xl text-center sm:mb-16">
          <span className="eyebrow">
            <Sparkles className="h-3 w-3" />
            Loved By Creators
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Hear from <span className="text-gradient-ink">our community</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-foreground">4.9/5</span>
            <span className="text-sm text-text-secondary">from 2,400+ creator reviews</span>
          </div>
        </div>

        <div className="mb-24 grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <figure
              key={idx}
              className="panel card-lift group relative flex flex-col justify-between overflow-hidden p-7"
            >
              <Quote
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 fill-emerald-500/[0.05] text-emerald-500/[0.06] transition-colors duration-300 group-hover:fill-emerald-500/[0.08] dark:fill-emerald-400/[0.06] dark:text-emerald-400/[0.07]"
                strokeWidth={1}
              />
              <div className="relative">
                <div className="mb-4 flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-text-secondary">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>
              <figcaption className="relative mt-6 flex items-center gap-3 border-t border-zinc-200/70 pt-5 dark:border-white/[0.07]">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-background"
                />
                <div>
                  <h4 className="font-heading text-sm font-bold text-foreground">
                    {t.author}
                  </h4>
                  <p className="text-xs text-text-secondary">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div id="faq" className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="eyebrow">
              <MessageSquare className="h-3 w-3" />
              Support Center
            </span>
            <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] text-text-secondary">
              Got questions? We have got clear answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all duration-300",
                    isOpen
                      ? "border-emerald-500/30 bg-white shadow-soft dark:border-emerald-400/25 dark:bg-white/[0.045]"
                      : "border-zinc-200/80 bg-white/60 hover:border-zinc-300 dark:border-white/[0.08] dark:bg-white/[0.025] dark:hover:border-white/[0.15]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500/40"
                  >
                    <span className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-colors duration-300",
                          isOpen
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-zinc-900/[0.05] text-text-secondary dark:bg-white/[0.06]"
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15px] font-bold leading-snug tracking-[-0.01em] text-foreground">
                        {faq.q}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                        isOpen
                          ? "rotate-180 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : "border-zinc-200/80 text-text-secondary dark:border-white/[0.1]"
                      )}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      id={`faq-panel-${index}`}
                      className="animate-in fade-in px-5 pb-5 pl-[3.65rem] text-sm leading-relaxed text-text-secondary duration-200"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still have questions */}
          <div className="panel mt-8 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row sm:p-7">
            <div className="flex items-center gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-glow-sm ring-1 ring-inset ring-white/20">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-bold text-foreground">
                  Still curious? We are happy to help.
                </h3>
                <p className="text-sm text-text-secondary">
                  Our team typically replies within a few hours.
                </p>
              </div>
            </div>
            <Link href="/contact" className="w-full sm:w-auto">
              <Button variant="outline" className="group w-full rounded-xl sm:w-auto">
                Contact support
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

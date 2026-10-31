"use client";

import React, { useState } from "react";
import { Star, ChevronDown, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

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
      "Linktree felt stale and generic. Switching to BioSpace gave my agency's client roster the premium aesthetic that matches our branding standards.",
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
    q: "How does BioSpace compare to Linktree?",
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
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Testimonials */}
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Loved By Creators
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Hear from our community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{t.author}</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div id="faq" className="max-w-3xl mx-auto pt-8">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Got questions? We have got clear answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between text-left text-base font-bold text-zinc-900 dark:text-zinc-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-zinc-500 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-emerald-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


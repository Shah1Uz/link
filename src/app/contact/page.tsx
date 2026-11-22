"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  User,
  Tag,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const supportPoints = [
  {
    icon: Clock,
    title: "Fast replies",
    description: "We typically respond within 2–4 business hours.",
  },
  {
    icon: ShieldCheck,
    title: "No bots, no scripts",
    description: "A real product specialist reads and answers every message.",
  },
  {
    icon: Sparkles,
    title: "Partnerships welcome",
    description: "Creators, agencies, and brands — let us build something together.",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Message sent! Our support team will get back to you shortly.");
    }, 800);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden pb-12 pt-16 sm:pb-14 sm:pt-24">
          <div aria-hidden="true" className="aurora" />
          <div aria-hidden="true" className="aurora-tight" />
          <div
            aria-hidden="true"
            className="grid-pattern pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] opacity-50 dark:opacity-30"
          />

          <div className="container mx-auto px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow animate-fade-up">
                <MessageSquare className="h-3 w-3" />
                Contact
              </span>
              <h1 className="mt-5 animate-fade-up text-balance text-4xl font-extrabold leading-[1.08] tracking-[-0.04em] text-foreground [animation-delay:80ms] sm:text-5xl">
                Get in <span className="text-gradient-ink">touch.</span>
              </h1>
              <p className="mx-auto mt-4 animate-fade-up text-base leading-relaxed text-text-secondary [animation-delay:160ms] sm:text-lg">
                Have questions or feedback? We are here to help.
              </p>
            </div>
          </div>
        </section>

        <section className="relative isolate overflow-hidden pb-24 sm:pb-32">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
              {/* Support info */}
              <div className="animate-fade-up space-y-4 [animation-delay:220ms] lg:col-span-2">
                <div className="panel glint relative overflow-hidden p-6 sm:p-7">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/10 blur-2xl"
                  />
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-glow-sm ring-1 ring-inset ring-white/20">
                    <Mail className="h-5 w-5" />
                  </span>
                  <h2 className="mt-4 font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
                    Talk to a human
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                    Prefer email? Reach us directly and we will pick it up from there.
                  </p>
                  <a
                    href="mailto:support@biospace.com"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    support@biospace.com
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>

                  <div className="mt-6 space-y-4 border-t border-zinc-200/70 pt-5 dark:border-white/[0.08]">
                    {supportPoints.map((point) => {
                      const Icon = point.icon;
                      return (
                        <div key={point.title} className="flex gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-600 dark:text-emerald-300">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-foreground">
                              {point.title}
                            </h3>
                            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
                              {point.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="panel p-6">
                  <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-foreground">
                    <HelpCircle className="h-4 w-4 text-emerald-500" />
                    Looking for quick answers?
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                    Most questions are already answered in our support center.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/faq">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        Browse FAQ
                      </Button>
                    </Link>
                    <Link href="/pricing">
                      <Button variant="ghost" size="sm" className="rounded-lg">
                        Pricing & plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Form */}
              <Card className="animate-fade-up p-6 shadow-soft [animation-delay:300ms] sm:p-8 lg:col-span-3">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-glow-sm">
                      <CheckCircle2 className="h-8 w-8" />
                    </span>
                    <h3 className="mt-5 font-heading text-xl font-bold text-foreground">
                      Message delivered
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                      Thank you for reaching out. We typically reply within 2–4 hours.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 rounded-xl"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 border-b border-zinc-200/70 pb-5 dark:border-white/[0.08]">
                      <h2 className="font-heading text-lg font-bold tracking-[-0.02em] text-foreground">
                        Send us a message
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary">
                        Fill in the details below and we will get back to you shortly.
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="mb-1.5 block text-xs font-semibold text-foreground"
                        >
                          Your Name
                        </label>
                        <Input
                          id="contact-name"
                          required
                          placeholder="Jane Doe"
                          leftIcon={<User className="h-4 w-4" />}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="mb-1.5 block text-xs font-semibold text-foreground"
                        >
                          Email Address
                        </label>
                        <Input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="jane@example.com"
                          leftIcon={<Mail className="h-4 w-4" />}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-subject"
                          className="mb-1.5 block text-xs font-semibold text-foreground"
                        >
                          Subject
                        </label>
                        <Input
                          id="contact-subject"
                          required
                          placeholder="Partnership inquiry / Support question"
                          leftIcon={<Tag className="h-4 w-4" />}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-message"
                          className="mb-1.5 block text-xs font-semibold text-foreground"
                        >
                          Message
                        </label>
                        <Textarea
                          id="contact-message"
                          required
                          placeholder="How can we assist you today?"
                          rows={4}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="group w-full rounded-xl"
                        isLoading={loading}
                      >
                        <Send className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span>Send Message</span>
                      </Button>
                      <p className="text-center text-[11px] text-text-secondary">
                        By sending this message you agree to our{" "}
                        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
                          privacy policy
                        </Link>
                        .
                      </p>
                    </form>
                  </>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

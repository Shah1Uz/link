import React from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { SignInHelper } from "@/components/auth/sign-in-helper";
import {
  Sparkles,
  ShieldAlert,
  BarChart3,
  Globe2,
  Palette,
  ArrowLeft,
  ArrowRight,
  Lock,
} from "lucide-react";

const valueBullets = [
  {
    icon: Palette,
    title: "Beautiful bio pages",
    copy: "Premium themes, custom colors and layouts that feel unmistakably yours.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    copy: "Track views, clicks and audience growth the moment it happens.",
  },
  {
    icon: Globe2,
    title: "Custom domains",
    copy: "Connect your own domain with automatic SSL and DNS verification.",
  },
];

const stats = [
  { value: "20+", label: "Social platforms" },
  { value: "10", label: "Theme categories" },
  { value: "3", label: "Languages" },
];

export default function SignInPage() {
  return (
    <main className="dark relative isolate min-h-[100dvh] overflow-hidden bg-background text-foreground">
      {/* Ambient aurora backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 isolate overflow-hidden"
      >
        <div className="aurora" />
        <div className="grid-pattern absolute inset-0 opacity-50 dark:opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      <div className="relative grid min-h-[100dvh] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative isolate hidden flex-col justify-between overflow-hidden border-r border-white/[0.06] px-10 py-8 lg:flex xl:px-14 xl:py-12">
          <div className="aurora" />
          <div
            aria-hidden="true"
            className="grid-pattern absolute inset-0 opacity-40 dark:opacity-25"
          />

          <div className="relative flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-bold tracking-tight text-white"
            >
              <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-glow">
                <Sparkles className="h-5 w-5" />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/35 to-transparent"
                />
              </span>
              <span className="font-heading text-xl font-extrabold tracking-[-0.03em]">
                Bio<span className="text-gradient">Space</span>
              </span>
            </Link>

            <span className="eyebrow border-white/10 bg-white/[0.04] text-emerald-300">
              <Lock className="h-3 w-3" />
              Secure access
            </span>
          </div>

          <div className="relative flex max-w-lg flex-1 flex-col justify-center py-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300/90">
              Welcome back
            </p>
            <h1 className="mt-4 font-heading text-3xl font-extrabold leading-[1.06] tracking-[-0.045em] text-white xl:text-[2.75rem]">
              Your entire world,
              <br />
              <span className="text-gradient">in one link.</span>
            </h1>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-zinc-400">
              Sign in to manage your public bio link, track audience activity, and
              keep every creation connected in one beautiful profile.
            </p>

            <ul className="mt-7 space-y-3.5">
              {valueBullets.map((bullet) => {
                const Icon = bullet.icon;
                return (
                  <li key={bullet.title} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{bullet.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-zinc-400">
                        {bullet.copy}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/[0.08] pt-5">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-xl font-extrabold tracking-[-0.03em] text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[11px] text-zinc-500">
              &copy; {new Date().getFullYear()} BioSpace. Built for creators,
              artists and brands.
            </p>
          </div>
        </section>

        {/* Auth panel */}
        <section className="relative flex flex-col items-center justify-center px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 font-bold tracking-tight text-white lg:hidden"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-emerald-950 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-heading text-xl font-extrabold tracking-[-0.03em]">
              Bio<span className="text-gradient">Space</span>
            </span>
          </Link>

          <div className="w-full max-w-md">
            <div className="mb-5 flex items-center justify-between gap-3 px-1">
              <div>
                <h2 className="font-heading text-lg font-extrabold tracking-[-0.02em] text-white">
                  Sign in to BioSpace
                </h2>
                <p className="mt-0.5 text-xs text-zinc-400">
                  Continue to your creator workspace
                </p>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300">
                <ShieldAlert className="h-4 w-4" />
              </span>
            </div>

            {/* Quick Session Helper if already signed in or switching accounts */}
            <SignInHelper />

            {/* Clerk card bezel */}
            <div className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.02] p-1.5 shadow-[0_40px_120px_-50px_rgba(16,185,129,0.45)] backdrop-blur-sm">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
              />
              <SignIn
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: "#10b981", // emerald-500
                    colorText: "#ffffff",
                    colorTextSecondary: "#a1a1aa", // zinc-400
                    colorBackground: "#18181b", // zinc-900
                    colorInputBackground: "#27272a", // zinc-800
                    colorInputText: "#ffffff",
                    borderRadius: "0.875rem",
                  },
                }}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/dashboard"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 font-semibold text-zinc-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to home
              </Link>
              <span aria-hidden="true" className="text-zinc-700">
                В·
              </span>
              <Link href="/privacy" className="transition-colors hover:text-zinc-300">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-zinc-300">
                Terms
              </Link>
            </div>

            <Link
              href="/sign-up"
              className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              <span>New to BioSpace? Create an account</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Github,
  Twitter,
  Youtube,
  Instagram,
  Heart,
  ArrowUpRight,
} from "lucide-react";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/templates", label: "Templates" },
      { href: "/pricing", label: "Pricing Plans" },
      { href: "/shahuztech", label: "Sample Profile" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Support" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

const socials = [
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "https://github.com", label: "GitHub", icon: Github },
  { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  { href: "https://instagram.com", label: "Instagram", icon: Instagram },
];

export function MarketingFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-zinc-200/80 bg-surface/40 dark:border-white/[0.08] dark:bg-white/[0.015]">
      {/* Top gradient hairline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
      />
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[72rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500/[0.08] via-teal-500/[0.06] to-cyan-500/[0.08] blur-3xl"
      />

      <div className="container relative mx-auto px-4 pb-10 pt-16 sm:px-6 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand block */}
          <div className="space-y-5 lg:col-span-5">
            <Link
              href="/"
              className="group inline-flex items-center gap-2.5"
              aria-label="BioSpace home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.7rem] bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white shadow-glow-sm ring-1 ring-white/20 transition-transform duration-300 ease-out-expo group-hover:scale-105">
                <Sparkles className="h-[1.15rem] w-[1.15rem]" strokeWidth={2.25} />
              </span>
              <span className="font-heading text-[1.15rem] font-extrabold tracking-[-0.03em] text-foreground">
                Bio<span className="text-gradient-ink">Space</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
              The next-generation Link-in-Bio SaaS platform. Transform your digital
              presence, aggregate your content, and monetize your audience with
              unmatched speed and beauty.
            </p>

            <div className="flex items-center gap-2">
              {socials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200/80 bg-white/70 text-text-secondary shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/30 hover:text-emerald-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:border-emerald-400/30 dark:hover:text-emerald-300"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  {column.title}
                </h4>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-foreground"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3 w-3 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/80 pt-6 sm:flex-row dark:border-white/[0.08]">
          <p className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} BioSpace Technologies Inc. All rights
            reserved.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <Heart className="h-3.5 w-3.5 fill-emerald-500/80 text-emerald-500/80" />
              Crafted with precision for creators worldwide.
            </p>
            <div className="flex items-center gap-4 text-xs font-medium text-text-secondary">
              <Link
                href="/privacy"
                className="transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
              <span aria-hidden="true" className="h-3 w-px bg-border" />
              <Link
                href="/terms"
                className="transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Palette,
    title: "Advanced Appearance Editor",
    description:
      "Craft bespoke layouts (Classic, Hero, Cutout, Modern, Glass). Customize backgrounds, gradients, buttons, and high-fashion typography.",
  },
  {
    icon: FolderTree,
    title: "Link Collections & Groups",
    description:
      "Organize dozens of URLs into clean collapsible collections like 'Music Releases', 'Merch', 'Socials', or 'Portfolio'.",
  },
  {
    icon: BarChart3,
    title: "Deep Real-Time Analytics",
    description:
      "Gain privacy-friendly insights on total views, link click-through rates, top traffic referrers, device breakdown, and geo distribution.",
  },
  {
    icon: QrCode,
    title: "Customizable QR Code Studio",
    description:
      "Generate high-resolution PNG and SVG vector QR codes. Style foregrounds and backgrounds to match your physical cards and flyers.",
  },
  {
    icon: Calendar,
    title: "Scheduled Publishing & Expiration",
    description:
      "Time-release limited drop links, flash sale announcements, or sponsor campaigns with automatic start and expiration dates.",
  },
  {
    icon: Globe2,
    title: "Platform Auto-Detection",
    description:
      "Paste any URL and BioSpace instantly detects Instagram, TikTok, YouTube, Telegram, Spotify, GitHub, and 20+ other networks.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description:
      "Built with strict URL scheme sanitization, server-side authentication, role-based controls, and immutable admin audit logging.",
  },
  {
    icon: Zap,
    title: "Sub-Second Global Speeds",
    description:
      "Engineered with Next.js Server Components and edge caching for lighting-fast profile loading on any mobile network.",
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-24 bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-200/80 dark:border-zinc-800/80">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Built for Modern Creators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
            Everything you need to grow your audience
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed">
            BioSpace combines the simplicity of Linktree with the deep customization, analytics, and speed expected by modern creators and agencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden p-6 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 group-hover:bg-emerald-500 group-hover:text-black transition-colors duration-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}


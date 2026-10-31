import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { Sparkles, Users, Award, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Our Mission</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Empowering creators to own their audience.
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              BioSpace was born out of frustration with clunky, rigid Link-in-Bio tools. We set out to build a platform that feels like high-end bespoke software: fast, gorgeous, and uncompromising on performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="p-6 text-center">
              <Users className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1">250k+</div>
              <div className="text-xs text-zinc-500">Active Creators Worldwide</div>
            </Card>
            <Card className="p-6 text-center">
              <Award className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1">99.99%</div>
              <div className="text-xs text-zinc-500">Global Profile Uptime</div>
            </Card>
            <Card className="p-6 text-center">
              <Shield className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <div className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1">100M+</div>
              <div className="text-xs text-zinc-500">Monthly Page Hits Tracked</div>
            </Card>
          </div>

          <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 space-y-6 text-base leading-relaxed">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Why BioSpace?</h2>
            <p>
              In modern social media, your link in bio is your digital storefront. Whether you are a musician dropping a new album, a software engineer showcasing GitHub repos, or an influencer launching a lifestyle brand, your profile needs to load instantly and represent your unique identity.
            </p>
            <p>
              We prioritize typography, mobile ergonomics, and data privacy. Unlike legacy providers, we provide full URL validation, fine-grained link scheduling, and deep analytics without selling visitor data.
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}


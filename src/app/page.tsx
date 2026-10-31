import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { InteractiveHero } from "@/components/marketing/interactive-hero";
import { FeaturesShowcase } from "@/components/marketing/features-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialsAndFAQ } from "@/components/marketing/testimonials-faq";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1">
        <InteractiveHero />
        <FeaturesShowcase />
        <HowItWorks />
        <PricingSection />
        <TestimonialsAndFAQ />
      </main>
      <MarketingFooter />
    </div>
  );
}


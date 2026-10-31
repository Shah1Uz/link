import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";
import { PricingSection } from "@/components/marketing/pricing-section";
import { TestimonialsAndFAQ } from "@/components/marketing/testimonials-faq";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1">
        <PricingSection />
        <TestimonialsAndFAQ />
      </main>
      <MarketingFooter />
    </div>
  );
}


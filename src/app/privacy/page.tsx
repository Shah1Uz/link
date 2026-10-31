import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
          <h1 className="text-3xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-sm text-zinc-500">Last updated: October 2026</p>
          <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
          <h3>1. Information We Collect</h3>
          <p>
            When you register for BioSpace, we collect information required to deliver your public link-in-bio page, such as your username, display name, biography, profile avatar, and the URLs you choose to publish.
          </p>
          <h3>2. Analytics and Privacy</h3>
          <p>
            BioSpace collects privacy-compliant profile view and link click metrics to provide creators with performance insights. We do not sell your personal data or track visitors across third-party websites.
          </p>
          <h3>3. Data Retention and Deletion</h3>
          <p>
            You have the right to access, export, or delete your account at any time directly through the User Settings dashboard.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}


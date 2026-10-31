import React from "react";
import { MarketingNavbar } from "@/components/layout/marketing-navbar";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNavbar />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
          <h1 className="text-3xl font-extrabold mb-4">Terms of Service</h1>
          <p className="text-sm text-zinc-500">Effective Date: October 2026</p>
          <hr className="my-6 border-zinc-200 dark:border-zinc-800" />
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using BioSpace, you agree to comply with and be bound by these Terms of Service.
          </p>
          <h3>2. User Responsibilities & Prohibited Content</h3>
          <p>
            You agree not to publish any malicious links, phishing URLs, malware, unauthorized copyrighted material, or illegal content. BioSpace maintains automated security checks and manual admin moderation to remove non-compliant content and suspend abusive accounts.
          </p>
          <h3>3. Termination</h3>
          <p>
            BioSpace reserves the right to suspend or terminate accounts that violate our community guidelines or engage in abusive activities.
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}


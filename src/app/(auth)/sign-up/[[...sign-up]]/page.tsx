import React from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Sparkles, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-2xl text-zinc-900 dark:text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md">
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </div>
          <span>Bio<span className="text-emerald-500">Space</span></span>
        </Link>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Claim your unique URL and build your profile in seconds
        </p>
      </div>

      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              card: "rounded-3xl border border-zinc-200/80 shadow-xl dark:border-zinc-800 dark:bg-zinc-900",
              formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-black rounded-xl",
              footerActionLink: "text-emerald-600 hover:text-emerald-500 font-semibold",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/onboarding"
        />

        {/* Demo Fast-Pass Box */}
        <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 text-center dark:bg-emerald-950/20">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
            <UserCheck className="h-4 w-4" />
            <span>Interactive Onboarding Demo</span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
            Want to test the full 8-step interactive onboarding process directly?
          </p>
          <Link href="/onboarding">
            <Button size="sm" className="rounded-xl text-xs font-semibold">
              <span>Start 8-Step Onboarding</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


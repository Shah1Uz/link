import React from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Youtube, Instagram, Heart } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/50 py-16 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-xl text-zinc-900 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <span>Bio<span className="text-emerald-500">Space</span></span>
            </Link>
            <p className="max-w-sm text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              The next-generation Link-in-Bio SaaS platform. Transform your digital presence, aggregate your content, and monetize your audience with unmatched speed and beauty.
            </p>
            <div className="flex items-center gap-3 pt-2 text-zinc-400">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/features" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/templates" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/pricing" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link href="/shahuztech" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Sample Profile</Link></li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Company</h4>
            <ul className="space-y-2.5">
              <li><Link href="/about" className="hover:text-zinc-950 dark:hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/faq" className="hover:text-zinc-950 dark:hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/admin" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200/80 pt-8 sm:flex-row dark:border-zinc-800/80">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} BioSpace Technologies Inc. All rights reserved.
          </p>
          <p className="flex items-center text-xs text-zinc-400">
            Crafted with precision for creators worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}


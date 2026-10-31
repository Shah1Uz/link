"use client";

import React from "react";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { useDashboard } from "@/context/dashboard-context";
import { ExternalLink, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardPreviewPanel() {
  const {
    profile,
    theme,
    links,
    isMobilePreviewOpen,
    setIsMobilePreviewOpen,
  } = useDashboard();

  const enabledLinks = links.filter((l) => l.isEnabled);

  const activeTheme = theme
    ? {
        backgroundColor: theme.backgroundColor,
        backgroundType: theme.backgroundType,
        backgroundGradient: theme.backgroundGradient || undefined,
        buttonStyle: theme.buttonStyle,
        buttonColor: theme.buttonColor,
        buttonTextColor: theme.buttonTextColor,
        buttonBorderColor: theme.buttonBorderColor || undefined,
        buttonRadius: theme.buttonRadius,
        fontHeading: theme.fontHeading,
        textColor: theme.textColor,
        accentColor: theme.accentColor,
      }
    : undefined;

  return (
    <>
      {/* Desktop Sticky Right Column */}
      <aside className="hidden lg:flex flex-col items-center justify-start w-[380px] xl:w-[420px] p-6 border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between w-full px-4 text-xs font-semibold text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Interactive Preview</span>
          </span>
          <a
            href={`/${profile?.username || "shahuztech"}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1"
          >
            <span>Open in Tab</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="transform scale-[0.92] origin-top">
          <PhoneMockup
            displayName={profile?.displayName || "Alex Rivera"}
            username={profile?.username || "shahuztech"}
            bio={profile?.bio || ""}
            avatarUrl={profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
            verified={profile?.verified || false}
            theme={activeTheme}
            links={enabledLinks.map((l) => ({
              id: l.id,
              title: l.title,
              url: l.url,
              icon: l.icon,
              isPinned: l.isPinned,
              clicksCount: l.clicksCount,
            }))}
            interactive={true}
          />
        </div>
      </aside>

      {/* Mobile Drawer / Modal when isMobilePreviewOpen is true */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in">
          <div className="relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsMobilePreviewOpen(false)}
              className="absolute right-2 top-2 z-50 rounded-full bg-zinc-900/80 p-2 text-white hover:bg-black transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="py-6">
              <PhoneMockup
                displayName={profile?.displayName || "Alex Rivera"}
                username={profile?.username || "shahuztech"}
                bio={profile?.bio || ""}
                avatarUrl={profile?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"}
                verified={profile?.verified || false}
                theme={activeTheme}
                links={enabledLinks.map((l) => ({
                  id: l.id,
                  title: l.title,
                  url: l.url,
                  icon: l.icon,
                  isPinned: l.isPinned,
                  clicksCount: l.clicksCount,
                }))}
                interactive={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}


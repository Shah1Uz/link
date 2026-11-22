"use client";

import React from "react";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { ExternalLink, X, Smartphone } from "lucide-react";

export function DashboardPreviewPanel() {
  const { t } = useI18n();
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
        backgroundImage: theme.backgroundImage || undefined,
        backgroundVideo: theme.backgroundVideo || undefined,
        heroBlur: theme.heroBlur || undefined,
        heroFade: theme.heroFade || undefined,
        heroDarken: theme.heroDarken || undefined,
        buttonStyle: theme.buttonStyle,
        buttonColor: theme.buttonColor,
        buttonTextColor: theme.buttonTextColor,
        buttonBorderColor: theme.buttonBorderColor || undefined,
        buttonRadius: theme.buttonRadius,
        fontHeading: theme.fontHeading,
        textColor: theme.textColor,
        accentColor: theme.accentColor,
        showBranding: theme.showBranding,
        stickersEnabled: theme.stickersEnabled,
        stickerId: theme.stickerId,
        stickerUrl: theme.stickerUrl,
        stickerPosition: theme.stickerPosition,
        stickerAnimation: theme.stickerAnimation,
        stickerSize: theme.stickerSize,
        stickerRotation: theme.stickerRotation,
        stickerLink: theme.stickerLink,
        stickerPosX: theme.stickerPosX,
        stickerPosY: theme.stickerPosY,
        wallpaperEffect: theme.wallpaperEffect || undefined,
        wallpaperTint: theme.wallpaperTint !== undefined && theme.wallpaperTint !== null ? Number(theme.wallpaperTint) : undefined,
        wallpaperNoise: theme.wallpaperNoise !== undefined ? Boolean(theme.wallpaperNoise) : undefined,
        gradientStyle: theme.gradientStyle || undefined,
        gradientColor: theme.gradientColor || undefined,
        gradientDirection: theme.gradientDirection || undefined,
      }
    : undefined;

  return (
    <>
      {/* Desktop sticky right column */}
      <aside className="sticky top-0 hidden h-screen w-[22rem] shrink-0 flex-col items-center border-l border-border/70 bg-background/70 px-5 pb-6 pt-4 backdrop-blur-xl xl:flex 2xl:w-[24rem]">
        <div className="mb-3 flex w-full items-center justify-between text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            {t.preview.title}
          </span>
          <a
            href={`/${profile?.username || "shahuztech"}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-text-secondary transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            <span>{t.preview.open}</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex w-full flex-1 items-start justify-center overflow-y-auto overflow-x-hidden pt-1 scrollbar-none">
          <div className="origin-top scale-[0.9] xl:scale-[0.94]">
            <PhoneMockup
              displayName={profile?.displayName || `@${profile?.username || "shahuztech"}`}
              username={profile?.username || "shahuztech"}
              bio={profile?.bio || ""}
              avatarUrl={profile?.avatarUrl || undefined}
              bannerUrl={profile?.bannerUrl}
              layout={profile?.layout || "classic"}
              verified={profile?.verified || false}
              theme={activeTheme}
              links={enabledLinks.map((l) => ({
                id: l.id,
                title: l.title,
                url: l.url,
                icon: l.icon,
                thumbnail: l.thumbnail,
                displayMode: l.displayMode,
                isPinned: l.isPinned,
                clicksCount: l.clicksCount,
              }))}
              interactive={true}
            />
          </div>
        </div>

        <div className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border/70 bg-surface/50 px-3 py-2 text-[10px] font-medium text-text-secondary">
          <Smartphone className="h-3 w-3" />
          <span>{t.preview.desktopNote}</span>
        </div>
      </aside>

      {/* Mobile drawer when isMobilePreviewOpen is true */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm animate-in fade-in xl:hidden">
          <div className="relative max-h-[92vh] overflow-y-auto scrollbar-none">
            <button
              onClick={() => setIsMobilePreviewOpen(false)}
              aria-label={t.common.close}
              className="absolute right-2 top-2 z-50 rounded-full bg-zinc-900/80 p-2 text-white transition-colors hover:bg-black"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="py-6">
              <PhoneMockup
                displayName={profile?.displayName || `@${profile?.username || "shahuztech"}`}
                username={profile?.username || "shahuztech"}
                bio={profile?.bio || ""}
                avatarUrl={profile?.avatarUrl || undefined}
                bannerUrl={profile?.bannerUrl}
                layout={profile?.layout || "classic"}
                verified={profile?.verified || false}
                theme={activeTheme}
                links={enabledLinks.map((l) => ({
                  id: l.id,
                  title: l.title,
                  url: l.url,
                  icon: l.icon,
                  thumbnail: l.thumbnail,
                  displayMode: l.displayMode,
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

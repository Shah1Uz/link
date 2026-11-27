"use client";

import React, { useState } from "react";
import {
  Share2,
  Sparkles,
  Signal,
  Wifi,
  BatteryMedium,
  Music,
  Play,
} from "lucide-react";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { InstagramEmbed } from "@/components/shared/instagram-embed";
import { TikTokEmbed } from "@/components/shared/tiktok-embed";
import { groupLinksWithYouTubeCarousels, formatUrlForHref, getHeroBlurPx, getHeroFadeConfig } from "@/lib/utils";
import { withAlpha } from "@/components/profile/theme-surface";
import { ProfileSticker } from "@/components/profile/profile-sticker";
import { getFontFamilyCss } from "@/lib/fonts-catalog";
import { DynamicFontLoader } from "@/components/shared/dynamic-font-loader";

interface PhoneMockupProps {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string | null;
  layout?: string;
  verified?: boolean;
  theme?: {
    backgroundColor?: string;
    backgroundType?: string;
    backgroundGradient?: string;
    backgroundImage?: string | null;
    backgroundVideo?: string | null;
    buttonStyle?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonBorderColor?: string;
    buttonRadius?: string;
    textColor?: string;
    accentColor?: string;
    fontHeading?: string;
    showBranding?: boolean;
    heroBlur?: string;
    heroFade?: string;
    heroDarken?: string;
    stickersEnabled?: boolean;
    stickerId?: string | null;
    stickerUrl?: string | null;
    stickerPosition?: string | null;
    stickerAnimation?: string | null;
    stickerSize?: string | null;
    stickerRotation?: string | null;
    stickerLink?: string | null;
    stickerPosX?: number | null;
    stickerPosY?: number | null;
    wallpaperEffect?: string | null;
    wallpaperTint?: number | null;
    wallpaperNoise?: boolean | null;
    gradientStyle?: string | null;
    gradientColor?: string | null;
    gradientDirection?: string | null;
    spotifyMusicEnabled?: boolean;
    spotifyTrackTitle?: string | null;
    spotifyTrackArtist?: string | null;
    spotifyTrackImage?: string | null;
    spotifyTrackUrl?: string | null;
    spotifyTrackPreview?: string | null;
    spotifyMusicLayout?: string | null;
  };
  links?: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string | null;
    thumbnail?: string | null;
    displayMode?: string | null;
    isPinned?: boolean;
    clicksCount?: number;
  }>;
  interactive?: boolean;
}

export function PhoneMockup({
  displayName = "@shahuztech",
  username = "shahuztech",
  bio = "Tech entrepreneur, YouTuber & full-stack architect building modern web products. 🚀",
  avatarUrl,
  bannerUrl,
  layout = "classic",
  verified = true,
  theme = {
    backgroundColor: "#000000",
    backgroundType: "gradient",
    backgroundGradient: "linear-gradient(180deg, #000000 0%, #031402 32%, #163a05 65%, #3d7e05 100%)",
    buttonStyle: "filled",
    buttonColor: "#10b981",
    buttonTextColor: "#042f2e",
    buttonBorderColor: "#34d399",
    buttonRadius: "16px",
    textColor: "#ffffff",
    accentColor: "#a3e635",
  },
  links = [
    {
      id: "1",
      title: "YouTube Channel (150k+ Subs)",
      url: "https://youtube.com",
      icon: "youtube",
      isPinned: true,
    },
    {
      id: "2",
      title: "GitHub Portfolio & Open Source",
      url: "https://github.com",
      icon: "github",
      isPinned: false,
    },
    {
      id: "3",
      title: "BioSpace — Next-Gen Link-in-Bio",
      url: "https://biospace.com",
      icon: "website",
      isPinned: true,
    },
    {
      id: "4",
      title: "X / Twitter Tech Threads",
      url: "https://x.com",
      icon: "twitter",
      isPinned: false,
    },
    {
      id: "5",
      title: "Telegram VIP Community",
      url: "https://t.me",
      icon: "telegram",
      isPinned: false,
    },
  ],
  interactive = true,
}: PhoneMockupProps) {
  const [clickedLink, setClickedLink] = useState<string | null>(null);

  const activeVideoUrl =
    theme.backgroundType === "video" && Boolean(theme.backgroundVideo)
      ? theme.backgroundVideo
      : null;
  const classicVideoUrl = activeVideoUrl;

  const backgroundStyle = activeVideoUrl
    ? { backgroundColor: "transparent" }
    : theme.backgroundType === "gradient" && theme.backgroundGradient
      ? { background: theme.backgroundGradient }
      : theme.backgroundColor
        ? { backgroundColor: theme.backgroundColor }
        : { backgroundColor: "#0d1117" };

  return (
    <div className="relative mx-auto w-[300px] select-none sm:w-[340px]">
      {/* Ambient aurora halo behind the device */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-6 -top-6 z-0 rounded-[3rem] bg-gradient-to-tr from-emerald-500/25 via-teal-500/[0.08] to-cyan-500/25 blur-3xl"
      />

      {/* Side hardware buttons */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[13px] top-28 z-20 h-10 w-[3px] rounded-full bg-zinc-700 shadow-sm"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[13px] top-[10.5rem] z-20 h-14 w-[3px] rounded-full bg-zinc-700 shadow-sm"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[13px] top-[9.5rem] z-20 h-20 w-[3px] rounded-full bg-zinc-700 shadow-sm"
      />

      {/* Outer Phone Shell — premium bezel frame */}
      <div className="phone-mockup relative rounded-[3.1rem] bg-zinc-950 p-[7px] ring-1 ring-zinc-700/60">
        {/* Screen Area - Smooth Scrollable */}
        <div className="relative overflow-hidden rounded-[2.65rem] bg-zinc-950 ring-1 ring-white/[0.06]">
          {/* Wallpaper / Classic Layout Background Video with High-Contrast Shield */}
          {activeVideoUrl && (
            <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden rounded-[2.65rem]">
              <video
                autoPlay
                loop
                muted
                playsInline
                className={`h-full w-full object-cover object-center scale-105 transition-all duration-300 ${theme.wallpaperEffect === "mono"
                  ? "grayscale contrast-125"
                  : theme.wallpaperEffect === "blur"
                    ? "blur-md scale-110"
                    : theme.wallpaperEffect === "halftone"
                      ? "contrast-150 brightness-95"
                      : ""
                  }`}
                src={activeVideoUrl}
              />
              <div
                className="absolute inset-0 transition-colors duration-200"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${(Number(theme.wallpaperTint ?? 30) / 100) * 0.75})`,
                }}
              />
              {theme.wallpaperNoise && (
                <div
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              )}
            </div>
          )}

          {/* Status bar */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-3 text-[10px] font-semibold tracking-tight opacity-90"
            style={{ color: theme.textColor || "#ffffff" }}
          >
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryMedium className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute left-1/2 top-2.5 z-30 flex h-6 w-24 -translate-x-1/2 items-center justify-center rounded-full bg-black shadow-[0_2px_10px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.06]">
            <div className="mr-2 h-2.5 w-2.5 rounded-full bg-zinc-900/90" />
            <div className="h-2 w-2 rounded-full bg-blue-950/80 ring-1 ring-blue-500/20" />
          </div>

          <div
            className="relative z-10 flex h-[660px] max-h-[660px] flex-col overflow-y-auto overflow-x-hidden px-4 pb-7 pt-11 text-center transition-all duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-5"
            style={{
              ...backgroundStyle,
              color: theme.textColor || "#ffffff",
              fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            {/* Dynamic Font Loader for the active Heading font */}
            <DynamicFontLoader font={theme.fontHeading} />

            {/* Full-Screen Edge-to-Edge Hero Cover with smooth color gradient fade into theme background */}
            {layout === "hero" && (() => {
              const fadeCfg = getHeroFadeConfig(theme.heroFade);
              const darkenMode = theme.heroDarken || "balanced";
              const topDark = fadeCfg.topDarken(darkenMode);
              const heroSrc =
                avatarUrl ||
                bannerUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";

              return (
                <>
                  {/* Solid backing under hero cover so background wallpaper NEVER shines through */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-72 w-full rounded-t-[2.65rem]"
                    style={{ backgroundColor: theme.backgroundColor || "#000000" }}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-72 w-full overflow-hidden rounded-t-[2.65rem]"
                    style={{
                      maskImage: fadeCfg.maskGradient,
                      WebkitMaskImage: fadeCfg.maskGradient,
                    }}
                  >
                    <img
                      src={heroSrc}
                      alt={displayName}
                      className="h-full w-full object-cover object-top"
                    />

                    {/* Smooth top darken for status bar / icons */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to bottom, rgba(0, 0, 0, ${topDark}) 0%, transparent 65%)`,
                      }}
                    />
                  </div>
                </>
              );
            })()}
            {/* Wallpaper: Image Background with Effect, Tint & Noise */}
            {theme?.backgroundType === "image" && (
              <div
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                style={
                  layout === "hero"
                    ? {
                        maskImage:
                          "linear-gradient(to bottom, transparent 0%, transparent 165px, rgba(0, 0, 0, 0.4) 215px, black 255px, black 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent 0%, transparent 165px, rgba(0, 0, 0, 0.4) 215px, black 255px, black 100%)",
                      }
                    : undefined
                }
              >
                <img
                  src={
                    theme.backgroundImage ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80"
                  }
                  alt="Wallpaper"
                  className={`h-full w-full object-cover transition-all duration-300 ${theme.wallpaperEffect === "mono"
                    ? "grayscale contrast-125"
                    : theme.wallpaperEffect === "blur"
                      ? "blur-md scale-110"
                      : theme.wallpaperEffect === "halftone"
                        ? "contrast-150 brightness-95"
                        : ""
                    }`}
                />
                {theme.wallpaperEffect === "halftone" && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply"
                    style={{
                      backgroundImage: "radial-gradient(circle at center, black 1.5px, transparent 1.6px)",
                      backgroundSize: "6px 6px",
                    }}
                  />
                )}
                <div
                  className="absolute inset-0 transition-colors duration-200"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${(Number(theme.wallpaperTint ?? 20) / 100) * 0.75})`,
                  }}
                />
                {theme.wallpaperNoise && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                  />
                )}
              </div>
            )}

            {/* Wallpaper: Blur Mesh Background */}
            {theme?.backgroundType === "blur" && (
              <div
                className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                style={
                  layout === "hero"
                    ? {
                        maskImage:
                          "linear-gradient(to bottom, transparent 0%, transparent 165px, rgba(0, 0, 0, 0.4) 215px, black 255px, black 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent 0%, transparent 165px, rgba(0, 0, 0, 0.4) 215px, black 255px, black 100%)",
                      }
                    : undefined
                }
              >
                <div className="absolute -inset-10 bg-gradient-to-tr from-lime-800 via-amber-700 to-emerald-900 blur-2xl opacity-90 scale-125" />
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${(Number(theme.wallpaperTint ?? 20) / 100) * 0.6})`,
                  }}
                />
                {theme.wallpaperNoise && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                  />
                )}
              </div>
            )}

            {/* Wallpaper: Pattern Background */}
            {theme?.backgroundType === "pattern" && (
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  backgroundColor: theme.backgroundColor || "#5d7c0b",
                  backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1.5px, transparent 0)",
                  backgroundSize: "12px 12px",
                }}
              />
            )}

            {/* Wallpaper: Subtle Grain Noise for Gradient, Color & Pattern */}
            {theme?.wallpaperNoise &&
              theme?.backgroundType !== "image" &&
              theme?.backgroundType !== "blur" && (
                <div
                  className="pointer-events-none absolute inset-0 z-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
                />
              )}

            {/* Live Sticker Decoration in Mockup */}
            {theme?.stickersEnabled && (
              <ProfileSticker theme={theme} inPreview={true} />
            )}

            {/* Top Header Floating Buttons: Sparkle on left, Share on right */}
            <div className="z-20 mb-2 flex items-center justify-between px-1">
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-2xs backdrop-blur-md transition-colors hover:bg-white/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>

              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/90 shadow-2xs backdrop-blur-md transition-colors hover:bg-white/20">
                <Share2 className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Profile Header by Selected Layout */}
            <div className="flex flex-col items-center">
              {layout === "hero" ? (
                /* HERO LAYOUT: Expansive Full-Screen edge-to-edge cover with smooth gradient fade */
                <div className="mb-2 flex w-full flex-col items-center pt-36 sm:pt-40">
                  <div className="flex items-center justify-center gap-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                    <h2
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] select-none"
                      style={{
                        fontFamily: getFontFamilyCss(theme.fontHeading),
                        color: theme.textColor || "#ffffff",
                      }}
                    >
                      {displayName}
                    </h2>
                    {verified && <VerifiedBadge size="md" />}
                  </div>
                  <p
                    className="text-xs font-semibold opacity-90 drop-shadow-[0_1px_5px_rgba(0,0,0,0.85)]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    @{username}
                  </p>
                </div>
              ) : layout === "banner" ? (
                /* BANNER LAYOUT */
                <div className="relative mb-4 flex w-full flex-col items-center">
                  <div className="relative h-20 w-full overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-emerald-500/30 shadow-xs">
                    <img
                      src={
                        bannerUrl ||
                        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80"
                      }
                      alt="Banner"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    className="relative z-10 -mt-8 rounded-full border-2 p-0.5 shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{
                      borderColor: theme.accentColor || "#10b981",
                      backgroundColor: theme.backgroundColor || "#0d1117",
                    }}
                  >
                    <img
                      src={
                        avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={displayName}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <h2
                      className="text-xl font-bold tracking-tight select-none"
                      style={{
                        fontFamily: getFontFamilyCss(theme.fontHeading),
                        color: theme.textColor || "#ffffff",
                      }}
                    >
                      {displayName}
                    </h2>
                    {verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p
                    className="text-xs font-medium opacity-75"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    @{username}
                  </p>
                </div>
              ) : layout === "cutout" ? (
                /* CUTOUT LAYOUT */
                <div className="group relative mb-2.5 flex flex-col items-center justify-center">
                  <div className="flex h-28 w-28 items-end justify-center overflow-hidden">
                    <img
                      src={
                        avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={displayName}
                      className="h-full w-auto object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <h2
                      className="text-xl font-bold tracking-tight select-none"
                      style={{
                        fontFamily: getFontFamilyCss(theme.fontHeading),
                        color: theme.textColor || "#ffffff",
                      }}
                    >
                      {displayName}
                    </h2>
                    {verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p
                    className="text-xs font-medium opacity-75"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    @{username}
                  </p>
                </div>
              ) : layout === "shape" ? (
                /* SHAPE LAYOUT */
                <div className="group relative mb-3 flex flex-col items-center justify-center">
                  <div
                    className="flex h-20 w-20 items-center justify-center p-1 shadow-lg transition-all duration-500 group-hover:scale-105"
                    style={{
                      borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                      backgroundColor: theme.accentColor || "#a855f7",
                    }}
                  >
                    <div
                      className="h-full w-full overflow-hidden"
                      style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                    >
                      <img
                        src={
                          avatarUrl ||
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                        }
                        alt={displayName}
                        className="h-full w-full scale-110 object-cover"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <h2
                      className="text-xl font-bold tracking-tight select-none"
                      style={{
                        fontFamily: getFontFamilyCss(theme.fontHeading),
                        color: theme.textColor || "#ffffff",
                      }}
                    >
                      {displayName}
                    </h2>
                    {verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p
                    className="text-xs font-medium opacity-75"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    @{username}
                  </p>
                </div>
              ) : (
                /* CLASSIC LAYOUT */
                <div className="relative mb-3 flex flex-col items-center">
                  <div
                    className="mb-2 h-20 w-20 rounded-full border-2 p-1 transition-transform duration-300 group-hover:scale-105"
                    style={{ borderColor: theme.accentColor || "#10b981" }}
                  >
                    <img
                      src={
                        avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                      }
                      alt={displayName}
                      className="h-full w-full rounded-full object-cover shadow-md"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <h2
                      className={`text-xl font-bold tracking-tight select-none ${classicVideoUrl ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]" : ""
                        }`}
                      style={{
                        fontFamily: getFontFamilyCss(theme.fontHeading),
                        color: theme.textColor || "#ffffff",
                      }}
                    >
                      {displayName}
                    </h2>
                    {verified && <VerifiedBadge size="md" />}
                  </div>
                  <p
                    className={`text-xs font-medium opacity-75 ${classicVideoUrl ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]" : ""
                      }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    @{username}
                  </p>
                </div>
              )}

              {/* Bio (rendered for all layouts if present) */}
              {bio && (
                <p
                  className={`mt-2 max-w-[260px] text-xs font-normal leading-relaxed opacity-90 ${classicVideoUrl ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]" : ""
                    }`}
                >
                  {bio}
                </p>
              )}
            </div>

            {/* Spotify Card Music Player Preview */}
            {theme.spotifyMusicEnabled &&
              theme.spotifyMusicLayout === "card" &&
              (theme.spotifyTrackTitle || theme.spotifyTrackUrl || theme.spotifyTrackPreview) && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-zinc-950/85 p-2.5 text-left text-white shadow-lg backdrop-blur-md">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-600/30">
                    {theme.spotifyTrackImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={theme.spotifyTrackImage}
                        alt={theme.spotifyTrackTitle || "Music"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold leading-tight text-white">
                      {theme.spotifyTrackTitle || "Profil Musiqasi"}
                    </p>
                    <p className="truncate text-[9.5px] text-zinc-400">
                      {theme.spotifyTrackArtist || "Spotify / Audio"}
                    </p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                    <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                  </span>
                </div>
              )}

            {/* Links Section */}
            <div className="mt-5 flex flex-1 flex-col gap-2.5">
              {groupLinksWithYouTubeCarousels(links).map((item) => {
                if (item.type === "youtube-carousel") {
                  return (
                    <div key={item.key} className="text-left">
                      <YouTubeEmbed
                        videos={item.videos}
                        borderRadius={theme.buttonRadius || "18px"}
                        themeButtonColor={theme.buttonColor}
                        themeTextColor={theme.buttonTextColor}
                        themeBorderColor={theme.buttonBorderColor}
                        themeButtonStyle={theme.buttonStyle}
                        themeAccentColor={theme.accentColor || "#ef4444"}
                        onPlayClick={(linkId) => {
                          if (!interactive) return;
                          if (linkId) setClickedLink(linkId);
                        }}
                      />
                    </div>
                  );
                }

                if (item.type === "instagram-embed") {
                  return (
                    <div key={item.key} className="text-left">
                      <InstagramEmbed
                        url={item.link.url}
                        title={item.link.title}
                        description={item.link.description}
                        thumbnail={item.link.thumbnail}
                        posts={item.posts}
                        borderRadius={theme.buttonRadius || "18px"}
                        themeButtonColor={theme.buttonColor}
                        themeTextColor={theme.buttonTextColor}
                        themeBorderColor={theme.buttonBorderColor}
                        themeButtonStyle={theme.buttonStyle}
                        themeAccentColor={theme.accentColor || "#e1306c"}
                        onPostClick={(targetUrl) => {
                          if (!interactive) return;
                          if (item.link.id) setClickedLink(item.link.id);
                        }}
                      />
                    </div>
                  );
                }

                if (item.type === "tiktok-embed") {
                  return (
                    <div key={item.key} className="text-left">
                      <TikTokEmbed
                        url={item.link.url}
                        title={item.link.title}
                        description={item.link.description}
                        thumbnail={item.link.thumbnail}
                        borderRadius={theme.buttonRadius || "18px"}
                        themeButtonColor={theme.buttonColor}
                        themeTextColor={theme.buttonTextColor}
                        themeBorderColor={theme.buttonBorderColor}
                        themeButtonStyle={theme.buttonStyle}
                        themeAccentColor={theme.accentColor || "#00f2fe"}
                        onVideoClick={(targetUrl) => {
                          if (!interactive) return;
                          if (item.link.id) setClickedLink(item.link.id);
                        }}
                      />
                    </div>
                  );
                }

                const link = item.link;
                const isClicked = clickedLink === link.id;
                const destinationUrl = interactive ? formatUrlForHref(link.url, link.icon) : undefined;

                return (
                  <a
                    key={link.id}
                    href={destinationUrl}
                    target={interactive ? "_blank" : undefined}
                    rel={interactive ? "noopener noreferrer" : undefined}
                    onClick={(e) => {
                      if (!interactive) {
                        e.preventDefault();
                        return;
                      }
                      setClickedLink(link.id);
                      setTimeout(() => setClickedLink(null), 1000);
                    }}
                    className={`relative flex items-center justify-between px-4 py-3.5 text-xs font-semibold shadow-sm transition-all duration-200 no-underline ${interactive ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : "cursor-default"
                      }`}
                    style={{
                      backgroundColor: theme.buttonColor || "#10b981",
                      color: theme.buttonTextColor || "#042f2e",
                      borderRadius: theme.buttonRadius || "16px",
                      border: theme.buttonBorderColor
                        ? `1px solid ${theme.buttonBorderColor}`
                        : "none",
                      fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 pr-2">
                      {link.icon && (
                        <div className="shrink-0">
                          <PlatformIcon platform={link.icon} size={16} />
                        </div>
                      )}
                      <span className="truncate">{link.title}</span>
                    </div>

                    {link.isPinned && (
                      <div className="flex shrink-0 items-center opacity-70">
                        <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">
                          Pinned
                        </span>
                      </div>
                    )}

                    {isClicked && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/70 text-[11px] font-medium text-white backdrop-blur-sm animate-in fade-in">
                        Opening Link...
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Bottom Call to Action and Footer */}
            {theme?.showBranding && (
              <div className="mt-auto pt-4">
                {/* White Pill Button: Get your own BioSpace */}
                <div className="mb-3 flex justify-center">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block cursor-pointer rounded-full bg-white px-5 py-2.5 text-xs font-bold tracking-tight text-zinc-950 shadow-md transition-colors hover:bg-zinc-100"
                  >
                    Get your own BioSpace
                  </a>
                </div>

                {/* Footer Links */}
                <div className="space-y-1 text-[10px] font-medium text-white/70">
                  <p className="tracking-tight">
                    Cookie Preferences · Report · Privacy
                  </p>
                  <p className="cursor-pointer text-white/50 transition-colors hover:text-white/80">
                    More from BioSpace
                  </p>
                </div>
              </div>
            )}

            {/* Floating Music Pill Preview */}
            {theme.spotifyMusicEnabled &&
              theme.spotifyMusicLayout !== "card" &&
              (theme.spotifyTrackTitle || theme.spotifyTrackUrl || theme.spotifyTrackPreview) && (
                <div className="sticky bottom-2 z-20 mt-3 flex items-center gap-2 rounded-2xl border border-white/15 bg-zinc-950/90 p-2 text-left text-white shadow-xl backdrop-blur-xl">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-emerald-600/30">
                    {theme.spotifyTrackImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={theme.spotifyTrackImage}
                        alt={theme.spotifyTrackTitle || "Music"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold leading-tight text-white">
                      {theme.spotifyTrackTitle || "Profil Musiqasi"}
                    </p>
                    <p className="truncate text-[8.5px] text-zinc-400">
                      {theme.spotifyTrackArtist || "Spotify / Audio"}
                    </p>
                  </div>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                    <Play className="h-3 w-3 fill-current ml-0.5" />
                  </span>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

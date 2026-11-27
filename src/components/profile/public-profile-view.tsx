"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  ChevronDown,
  Link2,
  Share2,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { VerifiedBadge } from "@/components/shared/verified-badge";
import { ReportModal } from "./report-modal";
import { formatUrlForHref, groupLinksWithYouTubeCarousels, cn, getHeroBlurPx, getHeroFadeConfig } from "@/lib/utils";
import { YouTubeEmbed } from "@/components/shared/youtube-embed";
import { InstagramEmbed } from "@/components/shared/instagram-embed";
import { TikTokEmbed } from "@/components/shared/tiktok-embed";
import { PublicStoreSection } from "./public-store-section";
import { PublicNewsletterBlock } from "./public-newsletter-block";
import { PublicBookingSection } from "./public-booking-section";
import { SpotifyMusicPlayer } from "./spotify-music-player";
import { ProfileSticker } from "./profile-sticker";
import { resolveThemeSurface, themeButtonStyle, withAlpha } from "./theme-surface";
import { getFontFamilyCss } from "@/lib/fonts-catalog";
import { DynamicFontLoader } from "@/components/shared/dynamic-font-loader";
import { toast } from "sonner";

interface PublicProfileViewProps {
  profile: any;
  theme: any;
  links: any[];
  collections: any[];
  products?: any[];
  inPreview?: boolean;
}

export function PublicProfileView({
  profile: initialProfile,
  theme: initialTheme,
  links: initialLinks,
  collections: initialCollections,
  products = [],
  inPreview = false,
}: PublicProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [theme, setTheme] = useState(initialTheme);
  const [links, setLinks] = useState(initialLinks);
  const [collections, setCollections] = useState(initialCollections);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme]);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  useEffect(() => {
    setCollections(initialCollections);
  }, [initialCollections]);

  // Real-Time cross-tab & live update synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc: BroadcastChannel | null = null;
    const updateFromPayload = (data: any) => {
      if (!data) return;
      if (data.type === "THEME_UPDATED" && data.theme) {
        setTheme((prev: any) => ({ ...prev, ...data.theme }));
      } else if (data.type === "PROFILE_UPDATED" && data.profile) {
        setProfile((prev: any) => ({ ...prev, ...data.profile }));
      } else if (data.type === "LINKS_UPDATED" && Array.isArray(data.links)) {
        setLinks(data.links.filter((l: any) => l.isEnabled));
      }
    };

    try {
      if ("BroadcastChannel" in window) {
        bc = new BroadcastChannel("biospace_realtime_sync");
        bc.onmessage = (event) => updateFromPayload(event.data);
      }
    } catch { }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "biospace_realtime_event" && e.newValue) {
        try {
          updateFromPayload(JSON.parse(e.newValue));
        } catch { }
      }
    };
    window.addEventListener("storage", handleStorage);

    // On window focus, silently fetch fresh profile data
    const handleFocus = async () => {
      try {
        const username = initialProfile?.username;
        if (username) {
          const res = await fetch(`/api/profile?username=${username}`);
          if (res.ok) {
            const fresh = await res.json();
            if (fresh.profile) setProfile(fresh.profile);
            if (fresh.theme) setTheme(fresh.theme);
            if (fresh.links) setLinks(fresh.links);
            if (fresh.collections) setCollections(fresh.collections);
          }
        }
      } catch { }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [initialProfile?.username]);
  const [collapsedCollections, setCollapsedCollections] = useState<Record<string, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportLinkId, setSelectedReportLinkId] = useState<string | undefined>(undefined);
  const [copiedShare, setCopiedShare] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<"links" | "shop">("links");
  const isStoreActive = Boolean(profile.storeEnabled !== false && products && products.length > 0);

  // Auto-record page view event on mount (non-blocking)
  useEffect(() => {
    try {
      const visitorId = localStorage.getItem("biospace_visitor_id") || `vis_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("biospace_visitor_id", visitorId);

      const device = window.innerWidth < 768 ? "Mobile" : window.innerWidth < 1024 ? "Tablet" : "Desktop";

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          type: "VIEW",
          visitorId,
          referrer: document.referrer || "direct",
          device,
        }),
      }).catch(() => { });
    } catch { }
  }, [profile.id]);

  const handleLinkClick = (linkId: string, url: string, platform?: string | null) => {
    try {
      const visitorId = localStorage.getItem("biospace_visitor_id") || "anonymous";
      const device = window.innerWidth < 768 ? "Mobile" : "Desktop";

      // Track click with keepalive
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          profileId: profile.id,
          linkId,
          type: "CLICK",
          visitorId,
          referrer: window.location.href,
          device,
        }),
      }).catch(() => { });
    } catch { }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username} on BioSpace`,
          url,
        });
      } catch { }
    } else {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      toast.success("Profile URL copied to clipboard!");
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const toggleCollection = (id: string) => {
    setCollapsedCollections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openReportModal = () => {
    setSelectedReportLinkId(undefined);
    setReportModalOpen(true);
  };

  // Filter out scheduled links that are outside their active date window
  const now = new Date();
  const visibleLinks = links.filter((l) => {
    if (!l.isEnabled) return false;
    if (l.scheduledStart && new Date(l.scheduledStart) > now) return false;
    if (l.scheduledEnd && new Date(l.scheduledEnd) < now) return false;
    return true;
  });

  const uncollectedLinks = visibleLinks.filter((l) => !l.collectionId);

  // Background video (Video Wallpaper or Classic layout)
  const backgroundVideoUrl =
    theme?.backgroundType === "video" || profile.layout === "classic"
      ? theme?.backgroundVideo || (theme?.backgroundType === "video" ? theme?.backgroundImage : null)
      : null;
  const hasBackgroundVideo = Boolean(backgroundVideoUrl);
  const hasClassicVideo = hasBackgroundVideo;

  // Background styling
  const bgStyle = hasBackgroundVideo
    ? { backgroundColor: "transparent" }
    : theme?.backgroundType === "gradient" && theme?.backgroundGradient
      ? { background: theme.backgroundGradient }
      : theme?.backgroundColor
        ? { backgroundColor: theme.backgroundColor }
        : { backgroundColor: "#0d1117" };

  const ts = resolveThemeSurface(theme);
  const accent = ts.accent;
  const displayName = profile.displayName || profile.username;
  const showBranding = Boolean(theme?.showBranding);
  const themeText = ts.text;
  const buttonStyle = themeButtonStyle(theme);

  const chromeButtonClass =
    "group inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ease-out-expo hover:bg-[var(--ts-hover)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";

  const renderYouTubeCarousel = (item: any) => (
    <YouTubeEmbed
      key={item.key}
      videos={item.videos}
      borderRadius={theme?.buttonRadius || "18px"}
      themeButtonColor={theme?.buttonColor}
      themeTextColor={theme?.buttonTextColor}
      themeBorderColor={theme?.buttonBorderColor}
      themeButtonStyle={theme?.buttonStyle}
      themeAccentColor={theme?.accentColor || "#ef4444"}
      onPlayClick={(linkId, url) => {
        if (linkId) handleLinkClick(linkId, url || "");
      }}
    />
  );

  const renderInstagramEmbed = (item: any) => (
    <InstagramEmbed
      key={item.key}
      url={item.link.url}
      title={item.link.title}
      description={item.link.description}
      thumbnail={item.link.thumbnail}
      posts={item.posts}
      borderRadius={theme?.buttonRadius || "18px"}
      themeButtonColor={theme?.buttonColor}
      themeTextColor={theme?.buttonTextColor}
      themeBorderColor={theme?.buttonBorderColor}
      themeAccentColor={theme?.accentColor || "#e1306c"}
      themeButtonStyle={theme?.buttonStyle}
      onPostClick={(targetUrl) => {
        handleLinkClick(item.link.id, targetUrl);
        window.open(formatUrlForHref(targetUrl, "instagram"), "_blank", "noopener,noreferrer");
      }}
    />
  );

  const renderTikTokEmbed = (item: any) => (
    <TikTokEmbed
      key={item.key}
      url={item.link.url}
      title={item.link.title}
      description={item.link.description}
      thumbnail={item.link.thumbnail}
      borderRadius={theme?.buttonRadius || "18px"}
      themeButtonColor={theme?.buttonColor}
      themeTextColor={theme?.buttonTextColor}
      themeBorderColor={theme?.buttonBorderColor}
      themeAccentColor={theme?.accentColor || "#00f2fe"}
      themeButtonStyle={theme?.buttonStyle}
      onVideoClick={(targetUrl) => {
        handleLinkClick(item.link.id, targetUrl);
        window.open(formatUrlForHref(targetUrl, "tiktok"), "_blank", "noopener,noreferrer");
      }}
    />
  );

  const renderLinkButton = (link: any) => {
    const destinationUrl = formatUrlForHref(link.url, link.icon);

    return (
      <a
        key={link.id}
        href={destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleLinkClick(link.id, link.url, link.icon)}
        className="group relative flex w-full items-center justify-between gap-3 overflow-hidden px-4 py-3.5 text-left text-sm font-bold shadow-md transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 sm:px-5 sm:py-4 no-underline cursor-pointer"
        style={buttonStyle}
      >
        {/* theme-tinted glint hairline */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-5 top-0 h-px opacity-60"
          style={{
            background: `linear-gradient(90deg, transparent, ${withAlpha(
              theme?.buttonTextColor || "#042f2e",
              0.55
            )}, transparent)`,
          }}
        />

        <span className="flex min-w-0 items-center gap-3.5">
          {link.icon && (
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: withAlpha(theme?.buttonTextColor || "#042f2e", 0.12) }}
            >
              <PlatformIcon platform={link.icon} size={17} className="h-[17px] w-[17px]" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate leading-snug tracking-[-0.01em]">{link.title}</span>
            {link.description && (
              <span className="mt-0.5 block truncate text-[11px] font-medium opacity-70 sm:text-xs">
                {link.description}
              </span>
            )}
          </span>
        </span>

        {link.isPinned && (
          <span className="flex shrink-0 items-center gap-1.5 opacity-80 transition-opacity duration-200 group-hover:opacity-100">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]"
              style={{ backgroundColor: withAlpha(theme?.buttonTextColor || "#042f2e", 0.16) }}
            >
              <Sparkles className="h-2.5 w-2.5" />
              <span className="hidden min-[380px]:inline">Featured</span>
            </span>
          </span>
        )}
      </a>
    );
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col justify-between transition-colors duration-300"
      style={{
        ...bgStyle,
        ...ts.vars,
        color: themeText,
        fontFamily: ts.bodyFont,
      }}
    >
      {/* Dynamic Font Loader for the active heading font */}
      <DynamicFontLoader font={theme?.fontHeading} />

      {/* Full-Screen Edge-to-Edge Hero Cover with smooth bottom gradient fade into background color */}
      {profile.layout === "hero" && (() => {
        const fadeCfg = getHeroFadeConfig(theme?.heroFade);
        const darkenMode = theme?.heroDarken || "balanced";
        const topDark = fadeCfg.topDarken(darkenMode);
        const heroSrc =
          profile.avatarUrl ||
          profile.bannerUrl ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1400&auto=format&fit=crop&q=85";

        return (
          <>
            {/* Solid backing under hero cover so background wallpaper NEVER shines through */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[380px] w-full sm:h-[460px] md:h-[500px]"
              style={{ backgroundColor: theme?.backgroundColor || "#000000" }}
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-[380px] w-full overflow-hidden sm:h-[460px] md:h-[500px]"
              style={{
                maskImage: fadeCfg.maskGradient,
                WebkitMaskImage: fadeCfg.maskGradient,
              }}
            >
              <img
                src={heroSrc}
                alt={profile.displayName || profile.username}
                className="h-full w-full object-cover object-top"
              />

              {/* Edge-to-edge subtle top darken so share button & top controls remain clear */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, rgba(0, 0, 0, ${topDark}) 0%, transparent 60%)`,
                }}
              />
            </div>
          </>
        );
      })()}

      {/* Wallpaper: Image Background with Effect, Tint & Noise */}
      {theme?.backgroundType === "image" && (
        <div
          className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden"
          style={
            profile.layout === "hero"
              ? {
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, transparent 220px, rgba(0, 0, 0, 0.4) 300px, black 370px, black 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, transparent 220px, rgba(0, 0, 0, 0.4) 300px, black 370px, black 100%)",
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
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
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
          className="pointer-events-none fixed inset-0 z-0 h-full w-full"
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
            className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}

      {/* Background Video (Wallpaper or Classic Layout) with High-Contrast Shield & Tint */}
      {hasBackgroundVideo && (
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`h-full w-full object-cover object-center scale-105 transition-all duration-300 ${theme?.wallpaperEffect === "mono"
              ? "grayscale contrast-125"
              : theme?.wallpaperEffect === "blur"
                ? "blur-md scale-110"
                : theme?.wallpaperEffect === "halftone"
                  ? "contrast-150 brightness-95"
                  : ""
              }`}
            src={backgroundVideoUrl!}
          />
          {/* Tint overlay */}
          <div
            className="absolute inset-0 transition-colors duration-200"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${(Number(theme?.wallpaperTint ?? 30) / 100) * 0.75})`,
            }}
          />
          {theme?.wallpaperNoise && (
            <div
              className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          )}
        </div>
      )}

      {/* Background Video (Wallpaper or Classic Layout) with High-Contrast Shield & Tint */}
      {hasBackgroundVideo && (
        <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`h-full w-full object-cover object-center scale-105 transition-all duration-300 ${theme?.wallpaperEffect === "mono"
              ? "grayscale contrast-125"
              : theme?.wallpaperEffect === "blur"
                ? "blur-md scale-110"
                : theme?.wallpaperEffect === "halftone"
                  ? "contrast-150 brightness-95"
                  : ""
              }`}
            src={backgroundVideoUrl!}
          />
          {/* Tint overlay */}
          <div
            className="absolute inset-0 transition-colors duration-200"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${(Number(theme?.wallpaperTint ?? 30) / 100) * 0.75})`,
            }}
          />
          {theme?.wallpaperNoise && (
            <div
              className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }}
            />
          )}
        </div>
      )}

      {/* Page Sticker Decoration (Floating top-right, top-left, bottom-right, bottom-left, avatar, custom) */}
      {theme?.stickersEnabled && theme?.stickerPosition !== "above-links" && (
        <div className="pointer-events-none fixed inset-0 z-40 mx-auto w-full max-w-lg overflow-hidden">
          <ProfileSticker theme={theme} inPreview={true} />
        </div>
      )}

      {/* Top Floating Action Bar */}
      <header className="relative z-20 mx-auto w-full max-w-xl px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={handleShare}
            className={chromeButtonClass}
            style={{
              backgroundColor: ts.faint,
              borderColor: ts.border,
              color: themeText,
              "--tw-ring-color": withAlpha(themeText, 0.4),
            } as React.CSSProperties}
            title="Share Profile"
            aria-label="Share this profile"
          >
            {copiedShare ? (
              <Check className="h-4 w-4" style={{ color: accent }} />
            ) : (
              <Share2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            )}
          </button>
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-5 pb-12">
        {/* Profile Header by Layout */}
        <div className="mb-8 flex w-full flex-col items-center text-center">
          {profile.layout === "hero" ? (
            /* HERO LAYOUT: Expansive edge-to-edge full screen header spacer */
            <div className="mb-3 flex w-full flex-col items-center pt-48 sm:pt-60 md:pt-68" />
          ) : profile.layout === "banner" ? (
            <div className="group relative mb-6 flex w-full flex-col items-center">
              <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-emerald-500/30 shadow-lg sm:h-44">
                <img
                  src={
                    profile.bannerUrl ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
                  }
                  alt="Profile Banner"
                  className="h-full w-full object-cover"
                />
              </div>
              <div
                className="relative z-10 -mt-14 rounded-full p-1 shadow-2xl transition-transform duration-300 group-hover:scale-105 sm:-mt-16"
                style={{
                  borderColor: theme?.backgroundColor || "#121212",
                  backgroundColor: theme?.backgroundColor || "#121212",
                }}
              >
                <img
                  src={
                    profile.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={profile.displayName || profile.username}
                  className="h-24 w-24 rounded-full object-cover shadow-inner sm:h-28 sm:w-28"
                />
              </div>
            </div>
          ) : profile.layout === "cutout" ? (
            <div className="group relative mb-4 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute bottom-2 h-24 w-28 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
                style={{ backgroundColor: withAlpha(accent, 0.35) }}
              />
              <div className="relative flex h-36 w-36 items-end justify-center overflow-hidden sm:h-44 sm:w-44">
                <img
                  src={
                    profile.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80"
                  }
                  alt={profile.displayName || profile.username}
                  className="h-full w-auto object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-105 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]"
                />
              </div>
            </div>
          ) : profile.layout === "shape" ? (
            <div className="group relative mb-5 flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute h-28 w-28 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-80 sm:h-32 sm:w-32"
                style={{ backgroundColor: withAlpha(accent, 0.4) }}
              />
              <div
                className="relative flex h-28 w-28 items-center justify-center p-1.5 shadow-2xl transition-all duration-500 group-hover:scale-105 sm:h-32 sm:w-32"
                style={{
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                  backgroundColor: theme?.accentColor || "#a855f7",
                }}
              >
                <div
                  className="h-full w-full overflow-hidden"
                  style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                >
                  <img
                    src={
                      profile.avatarUrl ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80"
                    }
                    alt={profile.displayName || profile.username}
                    className="h-full w-full scale-110 object-cover"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Classic Circular Avatar — gradient glow ring built from the creator accent */
            <div className="group relative mb-4">
              <div
                aria-hidden="true"
                className="absolute inset-2 rounded-full opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
                style={{ backgroundColor: withAlpha(accent, 0.45) }}
              />
              <div
                className="relative h-24 w-24 rounded-full p-[3px] transition-transform duration-500 ease-out-expo group-hover:scale-[1.04] sm:h-28 sm:w-28"
                style={{
                  backgroundImage: `linear-gradient(145deg, ${accent} 0%, ${withAlpha(
                    accent,
                    0.45
                  )} 45%, ${withAlpha(themeText, 0.3)} 100%)`,
                  boxShadow: `0 20px 44px -22px ${withAlpha(accent, 0.9)}`,
                }}
              >
                <img
                  src={
                    profile.avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                  }
                  alt={profile.displayName || profile.username}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Display Name, verified badge & social row for all layouts */}
          <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
            <h1
              className={`text-[26px] font-extrabold leading-tight tracking-[-0.03em] sm:text-[32px] ${hasClassicVideo || profile.layout === "hero" ? "drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]" : ""
                }`}
              style={{ fontFamily: getFontFamilyCss(theme?.fontHeading) }}
            >
              {displayName}
            </h1>
            {profile.verified && (
              <VerifiedBadge size="lg" className="sm:h-6 sm:w-6" />
            )}
          </div>

          {/* Username */}
          <p
            className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold tracking-tight sm:text-sm ${hasClassicVideo || profile.layout === "hero" ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]" : ""
              }`}
            style={{ color: withAlpha(themeText, 0.85), fontFamily: "var(--font-inter), sans-serif" }}
          >
            @{profile.username}
          </p>

          {/* Bio */}
          {profile.bio && (
            <p
              className={`mt-3 max-w-sm text-[13px] font-normal leading-relaxed sm:text-sm ${hasClassicVideo || profile.layout === "hero" ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.95)]" : ""
                }`}
              style={{ color: withAlpha(themeText, 0.86) }}
            >
              {profile.bio}
            </p>
          )}

          <div
            aria-hidden="true"
            className="mb-1 mt-6 h-px w-28 bg-gradient-to-r from-transparent via-[var(--ts-border-strong)] to-transparent"
          />
        </div>

        {/* Navigation Pill Switcher: Links | (optional Shop when active) */}
        <div className="mb-6 flex w-full justify-center">
          <div
            className={cn(
              "relative overflow-hidden rounded-full border p-1 shadow-lg backdrop-blur-xl transition-all duration-300 ease-out-expo",
              isStoreActive ? "inline-grid grid-cols-2" : "inline-flex"
            )}
            style={{ backgroundColor: ts.surface, borderColor: ts.border }}
          >
            {isStoreActive ? (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full transition-transform duration-300 ease-out-expo"
                  style={{
                    backgroundColor: themeText,
                    transform: activeProfileTab === "shop" ? "translateX(100%)" : "translateX(0)",
                    boxShadow: `0 8px 20px -12px ${withAlpha(themeText, 0.8)}`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setActiveProfileTab("links")}
                  aria-pressed={activeProfileTab === "links"}
                  className="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold tracking-tight transition-colors duration-300 sm:px-8 sm:text-sm"
                  style={{
                    color:
                      activeProfileTab === "links" ? ts.base : withAlpha(themeText, 0.72),
                  }}
                >
                  <Link2 className="h-3.5 w-3.5" />
                  Links
                </button>
                <button
                  type="button"
                  onClick={() => setActiveProfileTab("shop")}
                  aria-pressed={activeProfileTab === "shop"}
                  className="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold tracking-tight transition-colors duration-300 sm:px-8 sm:text-sm"
                  style={{
                    color: activeProfileTab === "shop" ? ts.base : withAlpha(themeText, 0.72),
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Shop
                  <span
                    className="ml-0.5 rounded-full px-1.5 py-px text-[10px] font-black leading-tight"
                    style={{
                      backgroundColor:
                        activeProfileTab === "shop"
                          ? withAlpha(ts.base, 0.16)
                          : withAlpha(themeText, 0.14),
                    }}
                  >
                    {products.length}
                  </span>
                </button>
              </>
            ) : (
              <div
                className="relative z-10 inline-flex items-center justify-center gap-1.5 rounded-full px-7 py-2 text-xs font-bold tracking-tight transition-all duration-300 sm:px-9 sm:text-sm"
                style={{
                  backgroundColor: themeText,
                  color: ts.base,
                  boxShadow: `0 8px 20px -12px ${withAlpha(themeText, 0.8)}`,
                }}
              >
                <Link2 className="h-3.5 w-3.5" />
                Links
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: LINKS & BLOCKS */}
        {(!isStoreActive || activeProfileTab === "links") && (
          <div className="w-full animate-in fade-in slide-in-from-left-6 duration-300 space-y-2.5">
            {/* Above-Links Sticker Decoration */}
            {theme?.stickersEnabled && theme?.stickerPosition === "above-links" && (
              <div className="mb-3 flex justify-center">
                <ProfileSticker theme={theme} inPreview={inPreview} positionMode="inline" />
              </div>
            )}

            {/* Spotify Embedded Card if configured for inline card layout */}
            {theme?.spotifyMusicEnabled && theme?.spotifyMusicLayout === "card" && (
              <SpotifyMusicPlayer theme={theme} />
            )}

            {/* Uncollected links (grouped into 10s auto-rotating carousels for YouTube embeds, or Instagram/TikTok feeds) */}
            {groupLinksWithYouTubeCarousels(uncollectedLinks).map((item) => {
              if (item.type === "youtube-carousel") {
                return renderYouTubeCarousel(item);
              }
              if (item.type === "instagram-embed") {
                return renderInstagramEmbed(item);
              }
              if (item.type === "tiktok-embed") {
                return renderTikTokEmbed(item);
              }
              return renderLinkButton(item.link);
            })}

            {/* Empty state */}
            {visibleLinks.length === 0 &&
              !profile.newsletterEnabled &&
              !profile.bookingEnabled && (
                <div
                  className="animate-in fade-in rounded-3xl border border-dashed px-6 py-10 text-center"
                  style={{ borderColor: ts.borderStrong, backgroundColor: ts.faint }}
                >
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: ts.accentSoft, color: accent }}
                  >
                    <Link2 className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-sm font-bold tracking-tight">
                    No links yet
                  </h2>
                  <p className="mx-auto mt-1 max-w-[26ch] text-xs leading-relaxed" style={{ color: ts.muted }}>
                    {displayName} hasn&apos;t added any links yet. Check back soon.
                  </p>
                </div>
              )}

            {/* Grouped Collections */}
            {collections.map((col) => {
              const colLinks = visibleLinks.filter((l) => l.collectionId === col.id);
              if (colLinks.length === 0) return null;

              const isCollapsed = collapsedCollections[col.id];

              return (
                <div key={col.id} className="pt-3">
                  <button
                    type="button"
                    onClick={() => toggleCollection(col.id)}
                    aria-expanded={!isCollapsed}
                    className="group flex w-full items-center gap-2.5 py-2 text-left transition-colors duration-200"
                  >
                    <span
                      className="text-[11px] font-bold uppercase tracking-[0.18em]"
                      style={{ color: withAlpha(themeText, 0.72) }}
                    >
                      {col.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1"
                      style={{
                        background: `linear-gradient(90deg, ${withAlpha(
                          themeText,
                          0.18
                        )}, transparent)`,
                      }}
                    />
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ backgroundColor: ts.faint, color: ts.muted }}
                    >
                      {colLinks.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-300 ease-out-expo",
                        isCollapsed && "-rotate-90"
                      )}
                      style={{ color: withAlpha(themeText, 0.6) }}
                    />
                  </button>

                  {col.description && !isCollapsed && (
                    <p
                      className="pb-2 text-[11px] leading-relaxed"
                      style={{ color: ts.muted }}
                    >
                      {col.description}
                    </p>
                  )}

                  {!isCollapsed && (
                    <div className="space-y-2.5 pt-1">
                      {groupLinksWithYouTubeCarousels(colLinks).map((item) => {
                        if (item.type === "youtube-carousel") {
                          return renderYouTubeCarousel(item);
                        }
                        if (item.type === "instagram-embed") {
                          return renderInstagramEmbed(item);
                        }
                        if (item.type === "tiktok-embed") {
                          return renderTikTokEmbed(item);
                        }
                        return renderLinkButton(item.link);
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Email Newsletter Subscription Block (Phase 03) */}
            <PublicNewsletterBlock profile={profile} theme={theme} />

            {/* Appointment Booking Block (Phase 04) */}
            <PublicBookingSection profile={profile} theme={theme} />
          </div>
        )}

        {/* TAB 2: SHOP (Merch Collection Card with Mosaic & Interactive Catalog) */}
        {isStoreActive && activeProfileTab === "shop" && (
          <div className="w-full animate-in fade-in slide-in-from-right-6 duration-300">
            <PublicStoreSection
              products={products}
              seller={{
                id: profile.id,
                username: profile.username,
                displayName: profile.displayName,
                avatarUrl: profile.avatarUrl,
                isVerified: profile.verified,
              }}
              theme={theme}
            />
          </div>
        )}
      </main>

      {/* Footer — legal/platform chrome. Creator "Powered by" branding is gated by showBranding. */}
      <footer className="relative z-10 flex w-full flex-col items-center gap-4 px-5 pb-8 pt-10 text-center">
        {showBranding && (
          <div className="flex flex-col items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold tracking-tight shadow-lg transition-all duration-300 ease-out-expo hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 sm:text-sm"
              style={{
                backgroundColor: themeText,
                color: ts.base,
                "--tw-ring-color": withAlpha(themeText, 0.45),
              } as React.CSSProperties}
            >
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              Create your BioSpace
            </a>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: withAlpha(themeText, 0.35) }}
            >
              Powered by BioSpace
            </p>
          </div>
        )}

        <nav
          aria-label="Profile footer"
          className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-[11px] font-medium"
        >
          <button
            type="button"
            onClick={openReportModal}
            className="rounded-full px-2 py-1 text-[var(--ts-subtle)] transition-colors duration-200 hover:bg-[var(--ts-hover)] hover:text-[var(--ts-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
          >
            Report
          </button>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: withAlpha(themeText, 0.28) }}
          />
          <a
            href="/privacy"
            className="rounded-full px-2 py-1 text-[var(--ts-subtle)] transition-colors duration-200 hover:bg-[var(--ts-hover)] hover:text-[var(--ts-text)]"
          >
            Privacy
          </a>
          <span
            aria-hidden="true"
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: withAlpha(themeText, 0.28) }}
          />
          <a
            href="/terms"
            className="rounded-full px-2 py-1 text-[var(--ts-subtle)] transition-colors duration-200 hover:bg-[var(--ts-hover)] hover:text-[var(--ts-text)]"
          >
            Terms
          </a>
        </nav>
      </footer>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        profileId={profile.id}
        linkId={selectedReportLinkId}
      />

      {/* Spotify Floating Music Player */}
      {theme?.spotifyMusicEnabled && theme?.spotifyMusicLayout !== "card" && (
        <SpotifyMusicPlayer theme={theme} />
      )}
    </div>
  );
}

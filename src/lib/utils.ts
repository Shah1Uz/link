import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type PlatformType =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "snapchat"
  | "twitch"
  | "discord"
  | "pinterest"
  | "spotify"
  | "applemusic"
  | "github"
  | "behance"
  | "dribbble"
  | "medium"
  | "email"
  | "phone"
  | "website";

export function detectPlatformFromUrl(url: string): PlatformType {
  if (!url) return "website";
  const lower = url.toLowerCase().trim();

  if (lower.startsWith("mailto:")) return "email";
  if (lower.startsWith("tel:")) return "phone";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("t.me") || lower.includes("telegram.me")) return "telegram";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("wa.me") || lower.includes("whatsapp.com")) return "whatsapp";
  if (lower.includes("snapchat.com")) return "snapchat";
  if (lower.includes("twitch.tv")) return "twitch";
  if (lower.includes("discord.gg") || lower.includes("discord.com")) return "discord";
  if (lower.includes("pinterest.com")) return "pinterest";
  if (lower.includes("spotify.com")) return "spotify";
  if (lower.includes("music.apple.com")) return "applemusic";
  if (lower.includes("github.com")) return "github";
  if (lower.includes("behance.net")) return "behance";
  if (lower.includes("dribbble.com")) return "dribbble";
  if (lower.includes("medium.com")) return "medium";

  return "website";
}

/**
 * Validates and sanitizes URLs against malicious schemes (javascript:, data:, vbscript:)
 */
export function isValidSecureUrl(urlString: string): boolean {
  if (!urlString) return false;
  const trimmed = urlString.trim().toLowerCase();

  // Block dangerous schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:")
  ) {
    return false;
  }

  // Allow mailto: and tel:
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("tel:")) {
    return true;
  }

  try {
    const url = new URL(urlString.startsWith("http://") || urlString.startsWith("https://") ? urlString : `https://${urlString}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatUrlForHref(urlString: string, platform?: string | null): string {
  if (!urlString) return "#";
  let trimmed = urlString.trim();

  // Clean duplicate slashes after protocol without touching https:// or http://
  trimmed = trimmed.replace(/([^:]\/)\/+/g, "$1");

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:") ||
    trimmed.startsWith("tg:")
  ) {
    return trimmed;
  }

  // Email auto-detection
  if (platform === "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return `mailto:${trimmed}`;
  }

  // Phone number auto-detection
  if (platform === "phone" || /^\+?[0-9\s\-()]{7,20}$/.test(trimmed)) {
    const digits = trimmed.replace(/[\s\-()]/g, "");
    return `tel:${digits.startsWith("+") ? digits : `+${digits}`}`;
  }

  // Handle social handles starting with "@"
  if (trimmed.startsWith("@")) {
    const handle = trimmed.slice(1);
    const p = (platform || "").toLowerCase();
    if (p === "instagram") return `https://instagram.com/${handle}`;
    if (p === "telegram") return `https://t.me/${handle}`;
    if (p === "twitter" || p === "x") return `https://x.com/${handle}`;
    if (p === "tiktok") return `https://tiktok.com/@${handle}`;
    if (p === "github") return `https://github.com/${handle}`;
    if (p === "youtube") return `https://youtube.com/@${handle}`;
    if (p === "spotify") return `https://open.spotify.com/search/${handle}`;
    if (p === "discord") return `https://discord.gg/${handle}`;
    return `https://t.me/${handle}`;
  }

  return `https://${trimmed}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "k";
  return num.toString();
}

export function calculateCTR(clicks: number, views: number): string {
  if (!views || views === 0) return "0.0%";
  return ((clicks / views) * 100).toFixed(1) + "%";
}

/**
 * Extracts a YouTube Video ID from any standard watch URL, youtu.be, shorts, or embed URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // Pattern 2: youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Pattern 3: youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // Pattern 4: youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Pattern 5: youtube.com/live/VIDEO_ID
  const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return liveMatch[1];

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Safely caps border-radius for video and media containers so 9999px pill themes
 * do not distort rectangular 16:9 media into an ugly oval/egg shape.
 */
export function getClampedMediaRadius(radiusStr?: string, maxRadius = 18): string {
  if (!radiusStr) return "18px";
  const trimmed = radiusStr.trim().toLowerCase();
  if (trimmed === "0px" || trimmed === "0") return "0px";
  if (trimmed === "9999px" || trimmed === "full" || trimmed.includes("9999")) {
    return `${maxRadius}px`;
  }
  const parsed = parseInt(trimmed, 10);
  if (isNaN(parsed) || parsed > maxRadius) return `${maxRadius}px`;
  if (parsed < 4) return "0px";
  return `${parsed}px`;
}

export interface YouTubeVideoItem {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  videoId: string;
  linkId?: string;
}

/**
 * Extracts all YouTube videos from a link, including primary video and any additional
 * carousel videos stored in thumbnail as JSON array.
 */
export function parseYouTubeVideosFromLink(link: {
  id: string;
  url: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
}): YouTubeVideoItem[] {
  const items: YouTubeVideoItem[] = [];

  // Primary video
  const primaryId = extractYouTubeVideoId(link.url);
  if (primaryId) {
    items.push({
      id: link.id,
      linkId: link.id,
      url: link.url,
      title: link.title,
      description: link.description,
      videoId: primaryId,
    });
  }

  // Extra videos stored in thumbnail (JSON format: [{ url, title, description }])
  if (link.thumbnail && typeof link.thumbnail === "string" && link.thumbnail.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(link.thumbnail);
      if (Array.isArray(parsed)) {
        parsed.forEach((extra: any, index: number) => {
          if (extra && typeof extra.url === "string") {
            const extraVId = extractYouTubeVideoId(extra.url);
            if (extraVId) {
              items.push({
                id: `${link.id}-extra-${index}`,
                linkId: link.id,
                url: extra.url,
                title: extra.title || link.title,
                description: extra.description || null,
                videoId: extraVId,
              });
            }
          }
        });
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  return items;
}

export function isInstagramUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.includes("instagram.com") || lower.includes("instagr.am");
}

export function extractInstagramUsername(url?: string | null): string {
  if (!url) return "creator";
  const trimmed = url.trim();
  if (trimmed.startsWith("@")) return trimmed.slice(1);
  const match = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:@)?([a-zA-Z0-9_.]+)/i);
  if (match && match[1]) {
    const candidate = match[1];
    if (!["p", "reel", "reels", "stories", "explore", "tv", "direct"].includes(candidate.toLowerCase())) {
      return candidate;
    }
  }
  return "creator";
}

export interface InstagramInfo {
  type: "post" | "reel" | "profile";
  shortcode: string | null;
  username: string;
}

export function extractInstagramPostInfo(url?: string | null): InstagramInfo {
  if (!url) return { type: "profile", shortcode: null, username: "creator" };
  const trimmed = url.trim();

  // Match post: /p/{shortcode}
  const postMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/p\/([a-zA-Z0-9_-]+)/i);
  if (postMatch && postMatch[1]) {
    return { type: "post", shortcode: postMatch[1], username: extractInstagramUsername(url) };
  }

  // Match reel: /reel/{shortcode} or /reels/{shortcode}
  const reelMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/reels?\/([a-zA-Z0-9_-]+)/i);
  if (reelMatch && reelMatch[1]) {
    return { type: "reel", shortcode: reelMatch[1], username: extractInstagramUsername(url) };
  }

  // Match IGTV: /tv/{shortcode}
  const tvMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/tv\/([a-zA-Z0-9_-]+)/i);
  if (tvMatch && tvMatch[1]) {
    return { type: "post", shortcode: tvMatch[1], username: extractInstagramUsername(url) };
  }

  return { type: "profile", shortcode: null, username: extractInstagramUsername(url) };
}

export function isTikTokUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase().trim();
  return lower.includes("tiktok.com");
}

export function extractTikTokUsername(url?: string | null): string {
  if (!url) return "creator";
  const trimmed = url.trim();
  if (trimmed.startsWith("@")) return trimmed.slice(1);
  const match = trimmed.match(/tiktok\.com\/(?:@)?([a-zA-Z0-9_.]+)/i);
  if (match && match[1]) {
    return match[1].replace(/^@/, "");
  }
  return "creator";
}

export interface TikTokInfo {
  type: "video" | "profile";
  videoId: string | null;
  username: string;
}

export function extractTikTokVideoInfo(url?: string | null): TikTokInfo {
  if (!url) return { type: "profile", videoId: null, username: "creator" };
  const trimmed = url.trim();

  // Match video: /video/{videoId}
  const videoMatch = trimmed.match(/tiktok\.com\/(?:@[^/]+\/video\/|v\/|embed\/v2\/)([0-9]+)/i);
  if (videoMatch && videoMatch[1]) {
    return { type: "video", videoId: videoMatch[1], username: extractTikTokUsername(url) };
  }

  // Generic /video/ pattern
  const genericMatch = trimmed.match(/\/video\/([0-9]+)/i);
  if (genericMatch && genericMatch[1]) {
    return { type: "video", videoId: genericMatch[1], username: extractTikTokUsername(url) };
  }

  return { type: "profile", videoId: null, username: extractTikTokUsername(url) };
}

export interface InstagramMediaItem {
  id: string;
  url: string;
  title?: string;
  shortcode: string;
  type: "post" | "reel";
}

export function parseInstagramPostsFromLink(link: any): InstagramMediaItem[] {
  const items: InstagramMediaItem[] = [];
  const primaryInfo = extractInstagramPostInfo(link.url);
  if (primaryInfo.shortcode) {
    items.push({
      id: `ig-primary-${link.id || "0"}`,
      url: link.url,
      title: link.title || "Instagram Post",
      shortcode: primaryInfo.shortcode,
      type: primaryInfo.type === "reel" ? "reel" : "post",
    });
  }

  if (link.thumbnail && typeof link.thumbnail === "string" && link.thumbnail.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(link.thumbnail);
      if (Array.isArray(parsed)) {
        parsed.forEach((extra: any, idx: number) => {
          if (extra && extra.url) {
            const extraInfo = extractInstagramPostInfo(extra.url);
            if (extraInfo.shortcode) {
              items.push({
                id: extra.id || `ig-extra-${idx}`,
                url: extra.url,
                title: extra.title || `Post #${idx + 1}`,
                shortcode: extraInfo.shortcode,
                type: extraInfo.type === "reel" ? "reel" : "post",
              });
            }
          }
        });
      }
    } catch {
      // Ignore JSON error
    }
  }

  return items;
}

export type RenderableLinkItem =
  | { type: "link"; link: any }
  | {
      type: "youtube-carousel";
      key: string;
      videos: YouTubeVideoItem[];
      originalLinks: any[];
    }
  | {
      type: "instagram-embed";
      key: string;
      link: any;
      posts?: InstagramMediaItem[];
      originalLinks?: any[];
    }
  | {
      type: "tiktok-embed";
      key: string;
      link: any;
    };

/**
 * Groups consecutive YouTube embed links (and multi-video links) into unified
 * 10-second auto-rotating carousels, and prepares Instagram and TikTok embed cards.
 */
export function groupLinksWithYouTubeCarousels(links: any[]): RenderableLinkItem[] {
  const result: RenderableLinkItem[] = [];
  let currentYtGroup: any[] = [];
  let currentInstaGroup: any[] = [];

  const flushYtGroup = () => {
    if (currentYtGroup.length === 0) return;

    const allVideos: YouTubeVideoItem[] = [];
    currentYtGroup.forEach((l) => {
      const vids = parseYouTubeVideosFromLink(l);
      allVideos.push(...vids);
    });

    if (allVideos.length > 0) {
      result.push({
        type: "youtube-carousel",
        key: `yt-carousel-${currentYtGroup[0].id}`,
        videos: allVideos,
        originalLinks: [...currentYtGroup],
      });
    } else {
      currentYtGroup.forEach((l) => {
        result.push({ type: "link", link: l });
      });
    }

    currentYtGroup = [];
  };

  const flushInstaGroup = () => {
    if (currentInstaGroup.length === 0) return;

    const allPosts: InstagramMediaItem[] = [];
    const seenShortcodes = new Set<string>();

    currentInstaGroup.forEach((l) => {
      const posts = parseInstagramPostsFromLink(l);
      posts.forEach((p) => {
        if (!seenShortcodes.has(p.shortcode)) {
          seenShortcodes.add(p.shortcode);
          allPosts.push(p);
        }
      });
    });

    // Primary link is preferably the profile link, or the first link
    const primaryLink =
      currentInstaGroup.find((l) => !extractInstagramPostInfo(l.url).shortcode) ||
      currentInstaGroup[0];

    result.push({
      type: "instagram-embed",
      key: `insta-${primaryLink.id}`,
      link: primaryLink,
      posts: allPosts,
      originalLinks: [...currentInstaGroup],
    });

    currentInstaGroup = [];
  };

  for (const item of links) {
    const isYtEmbed =
      isYouTubeUrl(item.url) &&
      (item.displayMode === "embed" || item.displayMode === "video");
    const isInstaEmbed =
      isInstagramUrl(item.url) &&
      (item.displayMode === "embed" || item.displayMode === "card");
    const isTikTokEmbed =
      isTikTokUrl(item.url) &&
      (item.displayMode === "embed" || item.displayMode === "card");

    if (isYtEmbed) {
      flushInstaGroup();
      currentYtGroup.push(item);
    } else if (isInstaEmbed) {
      flushYtGroup();
      currentInstaGroup.push(item);
    } else {
      flushYtGroup();
      flushInstaGroup();
      if (isTikTokEmbed) {
        result.push({ type: "tiktok-embed", key: `tiktok-${item.id}`, link: item });
      } else {
        result.push({ type: "link", link: item });
      }
    }
  }

  flushYtGroup();
  flushInstaGroup();
  return result;
}

export function getHeroBlurPx(blur?: string | null): string {
  if (!blur || blur === "medium") return "16px";
  if (blur === "none" || blur === "0" || blur === "0px") return "0px";
  if (blur === "soft") return "8px";
  if (blur === "strong") return "24px";
  if (blur === "ultra") return "36px";
  if (blur.endsWith("px")) return blur;
  return "16px";
}

export function getHeroFadeConfig(fade?: string | null) {
  const f = fade || "high";
  if (f === "low") {
    return {
      maskGradient:
        "linear-gradient(to bottom, black 0%, black 55%, rgba(0, 0, 0, 0.75) 75%, rgba(0, 0, 0, 0.2) 90%, transparent 100%)",
      blurMask:
        "linear-gradient(to bottom, transparent 0%, transparent 45%, rgba(0, 0, 0, 0.6) 70%, black 90%)",
      topDarken: (darken: string = "balanced") => (darken === "deep" ? 0.55 : darken === "subtle" ? 0.2 : 0.35),
      midDarken: (darken: string = "balanced") => (darken === "deep" ? 0.88 : darken === "subtle" ? 0.5 : 0.72),
      fadeStartPercent: 40,
      fadeMidPercent: 78,
    };
  }
  if (f === "medium") {
    return {
      maskGradient:
        "linear-gradient(to bottom, black 0%, black 40%, rgba(0, 0, 0, 0.7) 65%, rgba(0, 0, 0, 0.15) 85%, transparent 100%)",
      blurMask:
        "linear-gradient(to bottom, transparent 0%, transparent 30%, rgba(0, 0, 0, 0.6) 60%, black 85%)",
      topDarken: (darken: string = "balanced") => (darken === "deep" ? 0.55 : darken === "subtle" ? 0.2 : 0.35),
      midDarken: (darken: string = "balanced") => (darken === "deep" ? 0.88 : darken === "subtle" ? 0.5 : 0.72),
      fadeStartPercent: 28,
      fadeMidPercent: 68,
    };
  }
  if (f === "full") {
    return {
      maskGradient:
        "linear-gradient(to bottom, black 0%, black 15%, rgba(0, 0, 0, 0.65) 45%, rgba(0, 0, 0, 0.1) 75%, transparent 100%)",
      blurMask:
        "linear-gradient(to bottom, transparent 0%, transparent 10%, rgba(0, 0, 0, 0.6) 40%, black 75%)",
      topDarken: (darken: string = "balanced") => (darken === "deep" ? 0.55 : darken === "subtle" ? 0.2 : 0.35),
      midDarken: (darken: string = "balanced") => (darken === "deep" ? 0.88 : darken === "subtle" ? 0.5 : 0.72),
      fadeStartPercent: 12,
      fadeMidPercent: 50,
    };
  }
  // Default: "high" (elevated/ko'tarilgan fade)
  return {
    maskGradient:
      "linear-gradient(to bottom, black 0%, black 25%, rgba(0, 0, 0, 0.65) 52%, rgba(0, 0, 0, 0.12) 78%, transparent 100%)",
    blurMask:
      "linear-gradient(to bottom, transparent 0%, transparent 20%, rgba(0, 0, 0, 0.6) 48%, black 78%)",
    topDarken: (darken: string = "balanced") => (darken === "deep" ? 0.55 : darken === "subtle" ? 0.2 : 0.35),
    midDarken: (darken: string = "balanced") => (darken === "deep" ? 0.88 : darken === "subtle" ? 0.5 : 0.72),
    fadeStartPercent: 18,
    fadeMidPercent: 58,
  };
}




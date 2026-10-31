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

export function formatUrlForHref(urlString: string): string {
  if (!urlString) return "#";
  const trimmed = urlString.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
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


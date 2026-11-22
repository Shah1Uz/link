"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  Music,
  Check,
  Loader2,
} from "lucide-react";
import {
  extractTikTokUsername,
  extractTikTokVideoInfo,
  formatUrlForHref,
  getClampedMediaRadius,
} from "@/lib/utils";
import { withAlpha } from "@/components/profile/theme-surface";
import { PlatformIcon } from "@/components/shared/platform-icon";

interface TikTokEmbedProps {
  url: string;
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  borderRadius?: string;
  themeButtonColor?: string;
  themeTextColor?: string;
  themeBorderColor?: string;
  themeAccentColor?: string;
  themeButtonStyle?: string;
  onVideoClick?: (targetUrl: string) => void;
  className?: string;
}

export function TikTokEmbed({
  url,
  title,
  description,
  thumbnail,
  borderRadius = "18px",
  themeButtonColor,
  themeTextColor = "#ffffff",
  themeBorderColor,
  themeAccentColor = "#00f2fe",
  onVideoClick,
  className = "",
}: TikTokEmbedProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const videoInfo = useMemo(() => extractTikTokVideoInfo(url), [url]);
  const username = useMemo(() => videoInfo.username || extractTikTokUsername(url), [videoInfo, url]);
  const formattedUrl = useMemo(() => formatUrlForHref(url, "tiktok"), [url]);

  const clampedOuterRadius = getClampedMediaRadius(borderRadius, 22);

  const handleCardClick = (targetUrl: string) => {
    if (onVideoClick) {
      onVideoClick(targetUrl);
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const cardBg = themeButtonColor
    ? withAlpha(themeButtonColor, 0.94)
    : "rgba(10, 10, 14, 0.94)";

  const cardBorder = themeBorderColor
    ? themeBorderColor
    : "rgba(255, 255, 255, 0.12)";

  // Official TikTok player iframe URL for videos
  const embedIframeUrl = videoInfo.videoId
    ? `https://www.tiktok.com/player/v1/${videoInfo.videoId}?autoplay=0`
    : null;

  return (
    <div
      className={`group/tt relative w-full overflow-hidden border backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-2xl ${className}`}
      style={{
        borderRadius: clampedOuterRadius,
        backgroundColor: cardBg,
        borderColor: cardBorder,
        color: themeTextColor,
        fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* TikTok Cyan & Rose Top Neon Hairline */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #00f2fe 0%, #4facfe 35%, #000000 50%, #f77062 65%, #fe0979 100%)",
        }}
      />

      {/* Main Content Area */}
      {!videoInfo.videoId || iframeError ? (
        /* Real TikTok Profile Card (when URL is a profile) */
        <div className="flex flex-col items-center px-5 py-6 text-center">
          {/* Dual Glow Avatar */}
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCardClick(formattedUrl)}
            className="group/ring relative mb-3.5 flex h-20 w-20 items-center justify-center rounded-full p-[2.5px] shadow-lg transition-transform duration-300 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #00f2fe 0%, #000000 50%, #fe0979 100%)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-white shadow-inner">
              <PlatformIcon platform="tiktok" size={32} />
            </div>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-base font-extrabold tracking-tight sm:text-lg">
            <span>@{username}</span>
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#00f2fe] text-[9px] text-black font-black"
              title="Verified"
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
          </div>

          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium opacity-80">
            <Music className="h-3 w-3 text-[#00f2fe]" />
            <span>{description || title || "Official TikTok profile"}</span>
          </p>

          <div className="mt-4.5 w-full max-w-xs">
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(formattedUrl)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-bold text-black shadow-md transition-all duration-200 hover:bg-zinc-100 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            >
              <PlatformIcon platform="tiktok" size={14} />
              <span>Watch on TikTok</span>
            </a>
          </div>
        </div>
      ) : (
        /* Real TikTok Video Player Official Iframe */
        <>
          {/* Header bar */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {/* TikTok Dual-color Glow Badge */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black shadow-[0_0_12px_rgba(0,242,254,0.3)] ring-1 ring-white/15">
                <PlatformIcon platform="tiktok" size={16} />
              </div>

              <div className="min-w-0">
                <a
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCardClick(formattedUrl)}
                  className="flex items-center gap-1.5 truncate text-[13px] font-bold tracking-tight hover:underline"
                  style={{ color: themeTextColor }}
                >
                  <span className="truncate">@{username}</span>
                  <span
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#00f2fe] text-[8px] text-black font-black"
                    title="Verified"
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </a>
                <p className="truncate text-[10px] font-medium opacity-70">
                  {title || "TikTok Video"}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(formattedUrl)}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-zinc-100"
            >
              <PlatformIcon platform="tiktok" size={12} />
              <span>Watch</span>
            </a>
          </div>

          {/* Description caption if provided by user */}
          {description && (
            <div className="px-4 pt-3 text-xs leading-relaxed opacity-85">
              {description}
            </div>
          )}

          <div className="relative w-full overflow-hidden bg-black/60 p-2 sm:p-3">
            <div className="relative mx-auto aspect-[9/16] max-h-[580px] w-full max-w-[340px] overflow-hidden rounded-xl bg-black">
              <iframe
                src={embedIframeUrl!}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen={true}
                title={title || `@${username} TikTok Video`}
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer bar */}
      <a
        href={formattedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleCardClick(formattedUrl)}
        className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] font-semibold opacity-75 transition-opacity hover:opacity-100"
      >
        <span className="flex items-center gap-1.5">
          <PlatformIcon platform="tiktok" size={13} />
          <span>View on TikTok</span>
        </span>
        <span className="flex items-center gap-1 text-[10px]">
          <span>@{username}</span>
        </span>
      </a>
    </div>
  );
}

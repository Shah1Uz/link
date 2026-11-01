"use client";

import React, { useState } from "react";
import { Play, ExternalLink, Sparkles } from "lucide-react";
import { extractYouTubeVideoId, formatUrlForHref } from "@/lib/utils";

interface YouTubeEmbedProps {
  url: string;
  title: string;
  description?: string | null;
  borderRadius?: string;
  themeButtonColor?: string;
  themeTextColor?: string;
  themeAccentColor?: string;
  onPlayClick?: () => void;
  className?: string;
}

export function YouTubeEmbed({
  url,
  title,
  description,
  borderRadius = "20px",
  themeButtonColor,
  themeTextColor,
  themeAccentColor = "#ef4444",
  onPlayClick,
  className,
}: YouTubeEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (onPlayClick) onPlayClick();
  };

  return (
    <div
      className={`group relative w-full overflow-hidden border border-white/15 bg-black/40 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:shadow-2xl ${className || ""}`}
      style={{
        borderRadius,
      }}
    >
      {/* Top Header Card Info */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* YouTube Official Logo Badge */}
          <div className="flex h-5 w-7 items-center justify-center rounded-sm bg-red-600 shadow-xs shrink-0">
            <svg
              className="h-2.5 w-2.5 text-white fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="font-bold text-xs text-white truncate drop-shadow-xs">
            {title || "YouTube Video"}
          </span>
        </div>

        <a
          href={formatUrlForHref(url)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            if (onPlayClick) onPlayClick();
          }}
          className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20"
          title="Watch directly on YouTube"
        >
          <span>YouTube</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Video Container (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-black overflow-hidden">
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div
            onClick={handleStartPlay}
            className="group/thumb relative h-full w-full cursor-pointer overflow-hidden"
          >
            {/* High-res Thumbnail */}
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 transition-opacity duration-300 group-hover/thumb:opacity-90" />

            {/* Glowing Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-600/90 text-white shadow-2xl transition-all duration-300 group-hover/thumb:scale-115 group-hover/thumb:bg-red-600 ring-4 ring-white/30 backdrop-blur-xs">
                <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-white translate-x-0.5" />
                <span className="absolute -inset-1 rounded-full bg-red-500/40 animate-ping" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            {description && (
              <div className="absolute bottom-2 left-3 right-3 text-left">
                <p className="text-[11px] text-zinc-200 line-clamp-1 drop-shadow-md">
                  {description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


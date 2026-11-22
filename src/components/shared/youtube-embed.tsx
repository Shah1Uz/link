"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Play, ChevronLeft, ChevronRight, Sparkles, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  extractYouTubeVideoId,
  formatUrlForHref,
  getClampedMediaRadius,
  type YouTubeVideoItem,
} from "@/lib/utils";

interface YouTubeEmbedProps {
  videos?: YouTubeVideoItem[];
  url?: string;
  title?: string;
  description?: string | null;
  borderRadius?: string;
  themeButtonColor?: string;
  themeTextColor?: string;
  themeBorderColor?: string;
  themeAccentColor?: string;
  themeButtonStyle?: string;
  autoRotateIntervalMs?: number; // Default 10000ms = 10s
  onPlayClick?: (linkId?: string, url?: string) => void;
  className?: string;
}

export function YouTubeEmbed({
  videos: propVideos,
  url,
  title,
  description,
  borderRadius = "18px",
  themeButtonColor,
  themeTextColor,
  themeBorderColor,
  themeAccentColor = "#ef4444",
  autoRotateIntervalMs = 10000,
  onPlayClick,
  className,
}: YouTubeEmbedProps) {
  // Normalize videos list
  const activeVideos = useMemo<YouTubeVideoItem[]>(() => {
    if (propVideos && propVideos.length > 0) {
      return propVideos;
    }
    if (url) {
      const vId = extractYouTubeVideoId(url);
      if (vId) {
        return [
          {
            id: "single-video",
            url,
            title: title || "YouTube Video",
            description,
            videoId: vId,
          },
        ];
      }
    }
    return [];
  }, [propVideos, url, title, description]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPausedByHover, setIsPausedByHover] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%

  const totalVideos = activeVideos.length;

  // Safe clamped border-radius: never allow 9999px pill themes to distort 16:9 videos into ovals
  const clampedOuterRadius = getClampedMediaRadius(borderRadius, 18);
  const clampedInnerRadius = clampedOuterRadius === "0px" ? "0px" : "12px";

  // Reset index if out of bounds
  useEffect(() => {
    if (currentIndex >= totalVideos) {
      setCurrentIndex(0);
      setProgress(0);
      setIsPlaying(false);
    }
  }, [totalVideos, currentIndex]);

  const goToNext = useCallback(() => {
    if (totalVideos <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalVideos);
    setProgress(0);
    setIsPlaying(false);
  }, [totalVideos]);

  const goToPrev = useCallback(() => {
    if (totalVideos <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalVideos) % totalVideos);
    setProgress(0);
    setIsPlaying(false);
  }, [totalVideos]);

  const goToIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
    setIsPlaying(false);
  }, []);

  // 10-Second Auto-Rotation Timer with smooth progress bar
  useEffect(() => {
    if (totalVideos <= 1 || isPlaying || isPausedByHover) {
      return;
    }

    const stepMs = 100;
    const stepIncrement = (stepMs / autoRotateIntervalMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [totalVideos, isPlaying, isPausedByHover, autoRotateIntervalMs, goToNext]);

  if (totalVideos === 0) {
    return null;
  }

  const currentVideo = activeVideos[currentIndex] || activeVideos[0];
  const thumbnailUrl = `https://img.youtube.com/vi/${currentVideo.videoId}/hqdefault.jpg`;
  const embedUrl = `https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=1&rel=0&modestbranding=1`;

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(true);
    if (onPlayClick) onPlayClick(currentVideo.linkId || currentVideo.id, currentVideo.url);
  };

  return (
    <div
      onMouseEnter={() => setIsPausedByHover(true)}
      onMouseLeave={() => setIsPausedByHover(false)}
      className={`group relative w-full overflow-hidden transition-all duration-300 shadow-lg hover:shadow-2xl border backdrop-blur-md select-none ${className || ""}`}
      style={{
        borderRadius: clampedOuterRadius,
        backgroundColor: themeButtonColor || "rgba(255, 255, 255, 0.08)",
        borderColor: themeBorderColor || "rgba(255, 255, 255, 0.15)",
        color: themeTextColor || "#ffffff",
        fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* 10-Second Auto-Switching Progress Bar (Active when 2+ videos) */}
      {totalVideos > 1 && (
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-white/10 z-30 overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(239,68,68,0.9)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Sleek Top Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 dark:border-white/10 bg-black/20">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* Official YouTube Logo Badge */}
          <div className="flex h-5 w-7 items-center justify-center rounded-[5px] bg-[#FF0000] text-white shadow-xs shrink-0">
            <svg
              className="h-2.5 w-2.5 fill-current ml-0.5"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span
            className="font-bold text-xs sm:text-sm truncate drop-shadow-xs"
            style={{ color: themeTextColor || "inherit" }}
          >
            {currentVideo.title || "YouTube Video"}
          </span>
        </div>

        {/* Right Controls: Carousel Navigator & External Link */}
        <div className="flex items-center gap-1.5 shrink-0">
          {totalVideos > 1 && (
            <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-0.5 border border-white/15 text-[10px] font-semibold text-white/90 shadow-xs">
              <span className="tabular-nums pr-0.5">
                {currentIndex + 1}/{totalVideos}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                title="Oldingi video"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                title="Keyingi video"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Watch directly on YouTube button */}
          <a
            href={formatUrlForHref(currentVideo.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlayClick) onPlayClick(currentVideo.linkId || currentVideo.id, currentVideo.url);
            }}
            className="shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 bg-white/10 hover:bg-white/20 text-current opacity-85 hover:opacity-100 border border-white/10 shadow-xs"
            title="YouTube platformasida tomosha qilish"
          >
            <span>YouTube</span>
          </a>
        </div>
      </div>

      {/* Video Framing Area with elegant inner margins */}
      <div className="p-2 sm:p-2.5">
        <div
          className="relative aspect-video w-full overflow-hidden bg-black shadow-inner"
          style={{ borderRadius: clampedInnerRadius }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentVideo.id || `${currentVideo.videoId}-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.98, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: -20 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative h-full w-full"
            >
              {isPlaying ? (
                <iframe
                  src={embedUrl}
                  title={currentVideo.title || "YouTube Video Player"}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  onClick={handleStartPlay}
                  className="group/thumb relative h-full w-full cursor-pointer overflow-hidden"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIsPlaying(true);
                      if (onPlayClick) onPlayClick(currentVideo.linkId || currentVideo.id, currentVideo.url);
                    }
                  }}
                  title="Videoni ko'rish uchun bosing"
                >
                  {/* High-res Thumbnail */}
                  <img
                    src={thumbnailUrl}
                    alt={currentVideo.title || "Video thumbnail"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                    loading="lazy"
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 transition-opacity duration-300 group-hover/thumb:opacity-90" />

                  {/* Center YouTube Style Red Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex h-12 w-16 sm:h-14 sm:w-20 items-center justify-center rounded-2xl bg-[#FF0000] text-white shadow-2xl transition-all duration-300 group-hover/thumb:scale-110 group-hover/thumb:shadow-red-500/50 ring-4 ring-white/25">
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white translate-x-0.5" />
                      <span className="absolute -inset-1 rounded-2xl bg-red-500/40 animate-ping opacity-60" />
                    </div>
                  </div>

                  {/* Bottom Badges */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-medium">
                    <span className="bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1.5 border border-white/10">
                      {totalVideos > 1 ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span>10s Karusel ({currentIndex + 1}/{totalVideos})</span>
                        </>
                      ) : (
                        <span>Click to play</span>
                      )}
                    </span>
                    <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1 border border-white/10">
                      16:9 HD
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Multi-video Dot Navigation */}
      {totalVideos > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-2 pt-0.5">
          {activeVideos.map((vid, idx) => (
            <button
              key={vid.id || idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? "w-6 bg-red-500 shadow-xs"
                  : "w-2 bg-white/25 hover:bg-white/50"
              }`}
              title={`${vid.title || "Video"} (${idx + 1}/${totalVideos})`}
            />
          ))}
        </div>
      )}

      {/* Description / Caption Footer */}
      {currentVideo.description && (
        <div className="px-3.5 pb-2.5 pt-0.5 text-left">
          <p
            className="text-xs opacity-80 line-clamp-2 leading-relaxed"
            style={{ color: themeTextColor || "inherit" }}
          >
            {currentVideo.description}
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Music,
  Play,
  Pause,
  ExternalLink,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotifyMusicPlayerProps {
  theme: {
    spotifyMusicEnabled?: boolean;
    spotifyTrackUrl?: string | null;
    spotifyTrackTitle?: string | null;
    spotifyTrackArtist?: string | null;
    spotifyTrackImage?: string | null;
    spotifyTrackPreview?: string | null;
    spotifyMusicLayout?: "floating" | "card" | string;
    spotifyMusicAutoplay?: boolean;
    accentColor?: string;
  };
}

function isDirectAudioUrl(url?: string | null): boolean {
  if (!url) return false;
  const clean = url.split("#")[0].split("?")[0].toLowerCase();
  return (
    url.startsWith("/uploads/") ||
    url.startsWith("data:audio/") ||
    /\.(mp3|wav|m4a|ogg|aac|flac|weba)$/.test(clean)
  );
}

function getSpotifyEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const normalized = url.replace(/open\.spotify\.com\/intl-[a-z-]+\//i, "open.spotify.com/");
  const match = normalized.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1].toLowerCase()}/${match[2]}?utm_source=generator&theme=0`;
}

export function SpotifyMusicPlayer({ theme }: SpotifyMusicPlayerProps) {
  const initialAudio =
    theme?.spotifyTrackPreview ||
    (isDirectAudioUrl(theme?.spotifyTrackUrl) ? theme.spotifyTrackUrl || null : null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [mounted, setMounted] = useState(false);
  const [resolvedAudioUrl, setResolvedAudioUrl] = useState<string | null>(initialAudio);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync resolvedAudioUrl when theme prop changes
  useEffect(() => {
    if (theme?.spotifyTrackPreview) {
      setResolvedAudioUrl(theme.spotifyTrackPreview);
    } else if (isDirectAudioUrl(theme?.spotifyTrackUrl)) {
      setResolvedAudioUrl(theme.spotifyTrackUrl || null);
    } else {
      setResolvedAudioUrl(null);
    }
  }, [theme?.spotifyTrackPreview, theme?.spotifyTrackUrl]);

  // If theme has a track title without preview audio, look up preview audio dynamically
  useEffect(() => {
    if (
      !resolvedAudioUrl &&
      theme?.spotifyMusicEnabled &&
      theme?.spotifyTrackTitle &&
      !isDirectAudioUrl(theme?.spotifyTrackUrl)
    ) {
      const artistPart =
        theme.spotifyTrackArtist &&
        theme.spotifyTrackArtist !== "Spotify Track" &&
        theme.spotifyTrackArtist !== "Spotify Collection"
          ? theme.spotifyTrackArtist
          : "";
      const q = `${theme.spotifyTrackTitle} ${artistPart}`.trim();
      if (!q) return;

      fetch(`/api/spotify/resolve?q=${encodeURIComponent(q)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.results?.[0]?.previewUrl) {
            setResolvedAudioUrl(data.results[0].previewUrl);
          }
        })
        .catch(() => {});
    }
  }, [
    resolvedAudioUrl,
    theme?.spotifyMusicEnabled,
    theme?.spotifyTrackTitle,
    theme?.spotifyTrackArtist,
    theme?.spotifyTrackUrl,
  ]);

  const hashMatch = resolvedAudioUrl?.match(/[#?]t=([0-9.]+)(?:,([0-9.]+))?/);
  const trimStart = hashMatch ? parseFloat(hashMatch[1]) : 0;
  const trimEnd = hashMatch && hashMatch[2] ? parseFloat(hashMatch[2]) : null;
  const rawAudioUrl = resolvedAudioUrl ? resolvedAudioUrl.split("#")[0] : null;

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (trimStart > 0) {
        audio.currentTime = trimStart;
      }
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(trimEnd ? Math.min(trimEnd, audio.duration) - trimStart : audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (trimEnd && audio.currentTime >= trimEnd) {
        audio.pause();
        audio.currentTime = trimStart;
        setIsPlaying(false);
      }
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(trimEnd ? Math.min(trimEnd, audio.duration) - trimStart : audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(trimStart);
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    if (theme?.spotifyMusicAutoplay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [mounted, resolvedAudioUrl, trimStart, trimEnd, theme?.spotifyMusicAutoplay]);

  if (!mounted) return null;

  const isEnabled = Boolean(theme?.spotifyMusicEnabled);
  const trackUrl = theme?.spotifyTrackUrl;
  const trackTitle = theme?.spotifyTrackTitle || "Spotify Music";
  const trackArtist = theme?.spotifyTrackArtist || "Spotify";
  const trackImage = theme?.spotifyTrackImage;

  if (!isEnabled || isDismissed) {
    return null;
  }

  if (!trackUrl && !trackTitle && !resolvedAudioUrl) {
    return null;
  }

  const spotifyEmbedUrl = getSpotifyEmbedUrl(trackUrl);
  const spotifyDirectUrl =
    trackUrl ||
    `https://open.spotify.com/search/${encodeURIComponent(`${trackTitle} ${trackArtist}`)}`;

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const audio = audioRef.current;

    if (!audio || !rawAudioUrl) {
      if (spotifyEmbedUrl) {
        setShowEmbedPlayer((prev) => !prev);
        setIsExpanded(true);
        return;
      }
      window.open(spotifyDirectUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (isPlaying) {
      audio.pause();
    } else {
      if (
        trimStart > 0 &&
        (audio.currentTime < trimStart || (trimEnd && audio.currentTime >= trimEnd))
      ) {
        audio.currentTime = trimStart;
      }
      audio.play().catch((err) => {
        console.warn("Audio playback interrupted:", err);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (secs: number) => {
    const safe = Math.max(0, secs);
    const m = Math.floor(safe / 60);
    const s = Math.floor(safe % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isCardLayout = theme.spotifyMusicLayout === "card";

  // =========================================================================
  // 1. IN-STREAM PROFILE CARD LAYOUT
  // =========================================================================
  if (isCardLayout) {
    return (
      <div className="w-full my-4 overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/90 p-4 text-white shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-emerald-500/40 font-sans">
        {rawAudioUrl && (
          <audio
            ref={audioRef}
            src={rawAudioUrl}
            preload="metadata"
            muted={isMuted}
          />
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Artwork with play toggle */}
          <div
            onClick={togglePlay}
            className="group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl transition-transform active:scale-95"
          >
            {trackImage ? (
              <Image
                src={trackImage}
                alt={trackTitle}
                fill
                className={cn(
                  "object-cover transition-transform duration-700",
                  isPlaying && "scale-105"
                )}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500">
                <Music className="h-8 w-8 text-white" />
              </div>
            )}

            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-200",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-lg">
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                )}
              </div>
            </div>
          </div>

          {/* Track Details & Audio Scrubber */}
          <div className="min-w-0 flex-1 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                <span
                  className={cn(
                    "flex h-2 w-2 rounded-full bg-emerald-400",
                    isPlaying ? "animate-ping" : "animate-pulse"
                  )}
                />
                <span>{isPlaying ? "Ijro etilmoqda" : "Profil Musiqasi"}</span>
              </div>

              <div className="hidden sm:flex items-end gap-0.5 h-3.5">
                {[40, 90, 60, 100, 75, 45, 85].map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1 rounded-full bg-emerald-400 transition-all",
                      isPlaying ? "animate-pulse" : "opacity-40"
                    )}
                    style={{
                      height: isPlaying ? `${h}%` : "30%",
                      animationDuration: `${400 + i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            <h4 className="truncate text-base font-extrabold text-white leading-tight mt-0.5">
              {trackTitle}
            </h4>
            <p className="truncate text-xs font-medium text-zinc-400 mb-2">
              {trackArtist}
            </p>

            {rawAudioUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min={trimStart}
                  max={trimEnd || (duration > trimStart ? trimStart + duration : 30)}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-white/20 accent-emerald-400 transition-all focus:outline-none"
                />
                <span className="text-[10px] tabular-nums text-zinc-400">
                  {formatTime(duration)}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-400">
                {spotifyEmbedUrl
                  ? "Spotify pleyerda tinglash uchun ▶ tugmasini bosing"
                  : "Spotify orqali tinglash"}
              </p>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
              title={isPlaying ? "To'xtatish" : "Tinglash"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current ml-0.5" />
              )}
            </button>

            {rawAudioUrl && (
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            )}

            {spotifyDirectUrl && !isDirectAudioUrl(spotifyDirectUrl) && (
              <a
                href={spotifyDirectUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                title="Spotify'da ochish"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Embedded Spotify Player when no direct audio MP3 preview is available */}
        {!rawAudioUrl && spotifyEmbedUrl && showEmbedPlayer && (
          <div className="mt-3 pt-3 border-t border-white/10 animate-in fade-in">
            <iframe
              src={spotifyEmbedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="w-full rounded-xl"
              title={trackTitle}
            />
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. FLOATING BOTTOM GLASS PILL LAYOUT
  // =========================================================================
  return (
    <aside
      aria-label="Spotify music player"
      className={cn(
        "fixed bottom-4 right-4 z-40 max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out-expo font-sans antialiased",
        isExpanded ? "w-[340px]" : "w-auto"
      )}
    >
      {rawAudioUrl && (
        <audio
          ref={audioRef}
          src={rawAudioUrl}
          preload="metadata"
          muted={isMuted}
        />
      )}

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-zinc-950/95 text-white shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-2xl">
        {/* EXPANDED VIEW */}
        {isExpanded ? (
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Music className="h-3.5 w-3.5" />
                <span>Profil Soundtrack</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  title="Kichraytirish"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                  title="Yopish"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!rawAudioUrl && spotifyEmbedUrl ? (
              <iframe
                src={spotifyEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="w-full rounded-xl"
                title={trackTitle}
              />
            ) : (
              <>
                <div
                  onClick={togglePlay}
                  className="group relative mx-auto mb-3 h-32 w-32 cursor-pointer overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                >
                  {trackImage ? (
                    <Image
                      src={trackImage}
                      alt={trackTitle}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-700",
                        isPlaying && "scale-105"
                      )}
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500">
                      <Music className="h-10 w-10 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-200",
                      isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-xl">
                      {isPlaying ? (
                        <Pause className="h-6 w-6 fill-current" />
                      ) : (
                        <Play className="h-6 w-6 fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <h4 className="truncate text-sm font-extrabold text-white leading-tight">
                    {trackTitle}
                  </h4>
                  <p className="truncate text-xs text-zinc-400">{trackArtist}</p>
                </div>

                <div className="mb-3 px-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] tabular-nums text-zinc-400">
                      {formatTime(currentTime)}
                    </span>
                    <input
                      type="range"
                      min={trimStart}
                      max={trimEnd || (duration > trimStart ? trimStart + duration : 30)}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      className="h-1 flex-1 cursor-pointer appearance-none rounded-lg bg-white/20 accent-emerald-400 focus:outline-none"
                    />
                    <span className="text-[10px] tabular-nums text-zinc-400">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/15"
                    title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
                    title={isPlaying ? "To'xtatish" : "Tinglash"}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 fill-current" />
                    ) : (
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    )}
                  </button>

                  {spotifyDirectUrl && !isDirectAudioUrl(spotifyDirectUrl) && (
                    <a
                      href={spotifyDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
                      title="Spotify'da ochish"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          /* COLLAPSED MINI FLOATING PILL */
          <div className="flex items-center gap-3 p-2 pr-3">
            <button
              type="button"
              onClick={togglePlay}
              className="group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-md transition-transform active:scale-95"
              title={isPlaying ? "Musiqani to'xtatish" : "Musiqani tinglash"}
            >
              {trackImage ? (
                <Image
                  src={trackImage}
                  alt={trackTitle}
                  fill
                  className={cn("object-cover", isPlaying && "animate-spin-slow")}
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500">
                  <Music className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity duration-200",
                  isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                )}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-white text-white" />
                ) : (
                  <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                )}
              </div>
            </button>

            <div
              onClick={() => setIsExpanded(true)}
              className="min-w-0 cursor-pointer text-left transition-opacity hover:opacity-90"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-1.5 w-1.5 rounded-full bg-emerald-400",
                    isPlaying ? "animate-ping" : "animate-pulse"
                  )}
                />
                <span className="truncate text-xs font-bold leading-tight text-white max-w-[130px] sm:max-w-[170px]">
                  {trackTitle}
                </span>

                {isPlaying && (
                  <span className="flex items-end gap-0.5 h-2.5 ml-0.5">
                    <span className="w-0.5 h-full bg-emerald-400 animate-pulse" style={{ animationDuration: "500ms" }} />
                    <span className="w-0.5 h-2/3 bg-emerald-400 animate-pulse" style={{ animationDuration: "700ms" }} />
                    <span className="w-0.5 h-4/5 bg-emerald-400 animate-pulse" style={{ animationDuration: "400ms" }} />
                  </span>
                )}
              </div>
              <p className="truncate text-[10px] text-zinc-400 max-w-[130px] sm:max-w-[170px]">
                {trackArtist}
              </p>
            </div>

            <div className="flex items-center gap-1 pl-1">
              <button
                type="button"
                onClick={togglePlay}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full font-bold shadow-md transition-all duration-200 hover:scale-105 active:scale-95",
                  isPlaying
                    ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 shadow-emerald-500/25"
                )}
                title={isPlaying ? "To'xtatish" : "Tinglash"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Yopish"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

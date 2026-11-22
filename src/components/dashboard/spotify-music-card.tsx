"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Music,
  Search,
  Link2,
  Trash2,
  Sparkles,
  ExternalLink,
  Check,
  Play,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SpotifyMusicCardProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  trackUrl: string | null;
  trackTitle: string | null;
  trackArtist: string | null;
  trackImage: string | null;
  trackPreview?: string | null;
  layout: "floating" | "card" | string;
  onLayoutChange: (layout: "floating" | "card") => void;
  onTrackChange: (data: {
    trackUrl: string | null;
    trackTitle: string | null;
    trackArtist: string | null;
    trackImage: string | null;
    trackPreview?: string | null;
  }) => void;
}

export function SpotifyMusicCard({
  enabled,
  onEnabledChange,
  trackUrl,
  trackTitle,
  trackArtist,
  trackImage,
  trackPreview,
  layout,
  onLayoutChange,
  onTrackChange,
}: SpotifyMusicCardProps) {
  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "search">("link");

  // Handle resolving direct Spotify URL
  const handleResolveUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) {
      toast.error("Please enter a valid Spotify URL");
      return;
    }

    try {
      setIsResolving(true);
      const res = await fetch("/api/spotify/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not resolve Spotify URL");
      }

      onTrackChange({
        trackUrl: data.trackUrl,
        trackTitle: data.title,
        trackArtist: data.type === "track" ? "Spotify Track" : "Spotify Collection",
        trackImage: data.thumbnailUrl,
        trackPreview: data.previewUrl || null,
      });

      if (!enabled) {
        onEnabledChange(true);
      }

      setUrlInput("");
      toast.success("Spotify track attached to profile! 🎵");
    } catch (err: any) {
      toast.error(err.message || "Failed to load Spotify track");
    } finally {
      setIsResolving(false);
    }
  };

  // Handle searching songs
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    try {
      setIsSearching(true);
      const res = await fetch(`/api/spotify/resolve?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      toast.error("Music search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    onTrackChange({
      trackUrl: item.spotifySearchUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title)}`,
      trackTitle: item.title,
      trackArtist: item.artist,
      trackImage: item.artwork,
      trackPreview: item.previewUrl || null,
    });

    if (!enabled) {
      onEnabledChange(true);
    }

    setSearchResults([]);
    setSearchQuery("");
    toast.success(`"${item.title}" selected! 🎵`);
  };

  const handleRemoveTrack = () => {
    onTrackChange({
      trackUrl: null,
      trackTitle: null,
      trackArtist: null,
      trackImage: null,
      trackPreview: null,
    });
    toast.info("Profile music removed");
  };

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 sm:px-5 sm:py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-500 dark:text-emerald-400">
            <Music className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground truncate">
                Profile Music & Audio
              </h2>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                Spotify
              </Badge>
            </div>
            <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 sm:line-clamp-none">
              Play a signature track or background vibe when visitors browse your profile.
            </p>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
          className="shrink-0"
          aria-label="Toggle profile music"
        />
      </div>

      {/* Body */}
      {enabled && (
        <div className="space-y-5 p-5 sm:p-6 animate-in fade-in duration-200">
          {/* Active Track Preview */}
          {trackUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-md">
                    {trackImage ? (
                      <Image
                        src={trackImage}
                        alt={trackTitle || "Track"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-white">
                        <Music className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="truncate text-sm font-extrabold text-foreground">
                        {trackTitle || "Spotify Track"}
                      </h4>
                    </div>
                    <p className="truncate text-xs text-text-secondary mt-0.5">
                      {trackArtist || "Featured Music"}
                    </p>
                    <a
                      href={trackUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <span>Open on Spotify</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveTrack}
                  className="shrink-0 text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Display Layout Mode Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Player Display Style
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onLayoutChange("floating")}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${layout === "floating"
                        ? "border-emerald-500 bg-emerald-500/[0.08] shadow-sm"
                        : "border-border/80 bg-surface/30 hover:border-border"
                      }`}
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500">
                      {layout === "floating" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-foreground">
                        Floating Glass Pill (Recommended)
                      </span>
                      <span className="mt-0.5 block text-[11px] text-text-secondary leading-relaxed">
                        Sits stylishly in the bottom corner of your page with album art, expand button, and play controls.
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onLayoutChange("card")}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${layout === "card"
                        ? "border-emerald-500 bg-emerald-500/[0.08] shadow-sm"
                        : "border-border/80 bg-surface/30 hover:border-border"
                      }`}
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500">
                      {layout === "card" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                    </span>
                    <div>
                      <span className="block text-xs font-bold text-foreground">
                        Embedded Player Card
                      </span>
                      <span className="mt-0.5 block text-[11px] text-text-secondary leading-relaxed">
                        Displays directly inside your profile links as a prominent featured music player.
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Track Selection Inputs */
            <div className="space-y-4">
              {/* Tab Selector: Direct Link vs Search */}
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-border p-1 bg-surface/40 sm:inline-flex">
                <button
                  type="button"
                  onClick={() => setActiveTab("link")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all text-center ${activeTab === "link"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                    }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Paste Link</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("search")}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all text-center ${activeTab === "search"
                      ? "bg-foreground text-background shadow-xs"
                      : "text-text-secondary hover:text-foreground"
                    }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Search Song</span>
                  </span>
                </button>
              </div>

              {activeTab === "link" ? (
                <form onSubmit={handleResolveUrl} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="url"
                      placeholder="https://open.spotify.com/track/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="h-10 text-xs flex-1 min-w-0"
                    />
                    <Button
                      type="submit"
                      disabled={isResolving || !urlInput.trim()}
                      className="shrink-0 h-10 px-4 text-xs font-bold w-full sm:w-auto"
                    >
                      {isResolving ? "Loading..." : "Attach Track"}
                    </Button>
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    Supports Spotify track, album, or playlist links.
                  </p>
                </form>
              ) : (
                <div className="space-y-3">
                  <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="text"
                      placeholder="Search artist or song name (e.g. Billie Eilish, Konsta)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 text-xs flex-1 min-w-0"
                    />
                    <Button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="shrink-0 h-10 px-4 text-xs font-bold w-full sm:w-auto"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </form>

                  {/* Search Results list */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 rounded-2xl border border-border p-2 bg-surface/20">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-xl p-2 hover:bg-surface/80 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.artwork ? (
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                                <Image
                                  src={item.artwork}
                                  alt={item.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <h5 className="truncate text-xs font-bold text-foreground">
                                {item.title}
                              </h5>
                              <p className="truncate text-[11px] text-text-secondary">
                                {item.artist}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleSelectSearchResult(item)}
                            className="shrink-0 h-8 px-3 text-[11px] font-bold"
                          >
                            Select
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

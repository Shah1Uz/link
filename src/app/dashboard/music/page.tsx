"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Pause,
  Save,
  Radio,
  Headphones,
  Compass,
  ArrowRight,
  Sliders,
  Scissors,
  Upload,
  RotateCcw,
  Volume2,
  FileAudio,
  Loader2,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MUSIC_PRESETS = [
  { label: "Lofi Chill Beats", query: "Lofi Hip Hop chill study beats" },
  { label: "Synthwave Drive", query: "Synthwave Kavinsky Midnight" },
  { label: "Deep Focus Ambient", query: "Brian Eno ambient focus" },
  { label: "Upbeat Energy", query: "Dua Lipa Levitating" },
  { label: "Billie Eilish", query: "Billie Eilish Birds of a feather" },
];

export default function MusicStudioPage() {
  const { t } = useI18n();
  const { profile, theme, updateTheme } = useDashboard();

  const [enabled, setEnabled] = useState(theme?.spotifyMusicEnabled ?? false);
  const [trackUrl, setTrackUrl] = useState<string | null>(theme?.spotifyTrackUrl || null);
  const [trackTitle, setTrackTitle] = useState<string | null>(theme?.spotifyTrackTitle || null);
  const [trackArtist, setTrackArtist] = useState<string | null>(theme?.spotifyTrackArtist || null);
  const [trackImage, setTrackImage] = useState<string | null>(theme?.spotifyTrackImage || null);
  const [trackPreview, setTrackPreview] = useState<string | null>(theme?.spotifyTrackPreview || null);
  const [layout, setLayout] = useState<"floating" | "card">(
    theme?.spotifyMusicLayout === "card" ? "card" : "floating"
  );

  const [urlInput, setUrlInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "link" | "upload">("search");

  // Pre-listen preview state for search results & resolved links
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Audio trimming state (Start / End times in seconds)
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(30);
  const [maxDuration, setMaxDuration] = useState(30);
  const [isPlayingTrimmed, setIsPlayingTrimmed] = useState(false);
  const trimAudioRef = useRef<HTMLAudioElement | null>(null);

  // Custom audio upload state
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // Detect natural duration for uploaded custom audio files (e.g. > 30s)
  useEffect(() => {
    const raw = trackPreview?.split("#")[0];
    if (!raw || (!raw.startsWith("/uploads/") && !raw.startsWith("data:audio/"))) {
      setMaxDuration(30);
      return;
    }
    const probe = new Audio(raw);
    const onMeta = () => {
      if (probe.duration && Number.isFinite(probe.duration) && probe.duration > 5) {
        const dur = Math.max(30, Math.floor(probe.duration));
        setMaxDuration(dur);
      }
    };
    probe.addEventListener("loadedmetadata", onMeta);
    return () => {
      probe.removeEventListener("loadedmetadata", onMeta);
      probe.src = "";
    };
  }, [trackPreview]);

  const persistMusicToServer = async (overrides: {
    spotifyMusicEnabled?: boolean;
    spotifyTrackUrl?: string | null;
    spotifyTrackTitle?: string | null;
    spotifyTrackArtist?: string | null;
    spotifyTrackImage?: string | null;
    spotifyTrackPreview?: string | null;
    spotifyMusicLayout?: "floating" | "card";
  }) => {
    const nextEnabled =
      overrides.spotifyMusicEnabled !== undefined ? overrides.spotifyMusicEnabled : enabled;
    const nextUrl =
      overrides.spotifyTrackUrl !== undefined ? overrides.spotifyTrackUrl : trackUrl;
    const nextTitle =
      overrides.spotifyTrackTitle !== undefined ? overrides.spotifyTrackTitle : trackTitle;
    const nextArtist =
      overrides.spotifyTrackArtist !== undefined ? overrides.spotifyTrackArtist : trackArtist;
    const nextImage =
      overrides.spotifyTrackImage !== undefined ? overrides.spotifyTrackImage : trackImage;
    const nextPreview =
      overrides.spotifyTrackPreview !== undefined ? overrides.spotifyTrackPreview : trackPreview;
    const nextLayout =
      overrides.spotifyMusicLayout !== undefined ? overrides.spotifyMusicLayout : layout;

    const res = await fetch("/api/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spotifyMusicEnabled: nextEnabled,
        spotifyTrackUrl: nextUrl,
        spotifyTrackTitle: nextTitle,
        spotifyTrackArtist: nextArtist,
        spotifyTrackImage: nextImage,
        spotifyTrackPreview: nextPreview,
        spotifyMusicLayout: nextLayout,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Musiqa sozlamalarini saqlab bo'lmadi");
    }

    updateTheme({
      spotifyMusicEnabled: nextEnabled,
      spotifyTrackUrl: nextUrl,
      spotifyTrackTitle: nextTitle,
      spotifyTrackArtist: nextArtist,
      spotifyTrackImage: nextImage,
      spotifyTrackPreview: nextPreview,
      spotifyMusicLayout: nextLayout,
    });
  };

  useEffect(() => {
    if (theme) {
      if (theme.spotifyMusicEnabled !== undefined) setEnabled(Boolean(theme.spotifyMusicEnabled));
      if (theme.spotifyTrackUrl !== undefined) setTrackUrl(theme.spotifyTrackUrl);
      if (theme.spotifyTrackTitle !== undefined) setTrackTitle(theme.spotifyTrackTitle);
      if (theme.spotifyTrackArtist !== undefined) setTrackArtist(theme.spotifyTrackArtist);
      if (theme.spotifyTrackImage !== undefined) setTrackImage(theme.spotifyTrackImage);
      if (theme.spotifyTrackPreview !== undefined) {
        setTrackPreview(theme.spotifyTrackPreview);
        const match = theme.spotifyTrackPreview
          ? theme.spotifyTrackPreview.match(/[#?]t=([0-9.]+)(?:,([0-9.]+))?/)
          : null;
        if (match) {
          setTrimStart(parseFloat(match[1]) || 0);
          if (match[2]) setTrimEnd(parseFloat(match[2]) || 30);
        }
      }
      if (theme.spotifyMusicLayout !== undefined) {
        setLayout(theme.spotifyMusicLayout === "card" ? "card" : "floating");
      }
    }
  }, [theme]);

  // Clean up any playing audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (trimAudioRef.current) {
        trimAudioRef.current.pause();
        trimAudioRef.current = null;
      }
    };
  }, []);

  // Toggle pre-listening audio preview for search results
  const toggleTrackPreview = (item: any) => {
    if (previewingId === item.id) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingId(null);
      return;
    }

    if (!item.previewUrl) {
      toast.info("Ushbu qo'shiq uchun audio parcha topilmadi, lekin uni profilga o'rnatishingiz mumkin.");
      return;
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (trimAudioRef.current) {
      trimAudioRef.current.pause();
      setIsPlayingTrimmed(false);
    }

    const audio = new Audio(item.previewUrl);
    previewAudioRef.current = audio;
    setPreviewingId(item.id);

    audio.play().catch((err) => {
      console.warn("Audio playback interrupted:", err);
      setPreviewingId(null);
    });

    audio.onended = () => {
      setPreviewingId(null);
    };
    audio.onerror = () => {
      setPreviewingId(null);
      toast.error("Audio namunani tinglashda xatolik yuz berdi");
    };
  };

  // Trimmer controls
  const handleTrimChange = (newStart: number, newEnd: number) => {
    const validStart = Math.max(0, Math.min(newStart, newEnd - 2));
    const validEnd = Math.max(validStart + 2, Math.min(maxDuration, newEnd));
    setTrimStart(validStart);
    setTrimEnd(validEnd);

    if (trackPreview) {
      const raw = trackPreview.split("#")[0];
      const withTrim = `${raw}#t=${validStart},${validEnd}`;
      setTrackPreview(withTrim);
      updateTheme({ spotifyTrackPreview: withTrim });
    }
  };

  const handleResetTrim = () => {
    const resetEnd = Math.min(30, maxDuration);
    setTrimStart(0);
    setTrimEnd(resetEnd);
    if (trackPreview) {
      const raw = trackPreview.split("#")[0];
      setTrackPreview(raw);
      updateTheme({ spotifyTrackPreview: raw });
      toast.info(`Qirqish sozlamalari tiklandi (0s - ${resetEnd}s)`);
    }
  };

  const handleToggleTrimmedPreview = () => {
    if (!trackPreview) {
      toast.info("Avval biror musiqani tanlang");
      return;
    }
    const raw = trackPreview.split("#")[0];

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingId(null);
    }

    if (isPlayingTrimmed && trimAudioRef.current) {
      trimAudioRef.current.pause();
      setIsPlayingTrimmed(false);
      return;
    }

    const audio = trimAudioRef.current || new Audio(raw);
    trimAudioRef.current = audio;
    audio.src = raw;
    audio.currentTime = trimStart;

    audio
      .play()
      .then(() => {
        setIsPlayingTrimmed(true);
      })
      .catch((err) => {
        console.warn("Trimmed preview play error:", err);
        setIsPlayingTrimmed(false);
      });

    audio.ontimeupdate = () => {
      if (audio.currentTime >= trimEnd) {
        audio.pause();
        audio.currentTime = trimStart;
        setIsPlayingTrimmed(false);
      }
    };

    audio.onended = () => {
      setIsPlayingTrimmed(false);
    };
  };

  // Handle direct Spotify Link
  const handleResolveUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = urlInput.trim();
    if (!clean) {
      toast.error("Spotify havolasini kiriting");
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
        throw new Error(data.error || "Trekni aniqlab bo'lmadi");
      }

      const nextArtist = data.type === "track" ? "Spotify Track" : "Spotify Collection";
      const nextPreview = data.previewUrl || null;

      setTrackUrl(data.trackUrl);
      setTrackTitle(data.title);
      setTrackArtist(nextArtist);
      setTrackImage(data.thumbnailUrl);
      setTrackPreview(nextPreview);
      setEnabled(true);
      setUrlInput("");
      setTrimStart(0);
      setTrimEnd(30);

      await persistMusicToServer({
        spotifyMusicEnabled: true,
        spotifyTrackUrl: data.trackUrl,
        spotifyTrackTitle: data.title,
        spotifyTrackArtist: nextArtist,
        spotifyTrackImage: data.thumbnailUrl,
        spotifyTrackPreview: nextPreview,
      });

      toast.success("Spotify treki profilga saqlandi va ulandi! 🎵");
    } catch (err: any) {
      toast.error(err.message || "Trekni yuklashda xatolik");
    } finally {
      setIsResolving(false);
    }
  };

  // Handle searching songs
  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    try {
      setIsSearching(true);
      const res = await fetch(`/api/spotify/resolve?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
      if (!data.results || data.results.length === 0) {
        toast.info("Bu so'rov bo'yicha hech qanday musiqa topilmadi");
      }
    } catch {
      toast.error("Qidiruvda xatolik yuz berdi");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (item: any) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingId(null);
    }

    const directSearchUrl =
      item.spotifySearchUrl || `https://open.spotify.com/search/${encodeURIComponent(item.title)}`;

    setTrackUrl(directSearchUrl);
    setTrackTitle(item.title);
    setTrackArtist(item.artist);
    setTrackImage(item.artwork);
    setTrackPreview(item.previewUrl || null);
    setEnabled(true);
    setTrimStart(0);
    setTrimEnd(30);

    try {
      await persistMusicToServer({
        spotifyMusicEnabled: true,
        spotifyTrackUrl: directSearchUrl,
        spotifyTrackTitle: item.title,
        spotifyTrackArtist: item.artist,
        spotifyTrackImage: item.artwork,
        spotifyTrackPreview: item.previewUrl || null,
      });
      toast.success(`"${item.title}" profilga saqlandi! 🎵 Pastda qirqishni sozlashingiz mumkin.`);
    } catch (err: any) {
      toast.error(err.message || "Musiqani saqlashda xatolik yuz berdi");
    }
  };

  // Handle Custom Audio Upload (MP3, WAV, M4A, OGG, AAC)
  const handleCustomAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    if (!file) return;

    if (
      !file.type.startsWith("audio/") &&
      !file.name.match(/\.(mp3|wav|m4a|ogg|aac|flac|weba)$/i)
    ) {
      toast.error("Faqat audio fayllar (MP3, WAV, M4A, OGG, AAC) qabul qilinadi");
      inputEl.value = "";
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Fayl hajmi 25MB dan oshmasligi kerak");
      inputEl.value = "";
      return;
    }

    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Fayl yuklashda xatolik");

      const fileUrl = json.url || json.publicUrl;
      const storedTrackUrl = fileUrl.startsWith("data:")
        ? "custom-audio://uploaded"
        : fileUrl;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      const defaultCover =
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80";

      setTrackUrl(storedTrackUrl);
      setTrackTitle(cleanTitle);
      setTrackArtist("Shaxsiy Audio");
      setTrackImage(defaultCover);
      setTrackPreview(fileUrl);
      setEnabled(true);
      setTrimStart(0);
      setTrimEnd(30);

      await persistMusicToServer({
        spotifyMusicEnabled: true,
        spotifyTrackUrl: storedTrackUrl,
        spotifyTrackTitle: cleanTitle,
        spotifyTrackArtist: "Shaxsiy Audio",
        spotifyTrackImage: defaultCover,
        spotifyTrackPreview: fileUrl,
      });

      toast.success("Shaxsiy musiqangiz yuklandi va profilga saqlandi! 🎵");
    } catch (err: any) {
      toast.error(err.message || "Audio yuklashda xatolik yuz berdi");
    } finally {
      setIsUploadingAudio(false);
      inputEl.value = "";
    }
  };

  const handleRemoveTrack = async () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingId(null);
    }
    if (trimAudioRef.current) {
      trimAudioRef.current.pause();
      setIsPlayingTrimmed(false);
    }

    setTrackUrl(null);
    setTrackTitle(null);
    setTrackArtist(null);
    setTrackImage(null);
    setTrackPreview(null);
    setEnabled(false);
    setTrimStart(0);
    setTrimEnd(30);

    try {
      await persistMusicToServer({
        spotifyMusicEnabled: false,
        spotifyTrackUrl: null,
        spotifyTrackTitle: null,
        spotifyTrackArtist: null,
        spotifyTrackImage: null,
        spotifyTrackPreview: null,
      });
      toast.info("Musiqa o'chirildi");
    } catch (err: any) {
      toast.error(err.message || "O'chirishda xatolik");
    }
  };

  // Save changes to database
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const previewWithTrim = trackPreview
        ? `${trackPreview.split("#")[0]}#t=${trimStart},${trimEnd}`
        : null;

      await persistMusicToServer({
        spotifyMusicEnabled: enabled,
        spotifyTrackUrl: trackUrl,
        spotifyTrackTitle: trackTitle,
        spotifyTrackArtist: trackArtist,
        spotifyTrackImage: trackImage,
        spotifyTrackPreview: previewWithTrim,
        spotifyMusicLayout: layout,
      });

      toast.success("Profil musiqa sozlamalari muvaffaqiyatli saqlandi! ⚡");
    } catch (err: any) {
      toast.error(err.message || "Saqlashda xatolik");
    } finally {
      setIsSaving(false);
    }
  };

  // Extract embed URL for live preview
  let embedUrl: string | null = null;
  if (trackUrl) {
    const match = trackUrl.match(/\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
    if (match) {
      embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
    }
  }

  return (
    <div>
      <DashboardHeader
        title={t.musicStudio.title}
        description={t.musicStudio.description}
        action={
          <Button
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="gap-1.5 rounded-xl text-xs font-bold"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{t.musicStudio.saveChanges}</span>
          </Button>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8 overflow-x-hidden">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
          {/* LEFT COLUMN: Controls & Pickers */}
          <div className="space-y-6 lg:col-span-7 min-w-0 w-full">
            {/* Master Switch Card */}
            <Card className="overflow-hidden p-0 border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.04] to-transparent">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 sm:px-5 sm:py-4 gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                    <Music className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="font-heading text-sm font-bold tracking-tight text-foreground truncate">
                        {t.musicStudio.musicAudio}
                      </h3>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] shrink-0">
                        Spotify & Audio
                      </Badge>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1 sm:line-clamp-none">
                      {t.musicStudio.enableHint}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={async (val) => {
                    setEnabled(val);
                    try {
                      await persistMusicToServer({ spotifyMusicEnabled: val });
                      toast.success(val ? "Profil musiqasi yoqildi" : "Profil musiqasi o'chirildi");
                    } catch (err: any) {
                      toast.error(err.message || "Saqlashda xatolik");
                    }
                  }}
                  className="shrink-0"
                  aria-label="Toggle profile music"
                />
              </div>

              {/* Status info */}
              <div className="flex flex-wrap items-center justify-between px-4 py-2.5 sm:px-5 sm:py-3 text-xs bg-surface/30 gap-1.5">
                <span className="text-text-secondary">Integratsiya holati</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Audio & Spotify faol</span>
                </span>
              </div>
            </Card>

            {/* Selected Song Preview & Audio Trimmer Card */}
            {trackUrl ? (
              <Card className="overflow-hidden p-0 border-emerald-500/30 bg-emerald-500/[0.03]">
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-3.5">
                  <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Headphones className="h-4 w-4" />
                    <span>Faol Profil Saundtreki</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveTrack}
                    className="h-8 gap-1 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>O'chirish</span>
                  </Button>
                </div>

                <div className="p-5 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-lg">
                      {trackImage ? (
                        <Image
                          src={trackImage}
                          alt={trackTitle || "Track"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 text-white">
                          <Music className="h-7 w-7" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h4 className="truncate text-base font-extrabold text-foreground">
                          {trackTitle || "Musiqa"}
                        </h4>
                      </div>
                      <p className="truncate text-xs text-text-secondary mt-0.5">
                        {trackArtist || "Ijrochi"}
                      </p>
                      {trackUrl.startsWith("http") && (
                        <a
                          href={trackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <span>Asl havolani ochish</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Audio Trimmer & Start Position Control */}
                  <div className="rounded-2xl border border-emerald-500/20 bg-surface/50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-foreground">
                          Musiqani qirqish va boshlanish nuqtasi
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetTrim}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-text-secondary hover:text-foreground transition-colors"
                        title="Bosh holatga qaytarish"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Tiklash</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      Profilga kirgan foydalanuvchi uchun musiqa aynan siz belgilagan soniyadan boshlab yangraydi:
                    </p>

                    {/* Start Time Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-medium">Boshlanish vaqti:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {trimStart} soniya
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(25, maxDuration - 2)}
                        step={1}
                        value={trimStart}
                        onChange={(e) => handleTrimChange(parseInt(e.target.value, 10), trimEnd)}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-surface rounded-lg"
                      />
                    </div>

                    {/* End Time Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary font-medium">Tugash vaqti:</span>
                        <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                          {trimEnd} soniya
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={maxDuration}
                        step={1}
                        value={trimEnd}
                        onChange={(e) => handleTrimChange(trimStart, parseInt(e.target.value, 10))}
                        className="w-full accent-cyan-500 cursor-pointer h-2 bg-surface rounded-lg"
                      />
                    </div>

                    {/* Trim info & preview button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/60">
                      <span className="text-[11px] font-mono text-text-secondary">
                        Davomiyligi: <strong className="text-foreground">{trimEnd - trimStart}s</strong> ({trimStart}s - {trimEnd}s)
                      </span>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleToggleTrimmedPreview}
                        className={cn(
                          "h-8 gap-1.5 text-xs font-semibold rounded-xl border-emerald-500/30",
                          isPlayingTrimmed && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {isPlayingTrimmed ? (
                          <>
                            <Pause className="h-3.5 w-3.5 fill-current" />
                            <span>To'xtatish</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Qirqilgan joydan eshitish</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Interactive In-Dashboard Spotify Preview */}
                  {embedUrl && (
                    <div className="pt-1">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        Spotify Player (To'liq ijro)
                      </p>
                      <iframe
                        src={embedUrl}
                        width="100%"
                        height="152"
                        frameBorder="0"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="w-full rounded-2xl border border-white/10 shadow-sm"
                        title="Spotify Dashboard Preview"
                      />
                    </div>
                  )}
                </div>
              </Card>
            ) : null}

            {/* Track Selector & Search Studio */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border/70 p-3 sm:p-4">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("search")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all text-center",
                      activeTab === "search"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-text-secondary hover:text-foreground hover:bg-surface/50"
                    )}
                  >
                    <Search className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Qidiruv</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("link")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all text-center",
                      activeTab === "link"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-text-secondary hover:text-foreground hover:bg-surface/50"
                    )}
                  >
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Havola</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all text-center",
                      activeTab === "upload"
                        ? "bg-foreground text-background shadow-xs"
                        : "text-text-secondary hover:text-foreground hover:bg-surface/50"
                    )}
                  >
                    <Upload className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Audio yuklash</span>
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* TAB 1: Search Tracks */}
                {activeTab === "search" && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSearch();
                      }}
                      className="flex flex-col sm:flex-row gap-2"
                    >
                      <Input
                        type="text"
                        placeholder="Qo'shiq yoki ijrochi nomi (masalan: Konsta, Xamdam, Billie Eilish)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 rounded-xl text-xs flex-1 min-w-0"
                      />
                      <Button
                        type="submit"
                        disabled={isSearching || !searchQuery.trim()}
                        className="shrink-0 h-11 px-5 rounded-xl text-xs font-bold w-full sm:w-auto"
                      >
                        {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Qidirish"}
                      </Button>
                    </form>

                    {/* Quick Mood Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                        Tavsiya etilgan trendlar
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {MUSIC_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setSearchQuery(p.query);
                              handleSearch(p.query);
                            }}
                            className="rounded-full border border-border/80 bg-surface/40 px-3 py-1 text-[11px] font-medium text-text-secondary hover:border-emerald-500 hover:text-foreground transition-colors"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Results List WITH INSTANT AUDIO PREVIEW */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
                            Topilgan treklar ({searchResults.length})
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            ▶ Tugmasi orqali avval eshitib ko'ring
                          </span>
                        </div>
                        <div className="space-y-2 rounded-2xl border border-border p-2 bg-surface/20 max-h-80 overflow-y-auto scrollbar-thin">
                          {searchResults.map((item) => {
                            const isPlayingThis = previewingId === item.id;
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "flex items-center justify-between gap-3 rounded-xl p-2.5 transition-all border",
                                  isPlayingThis
                                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-xs"
                                    : "hover:bg-surface/80 border-transparent"
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* Artwork with Play / Pause button overlay */}
                                  <div
                                    onClick={() => toggleTrackPreview(item)}
                                    className="group relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
                                    title={isPlayingThis ? "To'xtatish" : "Oldindan eshitib ko'rish"}
                                  >
                                    {item.artwork ? (
                                      <Image
                                        src={item.artwork}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-white">
                                        <Music className="h-5 w-5" />
                                      </div>
                                    )}

                                    {/* Play / Pause Overlay Icon */}
                                    <div
                                      className={cn(
                                        "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
                                        isPlayingThis ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                      )}
                                    >
                                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-md">
                                        {isPlayingThis ? (
                                          <Pause className="h-3.5 w-3.5 fill-current" />
                                        ) : (
                                          <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <h5 className="truncate text-xs font-bold text-foreground">
                                        {item.title}
                                      </h5>
                                      {isPlayingThis && (
                                        <span className="flex items-end gap-0.5 h-2.5 shrink-0">
                                          <span className="w-0.5 h-full bg-emerald-500 animate-pulse" />
                                          <span className="w-0.5 h-2/3 bg-emerald-500 animate-pulse" style={{ animationDuration: "600ms" }} />
                                          <span className="w-0.5 h-4/5 bg-emerald-500 animate-pulse" style={{ animationDuration: "400ms" }} />
                                        </span>
                                      )}
                                    </div>
                                    <p className="truncate text-[11px] text-text-secondary mt-0.5">
                                      {item.artist}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Direct preview button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleTrackPreview(item)}
                                    className={cn(
                                      "flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                                      isPlayingThis
                                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-surface text-text-secondary hover:text-foreground"
                                    )}
                                    title={isPlayingThis ? "To'xtatish" : "Eshitish"}
                                  >
                                    {isPlayingThis ? (
                                      <>
                                        <Pause className="h-3 w-3 fill-current" />
                                        <span className="hidden sm:inline">To'xtatish</span>
                                      </>
                                    ) : (
                                      <>
                                        <Play className="h-3 w-3 fill-current ml-0.5" />
                                        <span className="hidden sm:inline">Eshitish</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Select button */}
                                  <Button
                                    size="sm"
                                    onClick={() => handleSelectSearchResult(item)}
                                    className="shrink-0 h-8 px-3 rounded-lg text-xs font-bold"
                                  >
                                    Tanlash
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: Paste Direct Spotify Link */}
                {activeTab === "link" && (
                  <form onSubmit={handleResolveUrl} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Spotify trek yoki albom havolasi
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="url"
                          placeholder="https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          className="h-11 rounded-xl text-xs flex-1 min-w-0"
                        />
                        <Button
                          type="submit"
                          disabled={isResolving || !urlInput.trim()}
                          className="shrink-0 h-11 px-5 rounded-xl text-xs font-bold w-full sm:w-auto"
                        >
                          {isResolving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Biriktirish"}
                        </Button>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        Spotify ilovasidan istalgan trek manzilini nusxalab (Share → Copy Song Link) bu yerga qo'ying.
                      </p>
                    </div>
                  </form>
                )}

                {/* TAB 3: Upload Custom MP3 */}
                {activeTab === "upload" && (
                  <div className="space-y-3">
                    <div className="rounded-2xl border-2 border-dashed border-border/80 bg-surface/30 p-6 text-center hover:border-emerald-500/40 transition-colors">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-3">
                        <FileAudio className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        O'zingiz qirqqan shaxsiy audio faylni yuklang
                      </h4>
                      <p className="mt-1 text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                        Telefonda yoki kompyuterda qirqib olingan MP3, WAV yoki M4A audio faylingizni yuklang (maks. 25MB). 30 soniyalik cheklovlarsiz ishlaydi.
                      </p>

                      <div className="mt-4">
                        <label className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors cursor-pointer">
                          {isUploadingAudio ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Yuklanmoqda...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5" />
                              <span>Audio fayl tanlash (MP3, M4A, WAV)</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac,.flac,.weba"
                            disabled={isUploadingAudio}
                            onChange={handleCustomAudioUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Display Layout Mode */}
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-emerald-500" />
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    Pleyer ko'rinish uslubi
                  </h3>
                </div>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Profilingiz ochilganda musiqa qanday ko'rinishda turishini tanlang.
                </p>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={async () => {
                    setLayout("floating");
                    try {
                      await persistMusicToServer({ spotifyMusicLayout: "floating" });
                    } catch {}
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    layout === "floating"
                      ? "border-emerald-500 bg-emerald-500/[0.08] shadow-sm"
                      : "border-border/80 bg-surface/30 hover:border-border"
                  )}
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500">
                    {layout === "floating" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </span>
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Suzuvchi shisha panel (Tavsiya etiladi)
                    </span>
                    <span className="mt-1 block text-[11px] text-text-secondary leading-relaxed">
                      Ekran pastki burchagida qulay panel bo'lib turadi. Mehmon sahifani pastga aylantirsa ham musiqa to'xtamaydi.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setLayout("card");
                    try {
                      await persistMusicToServer({ spotifyMusicLayout: "card" });
                    } catch {}
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    layout === "card"
                      ? "border-emerald-500 bg-emerald-500/[0.08] shadow-sm"
                      : "border-border/80 bg-surface/30 hover:border-border"
                  )}
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-emerald-500">
                    {layout === "card" && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </span>
                  <div>
                    <span className="block text-xs font-bold text-foreground">
                      Profil ichidagi kartochka
                    </span>
                    <span className="mt-1 block text-[11px] text-text-secondary leading-relaxed">
                      Profilingiz havolalari orasida zamonaviy musiqa blok sifatida ko'rinadi.
                    </span>
                  </div>
                </button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Live Mobile Preview */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Jonli Profil Ko'rinishi
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  {enabled ? "Musiqa yoqilgan" : "To'xtatilgan"}
                </span>
              </div>

              {/* Phone Mockup Frame */}
              <div className="relative mx-auto aspect-[9/18] w-full max-w-[300px] overflow-hidden rounded-[36px] sm:rounded-[40px] border-[5px] sm:border-[6px] border-zinc-800 bg-zinc-950 p-3 sm:p-4 text-white shadow-2xl">
                {/* Phone Notch */}
                <div className="mx-auto mb-4 h-4 w-28 rounded-full bg-zinc-800" />

                {/* Simulated Profile Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full border-2 border-emerald-500/50 bg-zinc-800">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-white">
                        {profile?.username?.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-extrabold text-white">
                    {profile?.displayName || `@${profile?.username || "creator"}`}
                  </h4>
                  <p className="text-[10px] text-zinc-400">@{profile?.username}</p>
                </div>

                {/* Simulated Links */}
                <div className="mt-5 space-y-2">
                  <div className="h-9 w-full rounded-xl bg-white/10" />
                  <div className="h-9 w-full rounded-xl bg-white/10" />

                  {/* If Embedded Card mode */}
                  {enabled && layout === "card" && (trackUrl || trackTitle || trackPreview) && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-center animate-in fade-in">
                      <div className="flex items-center gap-2">
                        {trackImage && (
                          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                            <img src={trackImage} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 text-left">
                          <p className="truncate text-[10px] font-bold text-white">
                            {trackTitle || "Spotify Track"}
                          </p>
                          <p className="truncate text-[9px] text-emerald-400">
                            {trackArtist || "Spotify"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-9 w-full rounded-xl bg-white/10" />
                </div>

                {/* If Floating Pill mode */}
                {enabled && layout === "floating" && (trackUrl || trackTitle || trackPreview) && (
                  <div className="absolute bottom-6 inset-x-3 rounded-xl border border-white/20 bg-zinc-900/90 p-2 shadow-xl backdrop-blur-xl animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-emerald-600">
                        {trackImage ? (
                          <img src={trackImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Music className="h-4 w-4 m-auto text-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-bold text-white">
                          {trackTitle || "Spotify Track"}
                        </p>
                        <p className="truncate text-[8px] text-zinc-400">
                          {trackArtist || "Spotify"}
                        </p>
                      </div>
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
                        <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

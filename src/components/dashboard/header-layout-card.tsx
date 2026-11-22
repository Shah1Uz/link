"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Zap,
  Plus,
  Loader2,
  Pencil,
  Info,
  Undo2,
  Redo2,
  Save,
  Sparkles,
  Video,
  Play,
  Trash2,
  ShieldCheck,
  Upload,
  Film,
  Link2,
  Check,
  Sliders,
  Wand2,
  Layers,
  SunMedium,
} from "lucide-react";
import { useDashboard } from "@/context/dashboard-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getFontFamilyCss } from "@/lib/fonts-catalog";

const VIDEO_PRESETS = [
  {
    name: "Cosmic Stars",
    desc: "Tungi koinot va yulduzlar harakati",
    url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  },
  {
    name: "Sunset Horizon",
    desc: "Quyosh botishi va sokin ufq",
    url: "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
  },
  {
    name: "Neon Ambient",
    desc: "Dinamik zamonaviy neon nurlari",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
];

interface HeaderLayoutCardProps {
  layout: string;
  onLayoutChange: (layout: string) => void;
  avatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
  bannerUrl?: string | null;
  onBannerChange?: (url: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  className?: string;
}

const LAYOUT_OPTIONS = [
  {
    id: "classic",
    label: "Classic",
    isPro: false,
    description: "Timeless circular avatar centered with accent border",
  },
  {
    id: "hero",
    label: "Hero",
    isPro: true,
    description: "Expansive edge-to-edge header photo with smooth gradient fade",
  },
  {
    id: "banner",
    label: "Banner",
    isPro: true,
    description: "Landscape cover photo with overlapping centered avatar",
  },
  {
    id: "cutout",
    label: "Cutout",
    isPro: true,
    description: "Frameless floating portrait silhouette with soft bottom fade",
  },
  {
    id: "shape",
    label: "Shape",
    isPro: true,
    description: "Artistic fluid organic petal shape masking the avatar",
  },
];

// Stylized Neon N geometric logo from the user's reference
export function NeonNLogo({ className = "w-full h-full" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-black ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3/4 h-3/4"
      >
        {/* Left vertical block */}
        <polygon points="22,18 40,18 40,68 22,82" fill="#a3e635" />
        {/* Diagonal angled connector */}
        <polygon points="40,28 50,42 50,66 40,52" fill="#84cc16" />
        <polygon points="50,42 60,56 60,80 50,66" fill="#bef264" />
        {/* Right vertical block */}
        <polygon points="60,18 78,32 78,82 60,82" fill="#a3e635" />
      </svg>
    </div>
  );
}

export function HeaderLayoutCard({
  layout,
  onLayoutChange,
  avatarUrl,
  onAvatarChange,
  bannerUrl,
  onBannerChange,
  title: initialTitleProp,
  onTitleChange,
  className,
}: HeaderLayoutCardProps) {
  const { profile, updateProfile, theme, updateTheme } = useDashboard();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local state for layout, avatar, banner, and title
  const [currentLayout, setCurrentLayout] = useState(layout || profile?.layout || "classic");
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl || profile?.avatarUrl || "");
  const [currentBanner, setCurrentBanner] = useState(bannerUrl || profile?.bannerUrl || "");
  const [currentTitle, setCurrentTitle] = useState(
    initialTitleProp !== undefined
      ? initialTitleProp
      : profile?.displayName || `@${profile?.username || "shahuztech"}`
  );
  const [currentVideo, setCurrentVideo] = useState<string | null>(
    theme?.backgroundVideo || (theme?.backgroundType === "video" ? theme?.backgroundImage : null) || null
  );
  const [videoUrlInput, setVideoUrlInput] = useState("");

  useEffect(() => {
    const v = theme?.backgroundVideo || (theme?.backgroundType === "video" ? theme?.backgroundImage : null) || null;
    setCurrentVideo(v);
  }, [theme?.backgroundVideo, theme?.backgroundType, theme?.backgroundImage]);

  const currentHeroBlur = theme?.heroBlur || "16px";
  const currentHeroFade = theme?.heroFade || "high";
  const currentHeroDarken = theme?.heroDarken || "balanced";

  const handleUpdateHeroSettings = async (settings: {
    heroBlur?: string;
    heroFade?: string;
    heroDarken?: string;
  }) => {
    updateTheme(settings);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Hero sozlamasini saqlashda xatolik");
      }
    } catch (err: any) {
      toast.error(err.message || "Hero sozlamasini saqlashda xatolik");
    }
  };

  // History stack for Undo / Redo
  type HistoryItem = {
    layout: string;
    avatarUrl: string;
    bannerUrl: string;
    title: string;
  };

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      layout: currentLayout,
      avatarUrl: currentAvatar,
      bannerUrl: currentBanner,
      title: currentTitle,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync with prop changes if modified externally
  useEffect(() => {
    if (layout && layout !== currentLayout) {
      setCurrentLayout(layout);
    }
  }, [layout]);

  useEffect(() => {
    if (avatarUrl !== undefined && avatarUrl !== currentAvatar) {
      setCurrentAvatar(avatarUrl || "");
    }
  }, [avatarUrl]);

  const pushState = (newItem: Partial<HistoryItem>) => {
    const nextItem: HistoryItem = {
      layout: newItem.layout ?? currentLayout,
      avatarUrl: newItem.avatarUrl ?? currentAvatar,
      bannerUrl: newItem.bannerUrl ?? currentBanner,
      title: newItem.title ?? currentTitle,
    };
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(nextItem);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSelectLayout = async (layoutId: string) => {
    setCurrentLayout(layoutId);
    onLayoutChange(layoutId);
    updateProfile({ layout: layoutId });
    pushState({ layout: layoutId });
    toast.success(`Layout switched to ${layoutId.toUpperCase()}`);

    // Persist layout in real-time
    try {
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: layoutId }),
      });
    } catch {}
  };

  const handleTitleChange = (val: string) => {
    if (val.length > 30) return;
    setCurrentTitle(val);
    if (onTitleChange) onTitleChange(val);
    updateProfile({ displayName: val });

    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);
    titleTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: val }),
        });
      } catch {}
    }, 500);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentLayout(prev.layout);
      setCurrentAvatar(prev.avatarUrl);
      setCurrentBanner(prev.bannerUrl);
      setCurrentTitle(prev.title);
      onLayoutChange(prev.layout);
      if (onAvatarChange) onAvatarChange(prev.avatarUrl);
      if (onBannerChange) onBannerChange(prev.bannerUrl);
      if (onTitleChange) onTitleChange(prev.title);
      updateProfile({
        layout: prev.layout,
        avatarUrl: prev.avatarUrl,
        bannerUrl: prev.bannerUrl,
        displayName: prev.title,
      });
      toast.info("Amal bekor qilindi (Undo)");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentLayout(next.layout);
      setCurrentAvatar(next.avatarUrl);
      setCurrentBanner(next.bannerUrl);
      setCurrentTitle(next.title);
      onLayoutChange(next.layout);
      if (onAvatarChange) onAvatarChange(next.avatarUrl);
      if (onBannerChange) onBannerChange(next.bannerUrl);
      if (onTitleChange) onTitleChange(next.title);
      updateProfile({
        layout: next.layout,
        avatarUrl: next.avatarUrl,
        bannerUrl: next.bannerUrl,
        displayName: next.title,
      });
      toast.info("Qaytarildi (Redo)");
    }
  };

  const handleCancel = () => {
    const initial = history[0];
    setHistoryIndex(0);
    setCurrentLayout(initial.layout);
    setCurrentAvatar(initial.avatarUrl);
    setCurrentBanner(initial.bannerUrl);
    setCurrentTitle(initial.title);
    onLayoutChange(initial.layout);
    if (onAvatarChange) onAvatarChange(initial.avatarUrl);
    if (onBannerChange) onBannerChange(initial.bannerUrl);
    if (onTitleChange) onTitleChange(initial.title);
    updateProfile({
      layout: initial.layout,
      avatarUrl: initial.avatarUrl,
      bannerUrl: initial.bannerUrl,
      displayName: initial.title,
    });
    toast.info("O'zgarishlar bekor qilindi");
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layout: currentLayout,
          avatarUrl: currentAvatar || null,
          bannerUrl: currentBanner || null,
          displayName: currentTitle,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save profile");
      }

      updateProfile({
        layout: currentLayout,
        avatarUrl: currentAvatar || null,
        bannerUrl: currentBanner || null,
        displayName: currentTitle,
      });

      // If in Classic layout, also ensure theme backgroundVideo is persisted
      if (currentLayout === "classic") {
        const bgType = currentVideo
          ? "video"
          : theme?.backgroundType === "video"
          ? "color"
          : theme?.backgroundType || "color";
        await fetch("/api/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backgroundVideo: currentVideo,
            backgroundType: bgType,
          }),
        });
        updateTheme({
          backgroundVideo: currentVideo,
          backgroundType: bgType,
        });
      }

      toast.success("Header va profil muvaffaqiyatli saqlandi! ⚡");
    } catch (err: any) {
      toast.error(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setCurrentAvatar(json.url);
      if (onAvatarChange) onAvatarChange(json.url);
      updateProfile({ avatarUrl: json.url });
      pushState({ avatarUrl: json.url });

      // Persist to database
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: json.url }),
      });

      toast.success("Profil rasmi yangilandi!");
    } catch (err: any) {
      toast.error(err.message || "Rasm yuklashda xatolik yuz berdi");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari qabul qilinadi");
      return;
    }

    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setCurrentBanner(json.url);
      if (onBannerChange) onBannerChange(json.url);
      updateProfile({ bannerUrl: json.url });
      pushState({ bannerUrl: json.url });

      // Persist to database
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: json.url }),
      });

      toast.success("Header banneri yangilandi!");
    } catch (err: any) {
      toast.error(err.message || "Banner yuklashda xatolik yuz berdi");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSetVideo = async (url: string | null) => {
    setCurrentVideo(url);
    const newBgType = url ? "video" : (theme?.backgroundType === "video" ? "color" : theme?.backgroundType || "color");
    updateTheme({
      backgroundVideo: url,
      backgroundType: newBgType,
    });
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundVideo: url,
          backgroundType: newBgType,
        }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Video sozlamasini saqlashda xatolik");
      }
      toast.success(url ? "Orqa fon videosi o'rnatildi! 🎬" : "Orqa fon videosi olib tashlandi");
    } catch (err: any) {
      toast.error(err.message || "Video sozlamasini saqlashda xatolik");
    }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Faqat video fayllar (MP4, WEBM, MOV) qabul qilinadi");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("Video hajmi 25MB dan oshmasligi kerak");
      return;
    }

    setIsUploadingVideo(true);
    const toastId = toast.loading("Video yuklanmoqda...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Video yuklashda xatolik");
      }

      const data = await res.json();
      if (data.url) {
        await handleSetVideo(data.url);
        toast.success("Video yuklandi va fon sifatida o'rnatildi! ⚡", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Video yuklashda xatolik", { id: toastId });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  // Model preview image or creator's actual avatar
  const previewModelPhoto =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
  const displayCardAvatar = currentAvatar || previewModelPhoto;

  const isProLayout = LAYOUT_OPTIONS.find((option) => option.id === currentLayout)?.isPro;

  return (
    <div
      className={`rounded-3xl border border-border/80 bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6 ${className || ""}`}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
              Header & avatar
            </h2>
            <p className="text-[11px] text-text-secondary">
              Pick a layout, upload artwork and fine-tune your headline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-surface/40 text-text-secondary transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-text-secondary"
            title="Bekor qilish (Undo)"
            aria-label="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/70 bg-surface/40 text-text-secondary transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-text-secondary"
            title="Qaytarish (Redo)"
            aria-label="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 rounded-lg px-3 text-[11px] font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={isSaving}
            className="h-8 gap-1.5 rounded-lg px-3 text-[11px] font-bold"
          >
            {!isSaving && <Save className="h-3.5 w-3.5" />}
            <span>Save</span>
          </Button>
        </div>
      </div>

      {/* Layout picker */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary">
            Layout
          </h3>
          {isProLayout && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <Zap className="h-2.5 w-2.5 fill-current" />
              Pro layout
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = currentLayout === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectLayout(opt.id)}
                title={opt.description}
                className={`group relative flex flex-col items-center justify-between rounded-2xl border p-3 transition-all duration-200 ease-out-soft active:scale-[0.98] ${
                  isSelected
                    ? "border-2 border-emerald-500 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40"
                    : "border-border/80 bg-surface/30 hover:border-border hover:bg-surface/60"
                }`}
                style={{ minHeight: "122px" }}
              >
                {opt.isPro && (
                  <span
                    className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-amber-950 shadow-md transition-transform group-hover:scale-110"
                    title="Pro feature"
                  >
                    <Zap className="h-3 w-3 fill-current text-amber-950" />
                  </span>
                )}

                <div className="flex w-full flex-1 items-center justify-center pb-1 pt-1">
                  {opt.id === "classic" && (
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-sm transition-transform group-hover:scale-105">
                      <img
                        src={displayCardAvatar}
                        alt="Classic"
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  )}

                  {opt.id === "hero" && (
                    <div className="relative h-14 w-16 overflow-hidden rounded-t-xl shadow-sm transition-transform group-hover:scale-105">
                      <img
                        src={displayCardAvatar}
                        alt="Hero"
                        className="h-full w-full object-cover object-top"
                      />
                      {/* Smooth color gradient fade into card background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 via-40% to-transparent" />
                    </div>
                  )}

                  {opt.id === "banner" && (
                    <div className="flex w-full flex-col items-center transition-transform group-hover:scale-105">
                      <div className="relative h-7 w-16 overflow-hidden rounded-t-md shadow-2xs">
                        <img
                          src={currentBanner || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=80"}
                          alt="Banner"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="-mt-3.5 h-7 w-7 overflow-hidden rounded-full border-2 border-card shadow-xs">
                        <img
                          src={displayCardAvatar}
                          alt="Avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {opt.id === "cutout" && (
                    <div className="relative flex h-12 w-12 items-end justify-center transition-transform group-hover:scale-105">
                      <img
                        src={displayCardAvatar}
                        alt="Cutout"
                        className="h-full w-auto object-contain [mask-image:linear-gradient(to_bottom,black_75%,transparent_100%)] drop-shadow-sm"
                      />
                    </div>
                  )}

                  {opt.id === "shape" && (
                    <div
                      className="flex h-12 w-16 items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 p-0.5 shadow-xs transition-transform group-hover:scale-105"
                      style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                    >
                      <div
                        className="h-full w-full overflow-hidden"
                        style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
                      >
                        <img
                          src={displayCardAvatar}
                          alt="Shape"
                          className="h-full w-full scale-110 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <span
                  className={`text-[11px] tracking-tight ${
                    isSelected
                      ? "font-bold text-foreground"
                      : "font-semibold text-text-secondary group-hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile image */}
      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
        <div>
          <h4 className="text-[13px] font-bold text-foreground">Profile image</h4>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            Square images look best — 512×512 or larger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => avatarInputRef.current?.click()}
          className="group relative cursor-pointer"
          title="Qurilmadan rasm yuklash yoki o'zgartirish"
          aria-label="Upload profile image"
        >
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-sm transition-transform group-hover:scale-105">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <NeonNLogo className="h-full w-full" />
            )}
          </div>

          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-md transition-transform group-hover:scale-110">
            {isUploadingAvatar ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
          </div>
        </button>
      </div>

      {/* Hero quality hint & Hero Blur/Fade Controls */}
      {currentLayout === "hero" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Quality advisory */}
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/[0.06] p-3.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-500/50 text-sky-600 dark:text-sky-400">
              <Info className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <div className="flex-1 text-xs">
              <p className="text-[12px] font-bold text-sky-900 dark:text-sky-200">
                Tavsiya: Yuqori aniqlikdagi rasm ishlating
              </p>
              <p className="mt-0.5 leading-relaxed text-text-secondary">
                Hero dizayni 1160×1160 piksel yoki undan katta sifatli rasmlar bilan eng go&apos;zal ko&apos;rinadi.
              </p>
            </div>
          </div>

          {/* Hero Gradient & Fade Control Center */}
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.06] to-surface/40 p-4.5 sm:p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500">
                  <Sliders className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-[13px] font-bold text-foreground">
                      Hero Rangli Gradyent (Gradient Fade) Sozlamalari
                    </h4>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                      Jonli Sozlama
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-text-secondary">
                    Rasm pastki qismining orqa fon rangi bilan silliq qo&apos;shilib, erib ketish (Gradient) darajasini boshqaring.
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 sm:self-auto">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span>
                  {currentHeroFade === "high"
                    ? "Baland gradyent ⚡ (75%)"
                    : currentHeroFade === "full"
                    ? "Maksimal (90%)"
                    : currentHeroFade === "low"
                    ? "Pastki fade (35%)"
                    : "O'rtacha gradyent (55%)"}
                </span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                ⚡ Tezkor Shablonlar
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  {
                    id: "elevated-default",
                    label: "⚡ Baland Gradyent",
                    desc: "Tavsiya etiladi (75%)",
                    fade: "high",
                    darken: "balanced",
                  },
                  {
                    id: "standard-gradient",
                    label: "🎨 O'rtacha Gradyent",
                    desc: "Standart muvozanat",
                    fade: "medium",
                    darken: "balanced",
                  },
                  {
                    id: "soft-subtle",
                    label: "🖼️ Yengil Fade",
                    desc: "Rasm ko'proq (35%)",
                    fade: "low",
                    darken: "subtle",
                  },
                  {
                    id: "deep-merge",
                    label: "🌑 To'liq Singish",
                    desc: "Maksimal (90%)",
                    fade: "full",
                    darken: "deep",
                  },
                ].map((preset) => {
                  const isActive =
                    preset.fade === currentHeroFade &&
                    preset.darken === currentHeroDarken;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        handleUpdateHeroSettings({
                          heroFade: preset.fade,
                          heroDarken: preset.darken,
                          heroBlur: "none",
                        })
                      }
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? "border-emerald-500 bg-emerald-500/15 shadow-xs ring-1 ring-emerald-500/30"
                          : "border-border/70 bg-card/60 hover:border-emerald-500/50 hover:bg-surface"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-foreground">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-0.5">
                        {preset.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Controls: Fade Height (Ko'tarilish balandligi) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <Layers className="h-3 w-3 text-emerald-500" />
                  <span>Gradient balandligi (Qancha yuqoridan fon rangiga o&apos;tishi)</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-500 font-medium">
                  {currentHeroFade === "low"
                    ? "Past (35%)"
                    : currentHeroFade === "medium"
                    ? "O'rtacha (55%)"
                    : currentHeroFade === "full"
                    ? "Maksimal (90%)"
                    : "Baland (75% - Ko'tarilgan)"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: "low", label: "Past", sub: "35% pastda" },
                  { id: "medium", label: "O'rtacha", sub: "55% qism" },
                  { id: "high", label: "Baland ⚡", sub: "75% ko'tarilgan" },
                  { id: "full", label: "Maksimal", sub: "90% singish" },
                ].map((item) => {
                  const isSelected =
                    currentHeroFade === item.id || (!currentHeroFade && item.id === "high");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateHeroSettings({ heroFade: item.id, heroBlur: "none" })}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white font-bold shadow-xs"
                          : "border-border/70 bg-card/60 hover:border-emerald-500/40 text-text-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="text-[11px] leading-tight font-semibold">{item.label}</div>
                      <div
                        className={`text-[9px] ${
                          isSelected ? "text-white/90" : "text-text-secondary/70"
                        }`}
                      >
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Individual Controls: Darken (Qoraytirish) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <SunMedium className="h-3 w-3 text-emerald-500" />
                  <span>Pastki kontrast / Qoraytirish tusi</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-500 font-medium">
                  {currentHeroDarken === "subtle"
                    ? "Yengil"
                    : currentHeroDarken === "deep"
                    ? "Chuqur"
                    : "Optimal"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "subtle", label: "Yengil", sub: "Tabiiy tus" },
                  { id: "balanced", label: "Optimal", sub: "O'rtacha kontrast" },
                  { id: "deep", label: "Chuqur", sub: "To'yingan rang" },
                ].map((item) => {
                  const isSelected =
                    currentHeroDarken === item.id ||
                    (!currentHeroDarken && item.id === "balanced");

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateHeroSettings({ heroDarken: item.id, heroBlur: "none" })}
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white font-bold shadow-xs"
                          : "border-border/70 bg-card/60 hover:border-emerald-500/40 text-text-secondary hover:text-foreground"
                      }`}
                    >
                      <div className="text-[11px] leading-tight font-semibold">{item.label}</div>
                      <div
                        className={`text-[9px] ${
                          isSelected ? "text-white/90" : "text-text-secondary/70"
                        }`}
                      >
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner upload */}
      {currentLayout === "banner" && (
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-dashed border-border/70 pt-5 animate-in fade-in">
          <div>
            <h4 className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
              <span>Header banner image</span>
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Banner layout
              </span>
            </h4>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              Profil yuqorisidagi landshaft muqova rasmi
            </p>
          </div>

          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="group relative cursor-pointer"
            title="Qurilmadan banner rasmi yuklash"
            aria-label="Upload banner image"
          >
            <div className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-xl border border-border/80 bg-surface shadow-xs transition-transform group-hover:scale-105">
              <img
                src={
                  currentBanner ||
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80"
                }
                alt="Banner"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-md transition-transform group-hover:scale-110">
              {isUploadingBanner ? (
                <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
              ) : (
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
            </div>
          </button>
        </div>
      )}

      {/* Classic Background Video Section - strictly only for Classic layout */}
      {currentLayout === "classic" && (
        <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/[0.04] to-surface/40 p-4.5 sm:p-5 animate-in fade-in">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <Video className="h-4 w-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-bold text-foreground">
                    Orqa fon videosi (Classic)
                  </h4>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                    Faqat Classic uchun
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-text-secondary">
                  Profil orqa foniga dinamik video loop o&apos;rnatish.
                </p>
              </div>
            </div>

            {/* Readability & Contrast Guarantee badge */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-medium text-sky-700 dark:text-sky-300 sm:self-auto">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
              <span>Smart Contrast Shield: matnlar 100% aniq ko&apos;rinadi</span>
            </div>
          </div>

          {/* Current Video Preview Box */}
          {currentVideo ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border/80 bg-zinc-950 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-24 overflow-hidden rounded-lg border border-white/10 bg-black">
                    <video
                      src={currentVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white/90 fill-white/80" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      Faol video o&apos;rnatilgan
                    </p>
                    <p className="truncate text-[10px] text-text-secondary">
                      {currentVideo.startsWith("/uploads/") ? "Yuklangan video fayli" : currentVideo}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="h-8 gap-1.5 text-xs font-medium"
                  >
                    {isUploadingVideo ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>Boshqa video</span>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSetVideo(null)}
                    className="h-8 gap-1.5 text-xs font-medium"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Olib tashlash</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface/30 p-4 text-center sm:p-5">
              <Film className="h-7 w-7 text-text-secondary/60 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">
                Hozircha orqa fonda video yo&apos;q
              </p>
              <p className="mt-0.5 text-[11px] text-text-secondary max-w-sm">
                Qurilmangizdan video yuklang yoki quyidagi tayyor ambient video looplaridan birini tanlang.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploadingVideo}
                className="mt-3 h-8.5 gap-2 rounded-xl border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300"
              >
                {isUploadingVideo ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                <span>Qurilmadan video yuklash (MP4, WEBM max 25MB)</span>
              </Button>
            </div>
          )}

          {/* Curated ambient video presets */}
          <div className="mt-4">
            <p className="text-[11px] font-bold text-foreground uppercase tracking-wider mb-2">
              Tayyor Ambient Video Looplar:
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {VIDEO_PRESETS.map((preset) => {
                const isActive = currentVideo === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSetVideo(preset.url)}
                    className={`group relative flex flex-col rounded-xl border p-2.5 text-left transition-all ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "border-border/70 bg-surface/50 hover:border-emerald-500/40 hover:bg-surface/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                        {preset.name}
                      </span>
                      {isActive && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-black">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="mt-1 text-[10px] text-text-secondary line-clamp-1">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Video URL input */}
          <div className="mt-3.5 flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Link2 className="pointer-events-none absolute left-3.5 z-10 h-4 w-4 text-text-secondary" />
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="yoki to'g'ridan-to'g'ri video URL kiriting (https://...mp4)"
                style={{ paddingLeft: "2.75rem" }}
                className="w-full rounded-xl border border-border/80 bg-background/60 pr-3 py-2 text-xs text-foreground placeholder:text-text-secondary/60 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!videoUrlInput.trim()}
              onClick={() => {
                if (videoUrlInput.trim()) {
                  handleSetVideo(videoUrlInput.trim());
                  setVideoUrlInput("");
                }
              }}
              className="h-9 text-xs font-semibold px-3.5"
            >
              Qo&apos;llash
            </Button>
          </div>
        </div>
      )}

      {/* Title / NIK */}
      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-[13px] font-bold text-foreground">Headline title (NIK)</h4>
            {theme?.fontHeading && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                {theme.fontHeading}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-text-secondary">Shown under your avatar in your selected font.</p>
        </div>

        <div className="w-full sm:w-80">
          <input
            type="text"
            maxLength={30}
            value={currentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => pushState({ title: currentTitle })}
            placeholder="@shahuztech"
            style={{ fontFamily: getFontFamilyCss(theme?.fontHeading) }}
            className="w-full rounded-xl border border-border/90 bg-background/60 px-3.5 py-2.5 text-base font-bold text-foreground shadow-xs transition-colors placeholder:font-normal placeholder:text-text-secondary/60 focus:border-emerald-500/60 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
          <p className="mt-1 text-right text-[10px] font-medium tabular-nums text-text-secondary">
            {currentTitle.length}/30
          </p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFile}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerFile}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleVideoFile}
      />
    </div>
  );
}

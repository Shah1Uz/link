"use client";

import React, { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Pencil,
  Upload,
  Ban,
  Droplet,
  Moon,
  Sun,
  Video as VideoIcon,
  Check,
  Sparkles,
  Layers,
  Palette,
  Image as ImageIcon,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  X,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Curated high quality preset background images
export const CURATED_WALLPAPERS = [
  {
    id: "melody_world",
    name: "Melody World",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "neon_cyber",
    name: "Neon Horizon",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "minimal_sand",
    name: "Desert Dusk",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "emerald_fog",
    name: "Forest Mist",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "cosmic_violet",
    name: "Cosmic Nebula",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "sunset_ocean",
    name: "Golden Waves",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80",
  },
];

// Curated high quality looping background videos
export const CURATED_VIDEOS = [
  {
    id: "neon_tunnel",
    name: "Neon Horizon",
    url: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-technological-tunnel-31908-large.mp4",
    poster: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "cosmic_stars",
    name: "Deep Galaxy",
    url: "https://assets.mixkit.co/videos/preview/mixkit-traveling-through-a-starfield-in-deep-space-32986-large.mp4",
    poster: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "digital_screens",
    name: "Cyber Grid",
    url: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-code-31910-large.mp4",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "liquid_motion",
    name: "Liquid Purple",
    url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-purple-liquid-waves-animation-41477-large.mp4",
    poster: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "sunset_ocean",
    name: "Sunset Waves",
    url: "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-at-sunset-4471-large.mp4",
    poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80",
  },
];

// Helper to adjust hex color brightness for seamless dynamic gradients
function adjustHexBrightness(hex: string, percent: number): string {
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function buildGradientCSS(
  baseColor: string,
  direction: "up" | "down" | "radial"
): string {
  const safeHex = baseColor.startsWith("#") ? baseColor : `#${baseColor}`;
  const darker = adjustHexBrightness(safeHex, -42);
  const deepDark = adjustHexBrightness(safeHex, -58);

  if (direction === "up") {
    return `linear-gradient(0deg, ${darker} 0%, ${safeHex} 100%)`;
  }
  if (direction === "down") {
    return `linear-gradient(180deg, ${safeHex} 0%, ${darker} 100%)`;
  }
  // radial: rich center-top glow fading into deep complement
  return `radial-gradient(ellipse at top, ${safeHex} 0%, ${deepDark} 85%)`;
}

export interface WallpaperStudioProps {
  backgroundType: "color" | "gradient" | "image" | "pattern" | "video" | "blur";
  onBackgroundTypeChange: (type: "color" | "gradient" | "image" | "pattern" | "video" | "blur") => void;
  backgroundImage: string | null;
  onBackgroundImageChange: (url: string | null) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  backgroundGradient: string;
  onBackgroundGradientChange: (gradient: string) => void;
  backgroundVideo?: string | null;
  onBackgroundVideoChange?: (url: string | null) => void;
  wallpaperEffect: string; // 'none' | 'mono' | 'blur' | 'halftone'
  onWallpaperEffectChange: (effect: string) => void;
  wallpaperTint: number; // 0 - 100
  onWallpaperTintChange: (tint: number) => void;
  wallpaperNoise: boolean;
  onWallpaperNoiseChange: (noise: boolean) => void;
  gradientStyle?: string; // 'custom' | 'premade'
  onGradientStyleChange?: (style: string) => void;
  gradientColor?: string; // hex like '#778a00'
  onGradientColorChange?: (color: string) => void;
  gradientDirection?: string; // 'up' | 'down' | 'radial'
  onGradientDirectionChange?: (direction: string) => void;
}

export function WallpaperStudio({
  backgroundType,
  onBackgroundTypeChange,
  backgroundImage,
  onBackgroundImageChange,
  backgroundColor,
  onBackgroundColorChange,
  backgroundGradient,
  onBackgroundGradientChange,
  backgroundVideo,
  onBackgroundVideoChange,
  wallpaperEffect,
  onWallpaperEffectChange,
  wallpaperTint,
  onWallpaperTintChange,
  wallpaperNoise,
  onWallpaperNoiseChange,
  gradientStyle = "custom",
  onGradientStyleChange,
  gradientColor = "#778a00",
  onGradientColorChange,
  gradientDirection = "radial",
  onGradientDirectionChange,
}: WallpaperStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState("");

  const activeImage = backgroundImage || CURATED_WALLPAPERS[0].url;
  const activeGradientStyle = gradientStyle || "custom";
  const activeGradientColor = gradientColor || "#778a00";
  const activeGradientDir = (gradientDirection || "radial") as "up" | "down" | "radial";

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Iltimos, rasm faylini tanlang (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Rasm hajmi 10MB dan oshmasligi kerak");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Fon rasmi yuklanmoqda...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Rasm yuklashda xatolik yuz berdi");
      }

      const data = await res.json();
      const newUrl = data.url;

      onBackgroundImageChange(newUrl);
      onBackgroundTypeChange("image");
      toast.success("Fon rasmi muvaffaqiyatli yangilandi! 🖼️", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Rasm yuklanmadi", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Iltimos, video fayl tanlang (MP4, WEBM, MOV)");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Video hajmi 25MB dan oshmasligi kerak");
      return;
    }

    setIsUploadingVideo(true);
    const toastId = toast.loading("Video yuklanmoqda... 📹");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Video yuklashda xatolik yuz berdi");
      }

      const data = await res.json();
      const newVideoUrl = data.url;

      onBackgroundVideoChange?.(newVideoUrl);
      onBackgroundTypeChange("video");
      setShowVideoModal(false);
      toast.success("Fon videosi muvaffaqiyatli o'rnatildi! 🎬", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Video yuklanmadi", { id: toastId });
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const STYLES = [
    {
      id: "color" as const,
      label: "Fill",
      hasPro: false,
      renderPreview: () => (
        <div
          className="h-full w-full rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: backgroundColor || "#65a30d" }}
        />
      ),
    },
    {
      id: "gradient" as const,
      label: "Gradient",
      hasPro: true,
      renderPreview: () => (
        <div
          className="h-full w-full rounded-xl transition-transform duration-300 group-hover:scale-105"
          style={{
            background:
              backgroundGradient ||
              "radial-gradient(ellipse at top, #778a00 0%, #2a3000 85%)",
          }}
        />
      ),
    },
    {
      id: "blur" as const,
      label: "Blur",
      hasPro: true,
      renderPreview: () => (
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-tr from-lime-800 to-amber-700">
          <div className="absolute inset-0 bg-lime-500/40 backdrop-blur-md transition-transform duration-300 group-hover:scale-110" />
        </div>
      ),
    },
    {
      id: "pattern" as const,
      label: "Pattern",
      hasPro: true,
      renderPreview: () => (
        <div
          className="h-full w-full rounded-xl bg-[#5d7c0b] transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.3) 1.5px, transparent 0)`,
            backgroundSize: "8px 8px",
          }}
        />
      ),
    },
    {
      id: "image" as const,
      label: "Image",
      hasPro: true,
      renderPreview: () => (
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <img
            src={activeImage}
            alt="Wallpaper thumbnail"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      ),
    },
    {
      id: "video" as const,
      label: "Video",
      hasPro: true,
      renderPreview: () => (
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white transition-transform duration-300 group-hover:scale-105">
          {backgroundVideo ? (
            <video
              src={backgroundVideo}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-9 items-center justify-center rounded-md border border-zinc-500/60 bg-zinc-800/80 shadow-xs">
              <div className="h-0 w-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-current ml-0.5" />
            </div>
          )}
        </div>
      ),
    },
  ];

  const EFFECTS = [
    {
      id: "none",
      label: "None",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-2">
          <circle cx="12" cy="12" r="9" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
        </svg>
      ),
    },
    {
      id: "mono",
      label: "Mono",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18" />
          <path d="M12 5a7 7 0 0 1 0 14z" fill="currentColor" opacity="0.4" />
          <line x1="12" y1="7" x2="17" y2="7" />
          <line x1="12" y1="10" x2="19" y2="10" />
          <line x1="12" y1="13" x2="19" y2="13" />
          <line x1="12" y1="16" x2="17" y2="16" />
        </svg>
      ),
    },
    {
      id: "blur",
      label: "Blur",
      icon: <Droplet className="h-5 w-5" />,
    },
    {
      id: "halftone",
      label: "Halftone",
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
          <circle cx="7" cy="7" r="1.5" />
          <circle cx="12" cy="7" r="1.5" />
          <circle cx="17" cy="7" r="1.5" />
          <circle cx="7" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="17" cy="12" r="1.5" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="12" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden Image File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleUploadImage}
        className="hidden"
      />

      {/* Hidden Video File Input */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleUploadVideo}
        className="hidden"
      />

      <Card className="overflow-hidden border border-border/80 bg-card p-5 sm:p-6 shadow-xs">
        {/* SECTION 1: Wallpaper style (Matching Reference Exactly) */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold tracking-tight text-foreground">
            Wallpaper style
          </h3>

          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
            {STYLES.map((style) => {
              const isSelected = backgroundType === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    onBackgroundTypeChange(style.id);
                    if (style.id === "image" && !backgroundImage) {
                      onBackgroundImageChange(CURATED_WALLPAPERS[0].url);
                    }
                    if (style.id === "gradient" && (!backgroundGradient || backgroundGradient.includes("135deg"))) {
                      const newGrad = buildGradientCSS(activeGradientColor, activeGradientDir);
                      onBackgroundGradientChange(newGrad);
                    }
                    if (style.id === "video") {
                      setShowVideoModal(true);
                    }
                  }}
                  className={`group relative flex flex-col items-center gap-2 rounded-2xl p-1.5 transition-all duration-200 active:scale-95 text-center ${isSelected
                    ? "ring-2 ring-zinc-950 dark:ring-white border-2 border-zinc-950 dark:border-white shadow-md bg-surface/50 font-bold"
                    : "border-2 border-transparent hover:border-border/80 hover:bg-surface/30"
                    }`}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 shadow-2xs">
                    {style.renderPreview()}

                    {/* Pro Lightning Badge */}
                    {style.hasPro && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/75 text-amber-400 backdrop-blur-xs shadow-xs">
                        <Zap className="h-2.5 w-2.5 fill-current" />
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-semibold tracking-tight text-foreground">
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2-A: GRADIENT CONTROLS (Matching User Screenshot 3 Exactly) */}
        {backgroundType === "gradient" && (
          <div className="mt-6 border-t border-border/70 pt-5 space-y-6">
            {/* 1. Gradient style row: Custom vs Pre-made */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground">
                Gradient style
              </h4>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onGradientStyleChange?.("custom");
                    const newGrad = buildGradientCSS(activeGradientColor, activeGradientDir);
                    onBackgroundGradientChange(newGrad);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${activeGradientStyle === "custom"
                    ? "border-2 border-zinc-950 dark:border-white ring-1 ring-black/10 dark:ring-white/10 bg-card text-foreground shadow-xs font-extrabold"
                    : "border border-border/80 bg-surface/40 text-text-secondary hover:text-foreground hover:bg-surface/70 font-semibold"
                    }`}
                >
                  Custom
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onGradientStyleChange?.("premade");
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${activeGradientStyle === "premade"
                    ? "border-2 border-zinc-950 dark:border-white ring-1 ring-black/10 dark:ring-white/10 bg-card text-foreground shadow-xs font-extrabold"
                    : "border border-border/80 bg-surface/40 text-text-secondary hover:text-foreground hover:bg-surface/70 font-semibold"
                    }`}
                >
                  Pre-made
                </button>
              </div>
            </div>

            {/* When Gradient style is Custom */}
            {activeGradientStyle === "custom" && (
              <>
                {/* 2. Gradient color row with color swatch and HEX text */}
                <div className="flex items-center justify-between border-t border-border/70 pt-5">
                  <h4 className="text-sm font-bold text-foreground">
                    Gradient color
                  </h4>

                  <div className="relative">
                    <label
                      htmlFor="gradCustomPicker"
                      className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-border/80 bg-card px-3.5 py-2 shadow-xs transition-all hover:border-zinc-950 dark:hover:border-white hover:shadow-md"
                    >
                      <span
                        className="h-6 w-6 rounded-lg border border-black/15 shadow-inner transition-transform group-hover:scale-105"
                        style={{ backgroundColor: activeGradientColor }}
                      />
                      <span className="font-mono text-xs font-bold uppercase text-foreground">
                        {activeGradientColor}
                      </span>
                    </label>
                    <input
                      id="gradCustomPicker"
                      type="color"
                      value={activeGradientColor}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        onGradientColorChange?.(newColor);
                        const newGrad = buildGradientCSS(newColor, activeGradientDir);
                        onBackgroundGradientChange(newGrad);
                      }}
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* 3. Gradient direction: Linear up, Linear down, Radial */}
                <div className="space-y-3 border-t border-border/70 pt-5">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Gradient direction
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      How the colors transition
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {[
                      {
                        id: "up" as const,
                        label: "Linear up",
                        icon: <ArrowUp className="h-5 w-5" />,
                      },
                      {
                        id: "down" as const,
                        label: "Linear down",
                        icon: <ArrowDown className="h-5 w-5" />,
                      },
                      {
                        id: "radial" as const,
                        label: "Radial",
                        icon: (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current fill-none stroke-2">
                            <circle cx="12" cy="12" r="9" />
                            <circle cx="12" cy="12" r="4.5" />
                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                          </svg>
                        ),
                      },
                    ].map((dir) => {
                      const isSelected = activeGradientDir === dir.id;
                      return (
                        <button
                          key={dir.id}
                          type="button"
                          onClick={() => {
                            onGradientDirectionChange?.(dir.id);
                            const newGrad = buildGradientCSS(activeGradientColor, dir.id);
                            onBackgroundGradientChange(newGrad);
                          }}
                          className={`flex flex-col items-center justify-center rounded-2xl p-3.5 transition-all duration-200 active:scale-95 ${isSelected
                            ? "border-2 border-zinc-950 dark:border-white ring-1 ring-zinc-950/20 dark:ring-white/20 bg-surface/60 shadow-xs font-bold text-foreground"
                            : "border border-border/80 bg-card hover:bg-surface/40 text-text-secondary hover:text-foreground"
                            }`}
                        >
                          <div className="mb-1.5 text-current">{dir.icon}</div>
                          <span className="text-xs font-semibold">{dir.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* When Gradient style is Pre-made */}
            {activeGradientStyle === "premade" && (
              <div className="space-y-3 border-t border-border/70 pt-5">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Pre-made Gradients
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    Kreatorlar uchun maxsus tayyorlangan rang-barang gradientlar
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {[
                    { name: "Olive Horizon", value: "linear-gradient(135deg, #a16207 0%, #4d7c0f 100%)" },
                    { name: "Sunset Ember", value: "linear-gradient(135deg, #2e1065 0%, #7c2d12 60%, #c2410c 100%)" },
                    { name: "Electric Azure", value: "linear-gradient(180deg, #0f172a 0%, #020617 100%)" },
                    { name: "Rose Velvet", value: "radial-gradient(ellipse at top, #4c0519 0%, #0f0206 70%)" },
                    { name: "Emerald Aurora", value: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)" },
                    { name: "Midnight Purple", value: "linear-gradient(135deg, #3b0764 0%, #1e1b4b 100%)" },
                  ].map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => {
                        onBackgroundGradientChange(g.value);
                        toast.success(`${g.name} gradient tanlandi!`);
                      }}
                      className={`group relative flex h-16 items-end justify-between overflow-hidden rounded-xl border-2 p-2 text-left transition-all ${backgroundGradient === g.value
                        ? "border-emerald-500 ring-2 ring-emerald-500/25"
                        : "border-border/70 hover:border-border"
                        }`}
                      style={{ background: g.value }}
                    >
                      <span className="text-[10px] font-bold text-white drop-shadow-md">
                        {g.name}
                      </span>
                      {backgroundGradient === g.value && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Noise row */}
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Noise
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Add a subtle grain texture
                </p>
              </div>

              <Switch
                checked={wallpaperNoise}
                onCheckedChange={onWallpaperNoiseChange}
              />
            </div>
          </div>
        )}

        {/* SECTION 2-B: IMAGE BACKGROUND CONTROLS (Matching User Screenshot 2) */}
        {(backgroundType === "image" || backgroundType === "blur") && (
          <div className="mt-6 border-t border-border/70 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Background image
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Rasmni o&apos;zgartirish yoki yangi rasm yuklash uchun qalamchani bosing
                </p>
              </div>

              {/* Image thumbnail with Pencil edit button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-border/80 shadow-sm transition-all duration-200 hover:border-zinc-900 dark:hover:border-white hover:shadow-md focus:outline-none"
                  title="Rasmni o'zgartirish"
                >
                  <img
                    src={activeImage}
                    alt="Background preview"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/25" />
                </button>

                {/* Edit Pencil Pill Button */}
                <button
                  type="button"
                  onClick={() => setShowImagePicker(!showImagePicker)}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-white dark:bg-zinc-800 text-foreground shadow-md transition-transform duration-150 hover:scale-110 active:scale-95"
                  title="Tayyor rasmlar kutubxonasi"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Quick Picker / Presets Drawer */}
            {showImagePicker && (
              <div className="mt-4 rounded-2xl border border-border/70 bg-surface/50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Tayyor sara fon rasmlari
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-7 gap-1 text-[11px] font-semibold"
                  >
                    <Upload className="h-3 w-3" />
                    O&apos;zingiznikini yuklash
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {CURATED_WALLPAPERS.map((curated) => (
                    <button
                      key={curated.id}
                      type="button"
                      onClick={() => {
                        onBackgroundImageChange(curated.url);
                        toast.success(`${curated.name} fon rasmi tanlandi!`);
                      }}
                      className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-all ${backgroundImage === curated.url
                        ? "border-emerald-500 ring-2 ring-emerald-500/25"
                        : "border-border/60 hover:border-border"
                        }`}
                    >
                      <img
                        src={curated.thumb}
                        alt={curated.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 text-[9px] font-bold text-white truncate">
                        {curated.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Effect */}
            <div className="mt-6 space-y-2.5">
              <h4 className="text-sm font-bold text-foreground">
                Effect
              </h4>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {EFFECTS.map((eff) => {
                  const isSelected = wallpaperEffect === eff.id;
                  return (
                    <button
                      key={eff.id}
                      type="button"
                      onClick={() => onWallpaperEffectChange(eff.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl p-3 transition-all duration-200 active:scale-95 ${isSelected
                        ? "border-2 border-zinc-950 dark:border-white ring-1 ring-zinc-950/20 dark:ring-white/20 bg-surface/70 shadow-xs font-bold text-foreground"
                        : "border border-border/80 bg-card hover:bg-surface/40 text-text-secondary hover:text-foreground"
                        }`}
                    >
                      <div className="mb-1 text-current">{eff.icon}</div>
                      <span className="text-xs font-semibold">{eff.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tint */}
            <div className="mt-6 space-y-2 border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    Tint
                  </h4>
                  <span className="font-mono text-xs font-semibold text-text-secondary">
                    {wallpaperTint}%
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Improves text visibility and helps make your content more accessible
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Moon className="h-4 w-4 shrink-0 text-text-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wallpaperTint}
                  onChange={(e) => onWallpaperTintChange(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 accent-zinc-950 dark:accent-white"
                />
                <Sun className="h-4 w-4 shrink-0 text-text-secondary" />
              </div>
            </div>

            {/* Noise */}
            <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Noise
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Add a subtle grain texture
                </p>
              </div>

              <Switch
                checked={wallpaperNoise}
                onCheckedChange={onWallpaperNoiseChange}
              />
            </div>
          </div>
        )}

        {/* SECTION 2-C: FILL (SOLID COLOR) CONTROLS */}
        {backgroundType === "color" && (
          <div className="mt-6 border-t border-border/70 pt-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Solid Color
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Fon uchun o&apos;zingiz yoqtirgan asosiy rangni tanlang
                </p>
              </div>

              <div className="relative">
                <label
                  htmlFor="fillColorPicker"
                  className="group flex cursor-pointer items-center gap-2 rounded-2xl border border-border/80 bg-card px-3.5 py-2 shadow-xs transition-all hover:border-zinc-950 dark:hover:border-white hover:shadow-md"
                >
                  <span
                    className="h-6 w-6 rounded-lg border border-black/15 shadow-inner transition-transform group-hover:scale-105"
                    style={{ backgroundColor: backgroundColor || "#65a30d" }}
                  />
                  <span className="font-mono text-xs font-bold uppercase text-foreground">
                    {backgroundColor || "#65A30D"}
                  </span>
                </label>
                <input
                  id="fillColorPicker"
                  type="color"
                  value={backgroundColor || "#65a30d"}
                  onChange={(e) => onBackgroundColorChange(e.target.value)}
                  className="sr-only"
                />
              </div>
            </div>

            {/* Curated quick color swatches */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/70 pt-4">
              {[
                "#65a30d",
                "#000000",
                "#0f172a",
                "#18181b",
                "#15803d",
                "#0369a1",
                "#4338ca",
                "#7e22ce",
                "#be123c",
                "#b45309",
                "#ffffff",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onBackgroundColorChange(c)}
                  className={`h-7 w-7 rounded-full border border-black/10 transition-transform active:scale-95 ${backgroundColor.toLowerCase() === c.toLowerCase()
                    ? "ring-2 ring-zinc-950 dark:ring-white ring-offset-2 scale-110"
                    : "hover:scale-105"
                    }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>

            {/* Noise */}
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Noise
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Add a subtle grain texture
                </p>
              </div>

              <Switch
                checked={wallpaperNoise}
                onCheckedChange={onWallpaperNoiseChange}
              />
            </div>
          </div>
        )}

        {/* SECTION 2-D: PATTERN CONTROLS */}
        {backgroundType === "pattern" && (
          <div className="mt-6 border-t border-border/70 pt-5 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Geometric & Texture Patterns
              </h4>
              <p className="text-[11px] text-text-secondary">
                Minimalist va nozik takrorlanuvchi fon naqshlari
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { name: "Dots", bg: "#5d7c0b", style: { backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1.5px, transparent 0)", backgroundSize: "12px 12px" } },
                { name: "Grid", bg: "#1e293b", style: { backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "16px 16px" } },
                { name: "Waves", bg: "#111827", style: { backgroundImage: "radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,0.06) 21%, rgba(255,255,255,0.06) 34%, transparent 35%, transparent)", backgroundSize: "20px 20px" } },
                { name: "Diagonal", bg: "#312e81", style: { backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" } },
              ].map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    onBackgroundColorChange(p.bg);
                    toast.success(`${p.name} naqshi faollashtirildi!`);
                  }}
                  className="group relative flex h-16 items-end justify-between overflow-hidden rounded-xl border border-border/80 p-2 text-left transition-all hover:border-foreground"
                  style={{ backgroundColor: p.bg, ...p.style }}
                >
                  <span className="text-[10px] font-bold text-white drop-shadow-md">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Noise */}
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Noise
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Add a subtle grain texture
                </p>
              </div>

              <Switch
                checked={wallpaperNoise}
                onCheckedChange={onWallpaperNoiseChange}
              />
            </div>
          </div>
        )}

        {/* SECTION 2-E: VIDEO CONTROLS */}
        {backgroundType === "video" && (
          <div className="mt-6 border-t border-border/70 pt-5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Background video
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Videoni o&apos;zgartirish yoki yangi video yuklash uchun bosing
                </p>
              </div>

              {/* Video thumbnail with Pencil edit button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-border/80 bg-zinc-950 shadow-sm transition-all duration-200 hover:border-zinc-900 dark:hover:border-white hover:shadow-md focus:outline-none"
                  title="Videoni tanlash / o'zgartirish"
                >
                  {backgroundVideo ? (
                    <video
                      src={backgroundVideo}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <VideoIcon className="h-6 w-6 text-zinc-400" />
                  )}
                  <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-black/25" />
                </button>

                {/* Edit Pencil Pill Button */}
                <button
                  type="button"
                  onClick={() => setShowVideoModal(true)}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-white dark:bg-zinc-800 text-foreground shadow-md transition-transform duration-150 hover:scale-110 active:scale-95"
                  title="Select wallpaper video"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Video status bar with Change & Remove buttons */}
            <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface/40 p-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <VideoIcon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-foreground truncate max-w-[170px] sm:max-w-[280px]">
                  {backgroundVideo ? (backgroundVideo.split("/").pop() || "Video faol") : "Video tanlanmagan"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVideoModal(true)}
                  className="h-8 gap-1.5 text-xs font-bold rounded-xl"
                >
                  <Upload className="h-3.5 w-3.5" />
                  O&apos;zgartirish
                </Button>
                {backgroundVideo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onBackgroundVideoChange?.(null);
                      toast.info("Video olib tashlandi");
                    }}
                    className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-xl"
                  >
                    O&apos;chirish
                  </Button>
                )}
              </div>
            </div>

            {/* Tint Slider */}
            <div className="space-y-2 border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">
                    Tint
                  </h4>
                  <span className="font-mono text-xs font-semibold text-text-secondary">
                    {wallpaperTint}%
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary">
                  Improves text visibility and helps make your content more accessible
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Moon className="h-4 w-4 shrink-0 text-text-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wallpaperTint}
                  onChange={(e) => onWallpaperTintChange(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 accent-zinc-950 dark:accent-white"
                />
                <Sun className="h-4 w-4 shrink-0 text-text-secondary" />
              </div>
            </div>

            {/* Noise */}
            <div className="flex items-center justify-between border-t border-border/70 pt-5">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-foreground">
                  Noise
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Add a subtle grain texture
                </p>
              </div>

              <Switch
                checked={wallpaperNoise}
                onCheckedChange={onWallpaperNoiseChange}
              />
            </div>
          </div>
        )}
      </Card>

      {/* MODAL: Select wallpaper video (Exact match to User Screenshot) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl border border-border/80 bg-background shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col">
            {/* Header matching screenshot */}
            <div className="relative flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3 sm:px-6 sm:py-4">
              <div className="w-8 sm:w-9" /> {/* Spacer for optical center */}
              <h3 className="text-sm sm:text-base font-bold text-foreground text-center">
                Select wallpaper video
              </h3>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Yopish"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[80vh] overflow-y-auto p-5 space-y-4">
              {/* Row 1: Upload your own - Identical to user reference */}
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={isUploadingVideo}
                className="group flex w-full items-center justify-between rounded-2xl border border-border/80 bg-card p-4 text-left shadow-xs transition-all hover:border-zinc-900 dark:hover:border-white hover:bg-surface/60 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-foreground transition-transform group-hover:scale-105">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-foreground">
                      Upload your own
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      {isUploadingVideo ? "Yuklanmoqda... 📹" : "MP4, WebM yoki MOV (25MB gacha)"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-text-secondary transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Direct Video URL Input */}
              <div className="rounded-2xl border border-border/80 bg-surface/30 p-4 space-y-2.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <VideoIcon className="h-3.5 w-3.5 text-text-secondary" />
                  Yoki video havolasini (URL) kiriting
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={customVideoUrl}
                    onChange={(e) => setCustomVideoUrl(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-border/80 bg-card px-3.5 text-xs text-foreground placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!customVideoUrl || !customVideoUrl.startsWith("http")) {
                        toast.error("Iltimos, to'g'ri video URL kiriting (https://...)");
                        return;
                      }
                      onBackgroundVideoChange?.(customVideoUrl);
                      onBackgroundTypeChange("video");
                      setShowVideoModal(false);
                      setCustomVideoUrl("");
                      toast.success("Video muvaffaqiyatli o'rnatildi! 🎬");
                    }}
                    className="h-10 rounded-xl px-4 text-xs font-bold"
                  >
                    Qo&apos;llash
                  </Button>
                </div>
              </div>

              {/* Curated Pre-made video wallpapers */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Tayyor sara videolar
                </h4>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {CURATED_VIDEOS.map((curated) => {
                    const isSelected = backgroundVideo === curated.url;
                    return (
                      <button
                        key={curated.id}
                        type="button"
                        onClick={() => {
                          onBackgroundVideoChange?.(curated.url);
                          onBackgroundTypeChange("video");
                          setShowVideoModal(false);
                          toast.success(`"${curated.name}" videofoni tanlandi! 🎬`);
                        }}
                        className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-all ${isSelected
                          ? "border-emerald-500 ring-2 ring-emerald-500/25"
                          : "border-border/60 hover:border-border"
                          }`}
                      >
                        <img
                          src={curated.poster}
                          alt={curated.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-between p-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs">
                            <div className="h-0 w-0 border-y-[3px] border-y-transparent border-l-[5px] border-l-white ml-0.5" />
                          </span>
                          <span className="text-[10px] font-bold text-white truncate text-left">
                            {curated.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  Check,
  X,
  Sparkles,
  Palette,
  Layout,
  Sliders,
  SlidersHorizontal,
  Loader2,
  Zap,
  Upload,
  Video,
  Play,
  Trash2,
  Image as ImageIcon,
  SunMedium,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DynamicFontLoader } from "@/components/shared/dynamic-font-loader";

// 1. Curated 1-Click Themes
const MOBILE_THEMES = [
  {
    id: "acid-lime",
    name: "Acid Lime & Onyx",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #142900 0%, #050800 70%)",
    bgColor: "#050800",
    buttonColor: "#a3e635",
    buttonTextColor: "#050800",
    buttonBorderColor: "#bef264",
    buttonStyle: "pill",
    textColor: "#f7fee7",
    accentColor: "#a3e635",
    fontHeading: "Outfit",
  },
  {
    id: "cyber-violet",
    name: "Cyber Violet",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)",
    bgColor: "#0b0b14",
    buttonColor: "rgba(255, 255, 255, 0.08)",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "rgba(168, 85, 247, 0.4)",
    buttonStyle: "glass",
    textColor: "#f3e8ff",
    accentColor: "#a855f7",
    fontHeading: "Syne",
  },
  {
    id: "emerald-horizon",
    name: "Emerald Horizon",
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
    bgColor: "#0d1117",
    buttonColor: "#10b981",
    buttonTextColor: "#042f2e",
    buttonBorderColor: "#34d399",
    buttonStyle: "rounded",
    textColor: "#ffffff",
    accentColor: "#10b981",
    fontHeading: "Plus Jakarta Sans",
  },
  {
    id: "obsidian",
    name: "Obsidian Stealth",
    bgType: "color",
    bgGradient: "",
    bgColor: "#000000",
    buttonColor: "#18181b",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "rgba(255,255,255,0.18)",
    buttonStyle: "rounded",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    fontHeading: "Inter",
  },
  {
    id: "electric-azure",
    name: "Electric Azure",
    bgType: "gradient",
    bgGradient: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
    bgColor: "#020617",
    buttonColor: "#0284c7",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#38bdf8",
    buttonStyle: "rounded",
    textColor: "#f0f9ff",
    accentColor: "#38bdf8",
    fontHeading: "Audiowide",
  },
  {
    id: "sunset-ember",
    name: "Sunset Ember",
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #2e1065 0%, #7c2d12 60%, #c2410c 100%)",
    bgColor: "#2e1065",
    buttonColor: "#ea580c",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#fb923c",
    buttonStyle: "rounded",
    textColor: "#ffedd5",
    accentColor: "#f97316",
    fontHeading: "Bebas Neue",
  },
  {
    id: "rose-velvet",
    name: "Rose Velvet",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #4c0519 0%, #0f0206 70%)",
    bgColor: "#0f0206",
    buttonColor: "#e11d48",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#fb7185",
    buttonStyle: "rounded",
    textColor: "#ffe4e6",
    accentColor: "#f43f5e",
    fontHeading: "Playfair Display",
  },
  {
    id: "minimal-light",
    name: "Minimalist Light",
    bgType: "color",
    bgGradient: "",
    bgColor: "#f8fafc",
    buttonColor: "#0f172a",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#334155",
    buttonStyle: "pill",
    textColor: "#0f172a",
    accentColor: "#0284c7",
    fontHeading: "Outfit",
  },
  {
    id: "neo-olive",
    name: "Neo Olive / Forest",
    bgType: "color",
    bgGradient: "",
    bgColor: "#6b720e",
    buttonColor: "#ffffff",
    buttonTextColor: "#1a2e05",
    buttonBorderColor: "#ffffff",
    buttonStyle: "pill",
    textColor: "#ffffff",
    accentColor: "#bef264",
    fontHeading: "Inter",
  },
  {
    id: "cyberpunk-neon",
    name: "Cyberpunk 2077",
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #fcee0a 0%, #000000 70%)",
    bgColor: "#050505",
    buttonColor: "#fcee0a",
    buttonTextColor: "#000000",
    buttonBorderColor: "#00f0ff",
    buttonStyle: "square",
    textColor: "#ffffff",
    accentColor: "#00f0ff",
    fontHeading: "Orbitron",
  },
];

// 2. Layouts matching user screenshot (Classic, Hero, Banner, Cutout, Shape)
const LAYOUT_OPTIONS = [
  {
    id: "classic",
    label: "Classic",
    desc: "Dumaloq avatar markazda",
    isPro: false,
  },
  {
    id: "hero",
    label: "Hero",
    desc: "Katta qoplovchi foto & fade",
    isPro: true,
  },
  {
    id: "banner",
    label: "Banner",
    desc: "Keng cover banner & avatar",
    isPro: true,
  },
  {
    id: "cutout",
    label: "Cutout",
    desc: "3D frameless portret siluet",
    isPro: true,
  },
  {
    id: "shape",
    label: "Shape",
    desc: "Organik petala shakl",
    isPro: true,
  },
];

// 3. Ambient Video Loop Presets matching user screenshot
const VIDEO_PRESETS = [
  {
    id: "cosmic",
    name: "Cosmic Stars",
    desc: "Tungi koinot va yulduzlar harakati",
    url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  },
  {
    id: "sunset",
    name: "Sunset Horizon",
    desc: "Quyosh botishi va sokin ufq",
    url: "https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-sky-in-a-sunset-26070-large.mp4",
  },
  {
    id: "neon",
    name: "Neon Ambient",
    desc: "Dinamik zamonaviy neon nurlari",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  },
];

// 4. Curated HD Wallpapers
const CURATED_WALLPAPERS = [
  {
    id: "melody_world",
    name: "Melody World",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "neon_cyber",
    name: "Neon Horizon",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "forest_mist",
    name: "Forest Mist",
    url: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "desert_dusk",
    name: "Desert Dusk",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "cosmic_nebula",
    name: "Cosmic Nebula",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80",
  },
];

// 5. Button Geometries
const BUTTON_STYLES = [
  { id: "rounded", label: "Rounded", radius: "16px" },
  { id: "pill", label: "Pill Full", radius: "9999px" },
  { id: "square", label: "Square Edge", radius: "4px" },
  { id: "shadow", label: "Hard Shadow", radius: "14px" },
  { id: "outlined", label: "Outlined Minimal", radius: "14px" },
  { id: "glass", label: "Frosted Glass", radius: "16px" },
  { id: "neon", label: "Neon Glow", radius: "9999px" },
];

// 6. Google Fonts
const GOOGLE_FONTS = [
  { name: "Inter", category: "Modern Sans" },
  { name: "Plus Jakarta Sans", category: "Clean Sans" },
  { name: "Outfit", category: "Geometric" },
  { name: "Poppins", category: "Friendly" },
  { name: "Bebas Neue", category: "Display Bold" },
  { name: "Syne", category: "Futuristic" },
  { name: "Audiowide", category: "Cyber Tech" },
  { name: "Orbitron", category: "Sci-Fi" },
  { name: "Playfair Display", category: "Editorial Serif" },
  { name: "Caveat", category: "Handwritten" },
  { name: "Space Grotesk", category: "Tech Monospace" },
];

// 7. Swatches
const COLOR_SWATCHES = [
  "#000000",
  "#ffffff",
  "#a3e635",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#6b720e",
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
  "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)",
  "radial-gradient(ellipse at top, #142900 0%, #050800 70%)",
  "linear-gradient(135deg, #2e1065 0%, #7c2d12 60%, #c2410c 100%)",
  "linear-gradient(180deg, #0a192f 0%, #020c1b 100%)",
  "linear-gradient(135deg, #4c0519 0%, #0f0206 100%)",
  "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)",
  "linear-gradient(180deg, #18181b 0%, #09090b 100%)",
];

type ToolTab = "theme" | "header" | "wallpaper" | "text" | "buttons" | "colors" | null;

interface MobileLiveDesignStudioProps {
  onBackToEditor?: () => void;
  onOpenSection?: (section: string) => void;
}

export function MobileLiveDesignStudio({ onBackToEditor }: MobileLiveDesignStudioProps = {}) {
  const { profile, updateProfile, theme, updateTheme, links } = useDashboard();
  const { t } = useI18n();

  // Active bottom sheet tool
  const [activeTool, setActiveTool] = useState<ToolTab>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Hidden file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Live editable theme state
  const [backgroundColor, setBackgroundColor] = useState(theme?.backgroundColor || "#0d1117");
  const [backgroundType, setBackgroundType] = useState<string>(theme?.backgroundType || "color");
  const [backgroundGradient, setBackgroundGradient] = useState<string>(theme?.backgroundGradient || "");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(theme?.backgroundImage || null);
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(theme?.backgroundVideo || null);
  const [buttonStyle, setButtonStyle] = useState<string>(theme?.buttonStyle || "rounded");
  const [buttonColor, setButtonColor] = useState<string>(theme?.buttonColor || "#10b981");
  const [buttonTextColor, setButtonTextColor] = useState<string>(theme?.buttonTextColor || "#ffffff");
  const [buttonBorderColor, setButtonBorderColor] = useState<string>(theme?.buttonBorderColor || "");
  const [buttonRadius, setButtonRadius] = useState<string>(theme?.buttonRadius || "16px");
  const [fontHeading, setFontHeading] = useState<string>(theme?.fontHeading || "Inter");
  const [textColor, setTextColor] = useState<string>(theme?.textColor || "#ffffff");
  const [accentColor, setAccentColor] = useState<string>(theme?.accentColor || "#10b981");

  // Profile fields
  const [layout, setLayout] = useState<string>(profile?.layout || "classic");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatarUrl || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(profile?.bannerUrl || null);

  // Keep state synced when theme or profile context updates
  useEffect(() => {
    if (theme) {
      if (theme.backgroundColor) setBackgroundColor(theme.backgroundColor);
      if (theme.backgroundType) setBackgroundType(theme.backgroundType);
      if (theme.backgroundGradient) setBackgroundGradient(theme.backgroundGradient);
      if (theme.backgroundImage !== undefined) setBackgroundImage(theme.backgroundImage);
      if (theme.backgroundVideo !== undefined) setBackgroundVideo(theme.backgroundVideo);
      if (theme.buttonStyle) setButtonStyle(theme.buttonStyle);
      if (theme.buttonColor) setButtonColor(theme.buttonColor);
      if (theme.buttonTextColor) setButtonTextColor(theme.buttonTextColor);
      if (theme.buttonBorderColor !== undefined) setButtonBorderColor(theme.buttonBorderColor || "");
      if (theme.buttonRadius) setButtonRadius(theme.buttonRadius);
      if (theme.fontHeading) setFontHeading(theme.fontHeading);
      if (theme.textColor) setTextColor(theme.textColor);
      if (theme.accentColor) setAccentColor(theme.accentColor);
    }
    if (profile?.layout) setLayout(profile.layout);
    if (profile?.avatarUrl !== undefined) setAvatarUrl(profile.avatarUrl);
    if (profile?.bannerUrl !== undefined) setBannerUrl(profile.bannerUrl);
  }, [theme, profile]);

  // Apply a preset theme
  const applyPreset = (preset: typeof MOBILE_THEMES[0]) => {
    setBackgroundType(preset.bgType);
    setBackgroundGradient(preset.bgGradient);
    setBackgroundColor(preset.bgColor);
    setButtonColor(preset.buttonColor);
    setButtonTextColor(preset.buttonTextColor);
    setButtonBorderColor(preset.buttonBorderColor);
    setButtonStyle(preset.buttonStyle);
    setTextColor(preset.textColor);
    setAccentColor(preset.accentColor);
    if (preset.fontHeading) setFontHeading(preset.fontHeading);

    updateTheme({
      backgroundColor: preset.bgColor,
      backgroundType: preset.bgType,
      backgroundGradient: preset.bgGradient,
      buttonColor: preset.buttonColor,
      buttonTextColor: preset.buttonTextColor,
      buttonBorderColor: preset.buttonBorderColor,
      buttonStyle: preset.buttonStyle,
      textColor: preset.textColor,
      accentColor: preset.accentColor,
      fontHeading: preset.fontHeading,
    });
  };

  // Upload handler for avatar, banner, or video
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "banner" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading("Fayl yuklanmoqda...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Faylni yuklashda xatolik yuz berdi");

      const data = await res.json();
      const uploadedUrl = data.url;

      if (type === "avatar") {
        setAvatarUrl(uploadedUrl);
        updateProfile({ avatarUrl: uploadedUrl });
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarUrl: uploadedUrl }),
        });
        toast.success("Avatar yangilandi! 📸", { id: toastId });
      } else if (type === "banner") {
        setBannerUrl(uploadedUrl);
        updateProfile({ bannerUrl: uploadedUrl });
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bannerUrl: uploadedUrl }),
        });
        toast.success("Banner yangilandi! 🎨", { id: toastId });
      } else if (type === "video") {
        setBackgroundVideo(uploadedUrl);
        setBackgroundType("video");
        updateTheme({ backgroundVideo: uploadedUrl, backgroundType: "video" });
        await fetch("/api/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backgroundVideo: uploadedUrl, backgroundType: "video" }),
        });
        toast.success("Orqa fon videosi o'rnatildi! 🎬", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "Yuklashda xatolik yuz berdi", { id: toastId });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  // Save changes to database
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const [resTheme, resProfile] = await Promise.all([
        fetch("/api/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backgroundColor,
            backgroundType,
            backgroundGradient,
            backgroundImage,
            backgroundVideo,
            buttonStyle,
            buttonColor,
            buttonTextColor,
            buttonBorderColor,
            buttonRadius,
            fontHeading,
            textColor,
            accentColor,
          }),
        }),
        fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ layout }),
        }),
      ]);

      if (!resTheme.ok) throw new Error("Dizaynni saqlashda xatolik");

      updateTheme({
        backgroundColor,
        backgroundType,
        backgroundGradient,
        backgroundImage,
        backgroundVideo,
        buttonStyle,
        buttonColor,
        buttonTextColor,
        buttonBorderColor,
        buttonRadius,
        fontHeading,
        textColor,
        accentColor,
      });
      updateProfile({ layout });

      toast.success("Barcha o'zgarishlar muvaffaqiyatli saqlandi! ✨");
      setActiveTool(null);
    } catch (err: any) {
      toast.error(err.message || "Saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const username = profile?.username || "creator";
  const displayName = profile?.displayName || `@${username}`;
  const enabledLinks = links.filter((l) => l.isEnabled);

  // Background style computation
  const backgroundStyle: React.CSSProperties = {
    background:
      backgroundType === "gradient" && backgroundGradient
        ? backgroundGradient
        : backgroundColor || "#0d1117",
    color: textColor,
  };

  // Button style class computation
  const getButtonClass = () => {
    switch (buttonStyle) {
      case "pill":
        return "rounded-full";
      case "square":
        return "rounded-none";
      case "shadow":
        return "rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,0.85)] border-2 border-black";
      case "outlined":
        return "rounded-2xl border-2 bg-transparent";
      case "glass":
        return "rounded-2xl backdrop-blur-md shadow-lg";
      case "neon":
        return "rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]";
      default:
        return "rounded-2xl";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden bg-zinc-950 font-sans">
      <DynamicFontLoader font={fontHeading} />

      {/* Hidden Upload Inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "avatar")}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "banner")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "video")}
      />

      {/* TOP HEADER: Back arrow, Username, Action buttons */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {onBackToEditor ? (
            <button
              type="button"
              onClick={onBackToEditor}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
              title="Orqaga"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/dashboard/links"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
              title="Dashboardga qaytish"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <span className="font-heading text-sm font-extrabold tracking-tight text-white">
            @{username}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/${username}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20"
            title="Jonli profilni ochish"
          >
            <ExternalLink className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 text-xs font-bold text-zinc-950 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span>Saqlash</span>
          </button>
        </div>
      </header>

      {/* CENTER: LIVE PHONE SCREEN PREVIEW (Updates in Real-Time!) */}
      <main
        style={
          backgroundType !== "video" && backgroundType !== "image"
            ? backgroundStyle
            : undefined
        }
        className="relative flex-1 overflow-y-auto px-4 pb-24 pt-6 scrollbar-none transition-all duration-300"
      >
        {/* Background Video if active */}
        {backgroundType === "video" && backgroundVideo && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              key={backgroundVideo}
              className="h-full w-full object-cover"
            >
              <source src={backgroundVideo} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          </div>
        )}

        {/* Background Image if active */}
        {backgroundType === "image" && backgroundImage && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <img
              src={backgroundImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        )}

        {/* HERO LAYOUT: Edge-to-edge header photo with smooth gradient fade */}
        {layout === "hero" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 w-full overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)]">
            <img
              src={
                avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=85"
              }
              alt=""
              className="h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </div>
        )}

        <div
          className={cn(
            "relative z-10 mx-auto flex max-w-sm flex-col items-center text-center",
            layout === "hero" ? "pt-36" : "pt-2"
          )}
        >
          {/* BANNER LAYOUT */}
          {layout === "banner" && (
            <div className="relative mb-4 w-full">
              <div className="h-28 w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-emerald-600/30 to-violet-600/30 shadow-md">
                <img
                  src={
                    bannerUrl ||
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="relative z-10 -mt-12 flex justify-center">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-zinc-950 bg-zinc-900 shadow-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                      {username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CUTOUT LAYOUT */}
          {layout === "cutout" && (
            <div className="relative mb-3 flex h-28 w-28 items-end justify-center overflow-hidden">
              <div
                className="absolute inset-0 rounded-full opacity-60 blur-xl"
                style={{ backgroundColor: accentColor }}
              />
              <img
                src={
                  avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                }
                alt=""
                className="relative z-10 h-full w-auto object-contain [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]"
              />
            </div>
          )}

          {/* SHAPE LAYOUT */}
          {layout === "shape" && (
            <div
              className="relative mb-3 flex h-24 w-24 items-center justify-center p-1 shadow-2xl transition-all duration-300"
              style={{
                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                backgroundColor: accentColor,
              }}
            >
              <div
                className="h-full w-full overflow-hidden"
                style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
              >
                <img
                  src={
                    avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80"
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* CLASSIC LAYOUT */}
          {layout === "classic" && (
            <div className="relative mb-3 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-black/30 shadow-2xl">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black/50 text-2xl font-black text-white">
                  {username.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Display Name with live font */}
          <h2
            style={{ fontFamily: fontHeading, color: textColor }}
            className="text-xl font-extrabold tracking-tight drop-shadow-md"
          >
            {displayName}
          </h2>

          {/* Social Icons Placeholder */}
          <div className="mt-2.5 flex items-center justify-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white/90 backdrop-blur-xs shadow-xs">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </span>
          </div>

          {/* Links stack with real-time button styles */}
          <div className="mt-5 w-full space-y-3">
            {enabledLinks.length > 0 ? (
              enabledLinks.map((link) => (
                <div
                  key={link.id}
                  style={{
                    backgroundColor:
                      buttonStyle === "outlined" ? "transparent" : buttonColor,
                    color: buttonTextColor,
                    borderColor: buttonBorderColor || buttonColor,
                  }}
                  className={cn(
                    "relative flex w-full items-center justify-center p-3.5 text-center text-sm font-bold transition-all shadow-sm",
                    getButtonClass()
                  )}
                >
                  <span className="truncate">{link.title}</span>
                </div>
              ))
            ) : (
              <>
                <div
                  style={{
                    backgroundColor:
                      buttonStyle === "outlined" ? "transparent" : buttonColor,
                    color: buttonTextColor,
                    borderColor: buttonBorderColor || buttonColor,
                  }}
                  className={cn(
                    "flex w-full items-center justify-center p-3.5 text-center text-sm font-bold shadow-sm",
                    getButtonClass()
                  )}
                >
                  <span>Mening Telegram kanalim</span>
                </div>
                <div
                  style={{
                    backgroundColor:
                      buttonStyle === "outlined" ? "transparent" : buttonColor,
                    color: buttonTextColor,
                    borderColor: buttonBorderColor || buttonColor,
                  }}
                  className={cn(
                    "flex w-full items-center justify-center p-3.5 text-center text-sm font-bold shadow-sm",
                    getButtonClass()
                  )}
                >
                  <span>YouTube / Portfolio</span>
                </div>
              </>
            )}
          </div>

          {/* Linktree / BioSpace Branding Pill */}
          <div className="mt-6 flex flex-col items-center">
            <span className="rounded-full bg-white px-5 py-2 text-xs font-bold text-zinc-950 shadow-xl">
              Get your own BioSpace
            </span>
            <p className="mt-2 text-[10px] opacity-60">
              Cookie Preferences • Report • Privacy
            </p>
          </div>
        </div>
      </main>

      {/* BOTTOM SLIDING DRAWER SHEET (When a tool is active) */}
      {activeTool !== null && (
        <div className="fixed inset-x-0 bottom-16 z-40 max-h-[58vh] overflow-hidden rounded-t-[28px] border-t border-white/15 bg-zinc-900/98 text-white shadow-[0_-15px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl animate-in slide-in-from-bottom duration-200">
          {/* Drawer Drag Bar & Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <h3 className="font-heading text-sm font-bold">
                {activeTool === "theme"
                  ? "Tayyor Temalar"
                  : activeTool === "header"
                  ? "Header, Layout & Video"
                  : activeTool === "wallpaper"
                  ? "Fon (Wallpaper & Rasmlar)"
                  : activeTool === "text"
                  ? "Tipografika & Shriftlar"
                  : activeTool === "buttons"
                  ? "Tugma Shakllari & Ranglari"
                  : "Aktsent & Ranglar"}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTool(null)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="max-h-[50vh] overflow-y-auto p-4 scrollbar-thin space-y-5">
            {/* 1. THEMES PICKER */}
            {activeTool === "theme" && (
              <div>
                <span className="mb-2.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  1-Click Dizayner Temalari
                </span>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {MOBILE_THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => applyPreset(th)}
                      className={cn(
                        "group relative flex flex-col items-center rounded-2xl border p-2.5 text-center transition-all active:scale-95",
                        backgroundColor === th.bgColor && buttonColor === th.buttonColor
                          ? "border-emerald-400 bg-white/10 shadow-lg ring-2 ring-emerald-400/50"
                          : "border-white/10 bg-black/40 hover:border-white/20"
                      )}
                    >
                      <div
                        style={{
                          background:
                            th.bgType === "gradient" ? th.bgGradient : th.bgColor,
                        }}
                        className="relative flex h-14 w-full items-center justify-center rounded-xl border border-white/10 shadow-inner"
                      >
                        <span
                          style={{
                            backgroundColor: th.buttonColor,
                            color: th.buttonTextColor,
                          }}
                          className="rounded px-2 py-0.5 text-[9px] font-bold shadow-xs"
                        >
                          Aa
                        </span>
                      </div>
                      <span className="mt-2 truncate text-xs font-bold text-white">
                        {th.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. HEADER & LAYOUT & VIDEO (Matches user screenshot exactly!) */}
            {activeTool === "header" && (
              <div className="space-y-4">
                {/* A. LAYOUT OPTIONS */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      LAYOUT
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Jonli yangilanadi ✨
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {LAYOUT_OPTIONS.map((opt) => {
                      const isSelected = layout === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setLayout(opt.id);
                            updateProfile({ layout: opt.id });
                          }}
                          className={cn(
                            "relative flex flex-col items-center rounded-2xl border p-2.5 text-center transition-all active:scale-95",
                            isSelected
                              ? "border-2 border-emerald-400 bg-emerald-500/15 shadow-md ring-1 ring-emerald-400/40"
                              : "border-white/10 bg-black/40 hover:border-white/20"
                          )}
                        >
                          {opt.isPro && (
                            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950">
                              <Zap className="h-2.5 w-2.5 fill-current" />
                            </span>
                          )}
                          <div className="my-1 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-white/10">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt=""
                                className={cn(
                                  "h-full w-full object-cover",
                                  opt.id === "shape" ? "rounded-[30%]" : "rounded-full"
                                )}
                              />
                            ) : (
                              <Layout className="h-5 w-5 text-white/70" />
                            )}
                          </div>
                          <span className="text-xs font-bold text-white">{opt.label}</span>
                          <span className="line-clamp-1 text-[9px] text-zinc-400">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* B. PROFILE IMAGE UPLOAD */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Profile image</h4>
                      <p className="text-[10px] text-zinc-400">Square images look best — 512×512 or larger</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 active:scale-95 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Rasm yuklash</span>
                    </button>
                  </div>
                </div>

                {/* C. BANNER UPLOAD (If Banner layout selected) */}
                {layout === "banner" && (
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Header Banner</h4>
                        <p className="text-[10px] text-zinc-400">Profil ustidagi keng rasm</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/25 active:scale-95 transition-all"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Banner yuklash</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* D. BACKGROUND VIDEO LOOP (Matches user screenshot) */}
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-emerald-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">Orqa fon videosi (Loop)</h4>
                        <p className="text-[10px] text-zinc-400">Profil foniga dinamik video o&apos;rnatish</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-bold hover:bg-emerald-500/30 active:scale-95 transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Video yuklash</span>
                    </button>
                  </div>

                  {/* Ambient Loop Presets */}
                  <div>
                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      TAYYOR AMBIENT VIDEO LOOPLAR:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {VIDEO_PRESETS.map((vp) => {
                        const isCurrent =
                          backgroundType === "video" && backgroundVideo === vp.url;
                        return (
                          <button
                            key={vp.id}
                            type="button"
                            onClick={() => {
                              setBackgroundVideo(vp.url);
                              setBackgroundType("video");
                              updateTheme({
                                backgroundVideo: vp.url,
                                backgroundType: "video",
                              });
                            }}
                            className={cn(
                              "flex flex-col items-center rounded-xl border p-2 text-center transition-all active:scale-95",
                              isCurrent
                                ? "border-emerald-400 bg-emerald-500/20 ring-1 ring-emerald-400"
                                : "border-white/10 bg-zinc-800/80 hover:border-white/20"
                            )}
                          >
                            <Play className="h-4 w-4 text-emerald-400 mb-1" />
                            <span className="text-[10px] font-bold text-white truncate w-full">
                              {vp.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remove Video option */}
                  {backgroundType === "video" && backgroundVideo && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundVideo(null);
                        setBackgroundType("color");
                        updateTheme({
                          backgroundVideo: null,
                          backgroundType: "color",
                        });
                      }}
                      className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-semibold"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Orqa fon videosini olib tashlash</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. WALLPAPER / BACKGROUND */}
            {activeTool === "wallpaper" && (
              <div className="space-y-4">
                {/* Background Type */}
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Fon Turi
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "color", label: "Rang" },
                      { id: "gradient", label: "Gradient" },
                      { id: "image", label: "Rasm" },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setBackgroundType(type.id);
                          updateTheme({ backgroundType: type.id });
                        }}
                        className={cn(
                          "rounded-xl border py-2 text-xs font-bold transition-all",
                          backgroundType === type.id
                            ? "border-emerald-400 bg-emerald-500/20 text-white"
                            : "border-white/10 bg-black/40 text-zinc-400 hover:text-white"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curated Wallpapers */}
                {backgroundType === "image" && (
                  <div>
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Tayyor HD Fon Rasmlari
                    </span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CURATED_WALLPAPERS.map((wp) => (
                        <button
                          key={wp.id}
                          type="button"
                          onClick={() => {
                            setBackgroundImage(wp.url);
                            updateTheme({
                              backgroundImage: wp.url,
                              backgroundType: "image",
                            });
                          }}
                          className={cn(
                            "group relative h-20 overflow-hidden rounded-xl border transition-all active:scale-95",
                            backgroundImage === wp.url
                              ? "border-2 border-emerald-400 ring-2 ring-emerald-400/50"
                              : "border-white/10"
                          )}
                        >
                          <img src={wp.url} alt="" className="h-full w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] font-bold text-white truncate">
                            {wp.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gradient Presets */}
                {backgroundType === "gradient" && (
                  <div>
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Gradient Shablonlari
                    </span>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {GRADIENT_PRESETS.map((grad, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setBackgroundGradient(grad);
                            updateTheme({
                              backgroundGradient: grad,
                              backgroundType: "gradient",
                            });
                          }}
                          style={{ background: grad }}
                          className={cn(
                            "h-14 rounded-xl border transition-all active:scale-95 shadow-sm",
                            backgroundGradient === grad
                              ? "border-white ring-2 ring-emerald-400 scale-105"
                              : "border-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Swatches */}
                {backgroundType === "color" && (
                  <div>
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Rang Tanlash
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      {COLOR_SWATCHES.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setBackgroundColor(color);
                            updateTheme({
                              backgroundColor: color,
                              backgroundType: "color",
                            });
                          }}
                          style={{ backgroundColor: color }}
                          className={cn(
                            "h-9 w-9 rounded-full border-2 transition-transform active:scale-95",
                            backgroundColor === color
                              ? "border-white ring-2 ring-emerald-400 scale-110"
                              : "border-white/20"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. TEXT & FONTS */}
            {activeTool === "text" && (
              <div className="space-y-4">
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Google Fonts (Matn Shrifti)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {GOOGLE_FONTS.map((f) => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => {
                          setFontHeading(f.name);
                          updateTheme({ fontHeading: f.name });
                        }}
                        className={cn(
                          "rounded-xl border p-2.5 text-left transition-all active:scale-95",
                          fontHeading === f.name
                            ? "border-emerald-400 bg-emerald-500/20 text-white"
                            : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/20"
                        )}
                      >
                        <span
                          style={{ fontFamily: f.name }}
                          className="block text-sm font-bold"
                        >
                          {f.name}
                        </span>
                        <span className="text-[10px] text-zinc-400">{f.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Color */}
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Matn Rangi
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["#ffffff", "#000000", "#f7fee7", "#f3e8ff", "#ffedd5", "#f0f9ff"].map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            setTextColor(c);
                            updateTheme({ textColor: c });
                          }}
                          style={{ backgroundColor: c }}
                          className={cn(
                            "h-8 w-8 rounded-full border-2",
                            textColor === c ? "border-emerald-400 scale-110" : "border-white/20"
                          )}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. BUTTONS STYLES & COLORS */}
            {activeTool === "buttons" && (
              <div className="space-y-4">
                {/* Button Geometry */}
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Tugma Shakli & Geometriyasi
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {BUTTON_STYLES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setButtonStyle(b.id);
                          setButtonRadius(b.radius);
                          updateTheme({
                            buttonStyle: b.id,
                            buttonRadius: b.radius,
                          });
                        }}
                        className={cn(
                          "rounded-xl border p-2.5 text-left transition-all active:scale-95",
                          buttonStyle === b.id
                            ? "border-emerald-400 bg-emerald-500/20 text-white"
                            : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/20"
                        )}
                      >
                        <span className="block text-xs font-bold">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Button Color Swatches */}
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Tugma Foni Rangi
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_SWATCHES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setButtonColor(c);
                          const isLight = [
                            "#ffffff",
                            "#a3e635",
                            "#bef264",
                            "#fef08a",
                          ].includes(c);
                          setButtonTextColor(isLight ? "#000000" : "#ffffff");
                          updateTheme({
                            buttonColor: c,
                            buttonTextColor: isLight ? "#000000" : "#ffffff",
                          });
                        }}
                        style={{ backgroundColor: c }}
                        className={cn(
                          "h-8 w-8 rounded-full border-2",
                          buttonColor === c
                            ? "border-emerald-400 scale-110"
                            : "border-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 6. COLORS PALETTE */}
            {activeTool === "colors" && (
              <div className="space-y-4">
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Aktsent va Belgilash Rangi
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_SWATCHES.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setAccentColor(color);
                        updateTheme({ accentColor: color });
                      }}
                      style={{ backgroundColor: color }}
                      className={cn(
                        "h-10 w-10 rounded-full border-2 transition-transform active:scale-95",
                        accentColor === color
                          ? "border-white scale-110 ring-2 ring-emerald-400"
                          : "border-white/20"
                      )}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCKED BOTTOM TOOLBAR (Matches Screenshot 2 Exactly!) */}
      <nav
        aria-label="Mobile Design Toolbar"
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-white/10 bg-zinc-950/95 px-2 py-1 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
      >
        {/* 1. Theme */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "theme" ? null : "theme")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "theme" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div
            style={{
              background:
                backgroundType === "gradient" ? backgroundGradient : backgroundColor,
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 shadow-xs"
          >
            <span className="text-[9px] font-black text-white">Aa</span>
          </div>
          <span className="text-[10px] font-bold">Theme</span>
        </button>

        {/* 2. Header */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "header" ? null : "header")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "header" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-zinc-800 overflow-hidden shadow-xs">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Layout className="h-3.5 w-3.5 text-white" />
            )}
          </div>
          <span className="text-[10px] font-bold">Header</span>
        </button>

        {/* 3. Wallpaper */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "wallpaper" ? null : "wallpaper")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "wallpaper" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div
            style={{
              background:
                backgroundType === "gradient" ? backgroundGradient : backgroundColor,
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 shadow-xs"
          />
          <span className="text-[10px] font-bold">Wallpaper</span>
        </button>

        {/* 4. Text */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "text" ? null : "text")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "text" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-zinc-900 shadow-xs">
            <span className="font-heading text-xs font-bold text-white">Aa</span>
          </div>
          <span className="text-[10px] font-bold">Text</span>
        </button>

        {/* 5. Buttons */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "buttons" ? null : "buttons")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "buttons" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div
            style={{ backgroundColor: buttonColor }}
            className={cn(
              "flex h-4 w-7 items-center justify-center border border-white/20 shadow-xs",
              buttonStyle === "pill" ? "rounded-full" : "rounded"
            )}
          />
          <span className="text-[10px] font-bold">Buttons</span>
        </button>

        {/* 6. Colors */}
        <button
          type="button"
          onClick={() => setActiveTool(activeTool === "colors" ? null : "colors")}
          className={cn(
            "flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
            activeTool === "colors" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
          )}
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/20 overflow-hidden shadow-xs">
            <div style={{ backgroundColor: accentColor }} className="h-full w-1/2" />
            <div style={{ backgroundColor }} className="h-full w-1/2" />
          </div>
          <span className="text-[10px] font-bold">Colors</span>
        </button>
      </nav>
    </div>
  );
}

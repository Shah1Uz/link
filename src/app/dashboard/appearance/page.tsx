"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useDashboard } from "@/context/dashboard-context";
import { useI18n } from "@/components/i18n-provider";
import {
  Save,
  Check,
  Type,
  Sliders,
  Layers,
  Palette,
  Sparkles,
  ArrowLeft,
  Undo2,
  Redo2,
  ChevronRight,
  Zap,
  Asterisk,
  Smile,
  Music,
  User,
  Layout,
  SlidersHorizontal,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { HeaderLayoutCard } from "@/components/dashboard/header-layout-card";
import { SpotifyMusicCard } from "@/components/dashboard/spotify-music-card";
import { StickersStudio } from "@/components/dashboard/stickers-studio";
import { WallpaperStudio, CURATED_WALLPAPERS } from "@/components/dashboard/wallpaper-studio";
import { TypographyStudio } from "@/components/dashboard/typography-studio";
import { renderStickerById } from "@/components/shared/sticker-art";
import { MobileLiveDesignStudio } from "@/components/dashboard/mobile-live-design-studio";

const quickSwatches = [
  "#000000",
  "#ffffff",
  "#a3e635", // acid lime
  "#10b981", // emerald
  "#38bdf8", // sky blue
  "#8b5cf6", // violet
  "#f43f5e", // rose
  "#f59e0b", // amber
];

const presetGradients = [
  { name: "Creator Horizon", value: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)" },
  { name: "Cyber Violet", value: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)" },
  { name: "Acid Lime & Onyx", value: "radial-gradient(ellipse at top, #142900 0%, #050800 70%)" },
  { name: "Executive Navy", value: "linear-gradient(180deg, #0a192f 0%, #020c1b 100%)" },
  { name: "Sunset Amber", value: "linear-gradient(180deg, #ffedd5 0%, #fff7ed 60%, #fed7aa 100%)" },
  { name: "Rose Velvet", value: "linear-gradient(135deg, #4c0519 0%, #0f0206 100%)" },
  { name: "Electric Indigo", value: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)" },
  { name: "Monochrome Stealth", value: "linear-gradient(180deg, #18181b 0%, #09090b 100%)" },
];

const curatedColorThemes = [
  {
    name: "Acid Lime & Onyx",
    desc: "Neon lime accent on deep obsidian black",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #142900 0%, #050800 70%)",
    bgColor: "#050800",
    buttonColor: "#a3e635",
    buttonTextColor: "#050800",
    buttonBorderColor: "#bef264",
    textColor: "#f7fee7",
    accentColor: "#a3e635",
    buttonStyle: "pill",
  },
  {
    name: "Cyber Violet",
    desc: "Cosmic purple glow with violet neon",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #3b0764 0%, #0b0b14 70%)",
    bgColor: "#0b0b14",
    buttonColor: "rgba(255, 255, 255, 0.08)",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "rgba(168, 85, 247, 0.4)",
    textColor: "#f3e8ff",
    accentColor: "#a855f7",
    buttonStyle: "glass",
  },
  {
    name: "Emerald Horizon",
    desc: "Classic dark creator aesthetic with emerald highlights",
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
    bgColor: "#0d1117",
    buttonColor: "#10b981",
    buttonTextColor: "#042f2e",
    buttonBorderColor: "#34d399",
    textColor: "#ffffff",
    accentColor: "#10b981",
    buttonStyle: "rounded",
  },
  {
    name: "Sunset Ember",
    desc: "Warm twilight violet into fiery sunset orange",
    bgType: "gradient",
    bgGradient: "linear-gradient(135deg, #2e1065 0%, #7c2d12 60%, #c2410c 100%)",
    bgColor: "#2e1065",
    buttonColor: "#ea580c",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#fb923c",
    textColor: "#ffedd5",
    accentColor: "#f97316",
    buttonStyle: "rounded",
  },
  {
    name: "Obsidian Stealth",
    desc: "Ultra clean monochrome matte black",
    bgType: "color",
    bgColor: "#000000",
    bgGradient: "",
    buttonColor: "#18181b",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "rgba(255,255,255,0.18)",
    textColor: "#ffffff",
    accentColor: "#ffffff",
    buttonStyle: "rounded",
  },
  {
    name: "Electric Azure",
    desc: "Deep tech navy with glowing sky-cyan details",
    bgType: "gradient",
    bgGradient: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
    bgColor: "#020617",
    buttonColor: "#0284c7",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#38bdf8",
    textColor: "#f0f9ff",
    accentColor: "#38bdf8",
    buttonStyle: "rounded",
  },
  {
    name: "Minimalist Light",
    desc: "Clean editorial high-contrast modern light mode",
    bgType: "color",
    bgColor: "#f8fafc",
    bgGradient: "",
    buttonColor: "#0f172a",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#334155",
    textColor: "#0f172a",
    accentColor: "#0284c7",
    buttonStyle: "pill",
  },
  {
    name: "Rose Velvet",
    desc: "Deep cherry red with vibrant rose accents",
    bgType: "gradient",
    bgGradient: "radial-gradient(ellipse at top, #4c0519 0%, #0f0206 70%)",
    bgColor: "#0f0206",
    buttonColor: "#e11d48",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#fb7185",
    textColor: "#ffe4e6",
    accentColor: "#f43f5e",
    buttonStyle: "rounded",
  },
];

const buttonStyles = [
  { id: "rounded", label: "Rounded", radius: "16px" },
  { id: "pill", label: "Pill Full", radius: "9999px" },
  { id: "square", label: "Square Edge", radius: "4px" },
  { id: "shadow", label: "Drop Shadow", radius: "14px" },
  { id: "outlined", label: "Outlined Minimal", radius: "12px" },
  { id: "glass", label: "Frosted Glass", radius: "16px" },
  { id: "neon", label: "Neon Glow", radius: "9999px" },
];

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        <span className="font-mono text-[10px] uppercase text-text-secondary">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/80 shadow-xs">
          <input
            type="color"
            value={value.startsWith("#") ? value : "#10b981"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} color picker`}
            className="absolute -inset-2 h-14 w-14 cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="h-10 font-mono text-xs uppercase"
        />
      </div>

      {/* Quick swatches */}
      <div className="flex items-center gap-1.5 pt-1">
        {quickSwatches.map((color) => {
          const isSelected = value.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              title={color}
              className={`h-5 w-5 shrink-0 rounded-full border transition-transform hover:scale-125 active:scale-95 ${isSelected
                ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                : "border-white/20"
                }`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
    </div>
  );
}

interface ThemeStateSnapshot {
  backgroundColor: string;
  backgroundType: "gradient" | "color" | "custom_gradient" | "video" | "image" | "pattern" | "blur";
  backgroundGradient: string;
  backgroundImage: string | null;
  backgroundVideo: string | null;
  wallpaperEffect: string;
  wallpaperTint: number;
  wallpaperNoise: boolean;
  gradientStyle: string;
  gradientColor: string;
  gradientDirection: string;
  buttonStyle: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonBorderColor: string;
  buttonRadius: string;
  fontHeading: string;
  textColor: string;
  accentColor: string;
  animationsEnabled: boolean;
  showBranding: boolean;
  spotifyMusicEnabled: boolean;
  spotifyTrackUrl: string | null;
  spotifyTrackTitle: string | null;
  spotifyTrackArtist: string | null;
  spotifyTrackImage: string | null;
  spotifyTrackPreview: string | null;
  spotifyMusicLayout: "floating" | "card";
  stickersEnabled: boolean;
  stickerId: string;
  stickerUrl: string | null;
  stickerText: string | null;
  stickerPosition: string;
  stickerAnimation: string;
  stickerSize: string;
  stickerRotation: string;
  stickerLink: string | null;
  stickerPosX: number;
  stickerPosY: number;
}

export default function AppearanceEditorPage() {
  const { t } = useI18n();
  const { profile, updateProfile, theme, updateTheme, subscriptionTier } = useDashboard();

  // Navigation view state: null = Main Menu; 'theme' | 'wallpaper' | 'buttons' | 'text' | 'colors' | 'header' | 'stickers' | 'footer'
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"editor" | "live">("editor");

  const [backgroundColor, setBackgroundColor] = useState(theme?.backgroundColor || "#0d1117");
  const [backgroundType, setBackgroundType] = useState<
    "gradient" | "color" | "custom_gradient" | "video" | "image" | "pattern" | "blur"
  >(
    (theme?.backgroundType as any) || "color"
  );
  const [backgroundGradient, setBackgroundGradient] = useState(
    theme?.backgroundGradient || presetGradients[0].value
  );
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    theme?.backgroundImage || null
  );
  const [backgroundVideo, setBackgroundVideo] = useState<string | null>(
    theme?.backgroundVideo || null
  );
  const [wallpaperEffect, setWallpaperEffect] = useState<string>(
    theme?.wallpaperEffect || "blur"
  );
  const [wallpaperTint, setWallpaperTint] = useState<number>(
    theme?.wallpaperTint !== undefined && theme?.wallpaperTint !== null
      ? Number(theme.wallpaperTint)
      : 20
  );
  const [wallpaperNoise, setWallpaperNoise] = useState<boolean>(
    Boolean(theme?.wallpaperNoise)
  );
  const [gradientStyle, setGradientStyle] = useState<string>(
    theme?.gradientStyle || "custom"
  );
  const [gradientColor, setGradientColor] = useState<string>(
    theme?.gradientColor || "#778a00"
  );
  const [gradientDirection, setGradientDirection] = useState<string>(
    theme?.gradientDirection || "radial"
  );

  // Custom gradient generator state
  const [customGradFrom, setCustomGradFrom] = useState("#000000");
  const [customGradTo, setCustomGradTo] = useState("#a3e635");
  const [customGradDir, setCustomGradDir] = useState<"135deg" | "180deg" | "90deg" | "radial">("135deg");

  const [buttonStyle, setButtonStyle] = useState(theme?.buttonStyle || "rounded");
  const [buttonColor, setButtonColor] = useState(theme?.buttonColor || "#10b981");
  const [buttonTextColor, setButtonTextColor] = useState(theme?.buttonTextColor || "#042f2e");
  const [buttonBorderColor, setButtonBorderColor] = useState(theme?.buttonBorderColor || "#34d399");
  const [buttonRadius, setButtonRadius] = useState(theme?.buttonRadius || "16px");
  const [fontHeading, setFontHeading] = useState(theme?.fontHeading || "Inter");
  const [textColor, setTextColor] = useState(theme?.textColor || "#ffffff");
  const [accentColor, setAccentColor] = useState(theme?.accentColor || "#10b981");
  const [animationsEnabled, setAnimationsEnabled] = useState(theme?.animationsEnabled ?? true);
  const [showBranding, setShowBranding] = useState(theme?.showBranding ?? false);

  // Spotify Profile Music state
  const [spotifyMusicEnabled, setSpotifyMusicEnabled] = useState(theme?.spotifyMusicEnabled ?? false);
  const [spotifyTrackUrl, setSpotifyTrackUrl] = useState<string | null>(theme?.spotifyTrackUrl || null);
  const [spotifyTrackTitle, setSpotifyTrackTitle] = useState<string | null>(theme?.spotifyTrackTitle || null);
  const [spotifyTrackArtist, setSpotifyTrackArtist] = useState<string | null>(theme?.spotifyTrackArtist || null);
  const [spotifyTrackImage, setSpotifyTrackImage] = useState<string | null>(theme?.spotifyTrackImage || null);
  const [spotifyTrackPreview, setSpotifyTrackPreview] = useState<string | null>(theme?.spotifyTrackPreview || null);
  const [spotifyMusicLayout, setSpotifyMusicLayout] = useState<"floating" | "card">(
    theme?.spotifyMusicLayout === "card" ? "card" : "floating"
  );

  // Stickers state
  const [stickersEnabled, setStickersEnabled] = useState(theme?.stickersEnabled ?? false);
  const [stickerId, setStickerId] = useState<string>(theme?.stickerId || "big_sale");
  const [stickerUrl, setStickerUrl] = useState<string | null>(theme?.stickerUrl || null);
  const [stickerText, setStickerText] = useState<string | null>(theme?.stickerText || "BIG SALE");
  const [stickerPosition, setStickerPosition] = useState<string>(theme?.stickerPosition || "top-right");
  const [stickerAnimation, setStickerAnimation] = useState<string>(theme?.stickerAnimation || "float");
  const [stickerSize, setStickerSize] = useState<string>(theme?.stickerSize || "medium");
  const [stickerRotation, setStickerRotation] = useState<string>(theme?.stickerRotation || "-6deg");
  const [stickerLink, setStickerLink] = useState<string | null>(theme?.stickerLink || null);
  const [stickerPosX, setStickerPosX] = useState<number>(
    theme?.stickerPosX !== null && theme?.stickerPosX !== undefined ? Number(theme.stickerPosX) : 85
  );
  const [stickerPosY, setStickerPosY] = useState<number>(
    theme?.stickerPosY !== null && theme?.stickerPosY !== undefined ? Number(theme.stickerPosY) : 12
  );

  const [isSaving, setIsSaving] = useState(false);

  // History Stack for Undo / Redo / Cancel
  const [history, setHistory] = useState<ThemeStateSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryApplying = useRef(false);

  // Helper to construct current snapshot
  const getCurrentSnapshot = (): ThemeStateSnapshot => ({
    backgroundColor,
    backgroundType,
    backgroundGradient,
    backgroundImage,
    backgroundVideo,
    wallpaperEffect,
    wallpaperTint,
    wallpaperNoise,
    gradientStyle,
    gradientColor,
    gradientDirection,
    buttonStyle,
    buttonColor,
    buttonTextColor,
    buttonBorderColor,
    buttonRadius,
    fontHeading,
    textColor,
    accentColor,
    animationsEnabled,
    showBranding,
    spotifyMusicEnabled,
    spotifyTrackUrl,
    spotifyTrackTitle,
    spotifyTrackArtist,
    spotifyTrackImage,
    spotifyTrackPreview,
    spotifyMusicLayout,
    stickersEnabled,
    stickerId,
    stickerUrl,
    stickerText,
    stickerPosition,
    stickerAnimation,
    stickerSize,
    stickerRotation,
    stickerLink,
    stickerPosX,
    stickerPosY,
  });

  // Synchronize state when theme is loaded from backend
  useEffect(() => {
    if (theme) {
      if (theme.backgroundColor) setBackgroundColor(theme.backgroundColor);
      if (theme.backgroundType) {
        setBackgroundType(theme.backgroundType as any);
      }
      if (theme.backgroundGradient) setBackgroundGradient(theme.backgroundGradient);
      if (theme.backgroundImage !== undefined) setBackgroundImage(theme.backgroundImage);
      if (theme.backgroundVideo !== undefined) setBackgroundVideo(theme.backgroundVideo);
      if (theme.wallpaperEffect) setWallpaperEffect(theme.wallpaperEffect);
      if (theme.wallpaperTint !== undefined && theme.wallpaperTint !== null) setWallpaperTint(Number(theme.wallpaperTint));
      if (theme.wallpaperNoise !== undefined) setWallpaperNoise(Boolean(theme.wallpaperNoise));
      if (theme.gradientStyle) setGradientStyle(theme.gradientStyle);
      if (theme.gradientColor) setGradientColor(theme.gradientColor);
      if (theme.gradientDirection) setGradientDirection(theme.gradientDirection);
      if (theme.buttonStyle) setButtonStyle(theme.buttonStyle);
      if (theme.buttonColor) setButtonColor(theme.buttonColor);
      if (theme.buttonTextColor) setButtonTextColor(theme.buttonTextColor);
      if (theme.buttonBorderColor) setButtonBorderColor(theme.buttonBorderColor);
      if (theme.buttonRadius) setButtonRadius(theme.buttonRadius);
      if (theme.fontHeading) setFontHeading(theme.fontHeading);
      if (theme.textColor) setTextColor(theme.textColor);
      if (theme.accentColor) setAccentColor(theme.accentColor);
      if (theme.animationsEnabled !== undefined) setAnimationsEnabled(theme.animationsEnabled);
      if (theme.showBranding !== undefined) setShowBranding(theme.showBranding);
      if (theme.spotifyMusicEnabled !== undefined) setSpotifyMusicEnabled(Boolean(theme.spotifyMusicEnabled));
      if (theme.spotifyTrackUrl !== undefined) setSpotifyTrackUrl(theme.spotifyTrackUrl);
      if (theme.spotifyTrackTitle !== undefined) setSpotifyTrackTitle(theme.spotifyTrackTitle);
      if (theme.spotifyTrackArtist !== undefined) setSpotifyTrackArtist(theme.spotifyTrackArtist);
      if (theme.spotifyTrackImage !== undefined) setSpotifyTrackImage(theme.spotifyTrackImage);
      if (theme.spotifyTrackPreview !== undefined) setSpotifyTrackPreview(theme.spotifyTrackPreview);
      if (theme.spotifyMusicLayout !== undefined) setSpotifyMusicLayout(theme.spotifyMusicLayout === "card" ? "card" : "floating");
      if (theme.stickersEnabled !== undefined) setStickersEnabled(Boolean(theme.stickersEnabled));
      if (theme.stickerId) setStickerId(theme.stickerId);
      if (theme.stickerUrl !== undefined) setStickerUrl(theme.stickerUrl);
      if (theme.stickerText !== undefined) setStickerText(theme.stickerText);
      if (theme.stickerPosition) setStickerPosition(theme.stickerPosition);
      if (theme.stickerAnimation) setStickerAnimation(theme.stickerAnimation);
      if (theme.stickerSize) setStickerSize(theme.stickerSize);
      if (theme.stickerRotation) setStickerRotation(theme.stickerRotation);
      if (theme.stickerLink !== undefined) setStickerLink(theme.stickerLink);
      if (theme.stickerPosX !== undefined && theme.stickerPosX !== null) setStickerPosX(Number(theme.stickerPosX));
      if (theme.stickerPosY !== undefined && theme.stickerPosY !== null) setStickerPosY(Number(theme.stickerPosY));

      // Initialize base snapshot if history is empty
      if (history.length === 0) {
        const snap: ThemeStateSnapshot = {
          backgroundColor: theme.backgroundColor || "#0d1117",
          backgroundType: (theme.backgroundType as any) || "color",
          backgroundGradient: theme.backgroundGradient || presetGradients[0].value,
          backgroundImage: theme.backgroundImage || null,
          backgroundVideo: theme.backgroundVideo || null,
          wallpaperEffect: theme.wallpaperEffect || "blur",
          wallpaperTint: Number(theme.wallpaperTint ?? 20),
          wallpaperNoise: Boolean(theme.wallpaperNoise),
          gradientStyle: theme.gradientStyle || "custom",
          gradientColor: theme.gradientColor || "#778a00",
          gradientDirection: theme.gradientDirection || "radial",
          buttonStyle: theme.buttonStyle || "rounded",
          buttonColor: theme.buttonColor || "#10b981",
          buttonTextColor: theme.buttonTextColor || "#042f2e",
          buttonBorderColor: theme.buttonBorderColor || "#34d399",
          buttonRadius: theme.buttonRadius || "16px",
          fontHeading: theme.fontHeading || "Inter",
          textColor: theme.textColor || "#ffffff",
          accentColor: theme.accentColor || "#10b981",
          animationsEnabled: theme.animationsEnabled ?? true,
          showBranding: theme.showBranding ?? false,
          spotifyMusicEnabled: Boolean(theme.spotifyMusicEnabled),
          spotifyTrackUrl: theme.spotifyTrackUrl || null,
          spotifyTrackTitle: theme.spotifyTrackTitle || null,
          spotifyTrackArtist: theme.spotifyTrackArtist || null,
          spotifyTrackImage: theme.spotifyTrackImage || null,
          spotifyTrackPreview: theme.spotifyTrackPreview || null,
          spotifyMusicLayout: theme.spotifyMusicLayout === "card" ? "card" : "floating",
          stickersEnabled: Boolean(theme.stickersEnabled),
          stickerId: theme.stickerId || "big_sale",
          stickerUrl: theme.stickerUrl || null,
          stickerText: theme.stickerText || "BIG SALE",
          stickerPosition: theme.stickerPosition || "top-right",
          stickerAnimation: theme.stickerAnimation || "float",
          stickerSize: theme.stickerSize || "medium",
          stickerRotation: theme.stickerRotation || "-6deg",
          stickerLink: theme.stickerLink || null,
          stickerPosX: Number(theme.stickerPosX ?? 85),
          stickerPosY: Number(theme.stickerPosY ?? 12),
        };
        setHistory([snap]);
        setHistoryIndex(0);
      }
    }
  }, [theme]);

  // Push state to history
  const pushHistorySnapshot = (snap: ThemeStateSnapshot) => {
    if (isHistoryApplying.current) return;
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, snap];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const applySnapshot = (snap: ThemeStateSnapshot) => {
    isHistoryApplying.current = true;
    setBackgroundColor(snap.backgroundColor);
    setBackgroundType(snap.backgroundType);
    setBackgroundGradient(snap.backgroundGradient);
    setButtonStyle(snap.buttonStyle);
    setButtonColor(snap.buttonColor);
    setButtonTextColor(snap.buttonTextColor);
    setButtonBorderColor(snap.buttonBorderColor);
    setButtonRadius(snap.buttonRadius);
    setFontHeading(snap.fontHeading);
    setTextColor(snap.textColor);
    setAccentColor(snap.accentColor);
    setAnimationsEnabled(snap.animationsEnabled);
    setShowBranding(snap.showBranding);
    setSpotifyMusicEnabled(snap.spotifyMusicEnabled);
    setSpotifyTrackUrl(snap.spotifyTrackUrl);
    setSpotifyTrackTitle(snap.spotifyTrackTitle);
    setSpotifyTrackArtist(snap.spotifyTrackArtist);
    setSpotifyTrackImage(snap.spotifyTrackImage);
    setSpotifyTrackPreview(snap.spotifyTrackPreview);
    setSpotifyMusicLayout(snap.spotifyMusicLayout);
    setStickersEnabled(snap.stickersEnabled);
    setStickerId(snap.stickerId);
    setStickerUrl(snap.stickerUrl);
    setStickerText(snap.stickerText);
    setStickerPosition(snap.stickerPosition);
    setStickerAnimation(snap.stickerAnimation);
    setStickerSize(snap.stickerSize);
    setStickerRotation(snap.stickerRotation);
    setStickerLink(snap.stickerLink);
    setStickerPosX(snap.stickerPosX);
    setStickerPosY(snap.stickerPosY);
    setBackgroundImage(snap.backgroundImage);
    setBackgroundVideo(snap.backgroundVideo);
    setWallpaperEffect(snap.wallpaperEffect);
    setWallpaperTint(snap.wallpaperTint);
    setWallpaperNoise(snap.wallpaperNoise);
    setGradientStyle(snap.gradientStyle);
    setGradientColor(snap.gradientColor);
    setGradientDirection(snap.gradientDirection);

    updateTheme({ ...snap });
    triggerAutoSaveTheme({ ...snap }, 0);

    setTimeout(() => {
      isHistoryApplying.current = false;
    }, 50);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setHistoryIndex(targetIndex);
      applySnapshot(history[targetIndex]);
      toast.info("Undo: Avvalgi holat tiklandi ↶");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setHistoryIndex(targetIndex);
      applySnapshot(history[targetIndex]);
      toast.info("Redo: Keyingi holat tiklandi ↷");
    }
  };

  const handleCancel = () => {
    if (history.length > 0) {
      setHistoryIndex(0);
      applySnapshot(history[0]);
      toast.info("O'zgarishlar bekor qilindi (Cancelled)");
    }
  };

  const autoSaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerAutoSaveTheme = (overrideData: any = {}, delay = 400) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backgroundColor: overrideData.backgroundColor ?? backgroundColor,
            backgroundType:
              overrideData.backgroundType ??
              (backgroundType === "video"
                ? "video"
                : backgroundType === "color"
                  ? "color"
                  : "gradient"),
            backgroundGradient: overrideData.backgroundGradient ?? backgroundGradient,
            backgroundVideo: overrideData.backgroundVideo ?? backgroundVideo,
            buttonStyle: overrideData.buttonStyle ?? buttonStyle,
            buttonColor: overrideData.buttonColor ?? buttonColor,
            buttonTextColor: overrideData.buttonTextColor ?? buttonTextColor,
            buttonBorderColor: overrideData.buttonBorderColor ?? buttonBorderColor,
            buttonRadius: overrideData.buttonRadius ?? buttonRadius,
            fontHeading: overrideData.fontHeading ?? fontHeading,
            textColor: overrideData.textColor ?? textColor,
            accentColor: overrideData.accentColor ?? accentColor,
            animationsEnabled: overrideData.animationsEnabled ?? animationsEnabled,
            showBranding: overrideData.showBranding ?? showBranding,
            spotifyMusicEnabled: overrideData.spotifyMusicEnabled ?? spotifyMusicEnabled,
            spotifyTrackUrl: overrideData.spotifyTrackUrl ?? spotifyTrackUrl,
            spotifyTrackTitle: overrideData.spotifyTrackTitle ?? spotifyTrackTitle,
            spotifyTrackArtist: overrideData.spotifyTrackArtist ?? spotifyTrackArtist,
            spotifyTrackImage: overrideData.spotifyTrackImage ?? spotifyTrackImage,
            spotifyTrackPreview: overrideData.spotifyTrackPreview ?? spotifyTrackPreview,
            spotifyMusicLayout: overrideData.spotifyMusicLayout ?? spotifyMusicLayout,
            stickersEnabled: overrideData.stickersEnabled ?? stickersEnabled,
            stickerId: overrideData.stickerId ?? stickerId,
            stickerUrl: overrideData.stickerUrl ?? stickerUrl,
            stickerText: overrideData.stickerText ?? stickerText,
            stickerPosition: overrideData.stickerPosition ?? stickerPosition,
            stickerAnimation: overrideData.stickerAnimation ?? stickerAnimation,
            stickerSize: overrideData.stickerSize ?? stickerSize,
            stickerRotation: overrideData.stickerRotation ?? stickerRotation,
            stickerLink: overrideData.stickerLink ?? stickerLink,
            stickerPosX: overrideData.stickerPosX ?? stickerPosX,
            stickerPosY: overrideData.stickerPosY ?? stickerPosY,
            backgroundImage: overrideData.backgroundImage ?? backgroundImage,
            wallpaperEffect: overrideData.wallpaperEffect ?? wallpaperEffect,
            wallpaperTint: overrideData.wallpaperTint ?? wallpaperTint,
            wallpaperNoise: overrideData.wallpaperNoise ?? wallpaperNoise,
            gradientStyle: overrideData.gradientStyle ?? gradientStyle,
            gradientColor: overrideData.gradientColor ?? gradientColor,
            gradientDirection: overrideData.gradientDirection ?? gradientDirection,
            heroBlur: theme?.heroBlur,
            heroFade: theme?.heroFade,
            heroDarken: theme?.heroDarken,
          }),
        });
      } catch { }
    }, delay);
  };

  // Apply custom gradient changes in real-time
  const applyCustomGradient = (from: string, to: string, dir: string) => {
    const gradValue =
      dir === "radial"
        ? `radial-gradient(ellipse at top, ${from} 0%, ${to} 70%)`
        : `linear-gradient(${dir}, ${from} 0%, ${to} 100%)`;

    setBackgroundGradient(gradValue);
    updateTheme({ backgroundGradient: gradValue, backgroundType: "gradient" });
    triggerAutoSaveTheme({ backgroundGradient: gradValue, backgroundType: "gradient" }, 300);
    pushHistorySnapshot({
      ...getCurrentSnapshot(),
      backgroundGradient: gradValue,
      backgroundType: "gradient",
    });
  };

  // 1-Click apply curated color theme
  const applyCuratedTheme = (item: typeof curatedColorThemes[0]) => {
    setBackgroundColor(item.bgColor);
    setBackgroundType(item.bgType === "color" ? "color" : "gradient");
    if (item.bgGradient) setBackgroundGradient(item.bgGradient);
    setButtonColor(item.buttonColor);
    setButtonTextColor(item.buttonTextColor);
    setButtonBorderColor(item.buttonBorderColor);
    setTextColor(item.textColor);
    setAccentColor(item.accentColor);
    setButtonStyle(item.buttonStyle);

    const updated = {
      backgroundColor: item.bgColor,
      backgroundType: item.bgType as any,
      backgroundGradient: item.bgGradient || undefined,
      buttonColor: item.buttonColor,
      buttonTextColor: item.buttonTextColor,
      buttonBorderColor: item.buttonBorderColor,
      textColor: item.textColor,
      accentColor: item.accentColor,
      buttonStyle: item.buttonStyle,
    };

    updateTheme(updated);
    triggerAutoSaveTheme(updated, 0);
    pushHistorySnapshot({
      ...getCurrentSnapshot(),
      ...updated,
      backgroundGradient: item.bgGradient || backgroundGradient,
    });

    toast.success(`Theme palette "${item.name}" applied! ⚡`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundColor,
          backgroundType,
          backgroundGradient,
          backgroundImage,
          wallpaperEffect,
          wallpaperTint,
          wallpaperNoise,
          gradientStyle,
          gradientColor,
          gradientDirection,
          backgroundVideo,
          buttonStyle,
          buttonColor,
          buttonTextColor,
          buttonBorderColor,
          buttonRadius,
          fontHeading,
          textColor,
          accentColor,
          animationsEnabled,
          showBranding,
          spotifyMusicEnabled,
          spotifyTrackUrl,
          spotifyTrackTitle,
          spotifyTrackArtist,
          spotifyTrackImage,
          spotifyTrackPreview,
          spotifyMusicLayout,
          stickersEnabled,
          stickerId,
          stickerUrl,
          stickerText,
          stickerPosition,
          stickerAnimation,
          stickerSize,
          stickerRotation,
          stickerLink,
          stickerPosX,
          stickerPosY,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to save theme");
      }

      updateTheme({
        backgroundColor,
        backgroundType,
        backgroundGradient,
        backgroundImage,
        wallpaperEffect,
        wallpaperTint,
        wallpaperNoise,
        gradientStyle,
        gradientColor,
        gradientDirection,
        backgroundVideo,
        buttonStyle,
        buttonColor,
        buttonTextColor,
        buttonBorderColor,
        buttonRadius,
        fontHeading,
        textColor,
        accentColor,
        animationsEnabled,
        showBranding,
        spotifyMusicEnabled,
        spotifyTrackUrl,
        spotifyTrackTitle,
        spotifyTrackArtist,
        spotifyTrackImage,
        spotifyTrackPreview,
        spotifyMusicLayout,
        stickersEnabled,
        stickerId,
        stickerUrl,
        stickerText,
        stickerPosition,
        stickerAnimation,
        stickerSize,
        stickerRotation,
        stickerLink,
        stickerPosX,
        stickerPosY,
      });

      toast.success("Design sozlamalari muvaffaqiyatli saqlandi! ✨");
    } catch (err: any) {
      toast.error(err.message || "Failed to update appearance");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper values for the Menu badges & labels
  const currentCurated = curatedColorThemes.find(
    (t) =>
      (t.bgType === "color" && t.bgColor.toLowerCase() === backgroundColor.toLowerCase()) ||
      (t.bgType === "gradient" && t.bgGradient === backgroundGradient)
  );
  const activeThemeLabel = currentCurated?.name || "Custom";

  const wallpaperBadge =
    backgroundType === "video"
      ? "Video"
      : backgroundType === "color"
        ? "Fill"
        : backgroundType === "gradient"
          ? "Gradient"
          : backgroundType === "blur"
            ? "Blur"
            : backgroundType === "pattern"
              ? "Pattern"
              : "Image";

  const currentButtonObj = buttonStyles.find((b) => b.id === buttonStyle);
  const buttonBadgeLabel = currentButtonObj?.label.split(" ")[0] || "Rounded";

  return (
    <>
      {/* Mobile Live Design Studio - Phone Preview is ALWAYS visible while designing on Mobile */}
      <div className="block lg:hidden">
        <MobileLiveDesignStudio />
      </div>

      {/* Desktop Appearance Studio - For larger screens */}
      <div className="hidden lg:block mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Bar matching reference screenshot */}
      <div className="mb-5 sm:mb-6 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {activeSection !== null && (
            <button
              type="button"
              onClick={() => setActiveSection(null)}
              className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-card text-foreground transition-all hover:bg-surface/80 active:scale-95 shadow-xs"
              title={t.appearancePage.backToDesign}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground truncate">
            {activeSection === null
              ? t.appearancePage.title
              : activeSection === "theme"
                ? t.appearancePage.sections.theme
                : activeSection === "wallpaper"
                  ? t.appearancePage.sections.wallpaper
                  : activeSection === "buttons"
                    ? t.appearancePage.sections.buttons
                    : activeSection === "text"
                      ? t.appearancePage.sections.text
                      : activeSection === "colors"
                        ? t.appearancePage.sections.colors
                        : activeSection === "header"
                          ? t.appearancePage.sections.header
                          : activeSection === "stickers"
                            ? t.appearancePage.sections.stickers
                            : t.appearancePage.sections.footer}
          </h1>
        </div>

        {/* Undo, Redo, Cancel, Save action group */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-muted/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title={t.appearancePage.undo}
          >
            <Undo2 className="h-4 w-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:bg-muted/70 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title={t.appearancePage.redo}
          >
            <Redo2 className="h-4 w-4" />
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-border/80 bg-card px-3 sm:px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-surface/70 active:scale-95 transition-all shadow-xs"
          >
            {t.appearancePage.cancel}
          </button>

          {/* Save (Purple pill matching reference #7c3aed) */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-[#7c3aed] hover:bg-[#6d28d9] px-4 sm:px-5 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-60"
          >
            {isSaving ? t.appearancePage.saving : t.appearancePage.save}
          </button>
        </div>
      </div>

      {/* VIEW 1: MAIN DESIGN MENU (When activeSection === null) */}
      {activeSection === null && (
        <div className="space-y-6">
          {/* Top Theme Card */}
          <div
            onClick={() => setActiveSection("theme")}
            className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
          >
            <div className="flex items-center gap-3.5">
              {/* Thumbnail with theme background + "Aa" badge */}
              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-xs overflow-hidden"
                style={{
                  background:
                    backgroundType === "gradient"
                      ? backgroundGradient
                      : backgroundColor,
                }}
              >
                <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-xs">
                  Aa
                </span>
              </div>
              <span className="text-sm font-bold text-foreground sm:text-base">
                {t.appearancePage.sections.theme}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">
                {activeThemeLabel}
              </span>
              <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Customize Section Subtitle */}
          <div>
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
              {t.appearancePage.customize}
            </h2>

            {/* Stacked Menu Items */}
            <div className="mt-3 space-y-2.5">
              {/* 1. Header & Layout */}
              <div
                onClick={() => setActiveSection("header")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 text-emerald-500 shadow-2xs overflow-hidden">
                    {profile?.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Layout className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.header}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 dark:bg-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-white flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-current text-amber-400" />
                    {profile?.layout === "hero"
                      ? "Hero"
                      : profile?.layout === "banner"
                        ? "Banner"
                        : profile?.layout === "cutout"
                          ? "Cutout"
                          : profile?.layout === "shape"
                            ? "Shape"
                            : "Classic"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 2. Wallpaper */}
              <div
                onClick={() => setActiveSection("wallpaper")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-2xs overflow-hidden relative">
                    {backgroundType === "image" && (backgroundImage || CURATED_WALLPAPERS[0].url) ? (
                      <img
                        src={backgroundImage || CURATED_WALLPAPERS[0].url}
                        alt="Wallpaper thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="h-full w-full"
                        style={{
                          background:
                            backgroundType === "gradient"
                              ? backgroundGradient
                              : backgroundColor,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.wallpaper}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 dark:bg-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-white flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-current text-amber-400" />
                    {wallpaperBadge}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 3. Buttons */}
              <div
                onClick={() => setActiveSection("buttons")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 p-2 shadow-2xs">
                    <div
                      className="h-5 w-full border shadow-2xs"
                      style={{
                        backgroundColor: buttonColor,
                        borderColor: buttonBorderColor,
                        borderRadius: buttonRadius,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.buttons}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-zinc-800 dark:bg-zinc-700 px-2.5 py-0.5 text-[11px] font-bold text-white flex items-center gap-1">
                    <Zap className="h-2.5 w-2.5 fill-current text-amber-400" />
                    {buttonBadgeLabel}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 4. Text */}
              <div
                onClick={() => setActiveSection("text")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 text-foreground font-bold shadow-2xs">
                    Aa
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {fontHeading}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 5. Colors */}
              <div
                onClick={() => setActiveSection("colors")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 shadow-2xs">
                    {/* Vertical two-tone split bar */}
                    <div className="flex h-6 w-3 overflow-hidden rounded-full border border-border/80 shadow-2xs">
                      <div className="w-1/2 h-full" style={{ backgroundColor: buttonColor }} />
                      <div className="w-1/2 h-full" style={{ backgroundColor: accentColor }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.colors}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 6. Stickers */}
              <div
                onClick={() => setActiveSection("stickers")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 shadow-2xs overflow-hidden">
                    {renderStickerById(stickerId || "big_sale", stickerUrl, 36)}
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.stickers}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    {t.appearancePage.decoratePage}
                  </span>
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* 7. Footer */}
              <div
                onClick={() => setActiveSection("footer")}
                className="group flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 shadow-xs hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/70 text-foreground font-bold shadow-2xs">
                    <Asterisk className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {t.appearancePage.sections.footer}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-text-secondary/70 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: THEME SUB-VIEW */}
      {activeSection === "theme" && (
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-500 dark:text-amber-400">
                  <Palette className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                    Curated Pro Color Palettes (1-Click Apply)
                  </h2>
                  <p className="text-[11px] text-text-secondary">
                    Complete designer color schemes matched with button styling and high contrast.
                  </p>
                </div>
              </div>
              <span className="hidden items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 sm:inline-flex">
                <Sparkles className="h-3 w-3" />
                1-Click Instant
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {curatedColorThemes.map((themeItem) => {
                  const isActive =
                    (themeItem.bgType === "color" && backgroundColor === themeItem.bgColor) ||
                    (themeItem.bgType === "gradient" && backgroundGradient === themeItem.bgGradient);

                  return (
                    <button
                      key={themeItem.name}
                      type="button"
                      onClick={() => applyCuratedTheme(themeItem)}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-200 ease-out-soft active:scale-[0.98] ${isActive
                        ? "border-2 border-emerald-500 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40"
                        : "border-border/80 bg-surface/30 hover:border-border hover:bg-surface/60"
                        }`}
                    >
                      {/* Visual Color Pill preview */}
                      <div
                        className="mb-3 flex h-14 w-full items-center justify-center rounded-xl border border-white/10 p-2 shadow-inner"
                        style={{
                          background:
                            themeItem.bgType === "gradient" ? themeItem.bgGradient : themeItem.bgColor,
                        }}
                      >
                        <div
                          className="h-6 w-3/4 rounded-full border shadow-sm"
                          style={{
                            backgroundColor: themeItem.buttonColor,
                            borderColor: themeItem.buttonBorderColor,
                          }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-bold text-foreground">
                            {themeItem.name}
                          </span>
                          {isActive && (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-text-secondary">
                          {themeItem.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 3: WALLPAPER SUB-VIEW */}
      {activeSection === "wallpaper" && (
        <WallpaperStudio
          backgroundType={
            backgroundType === "video"
              ? "video"
              : backgroundType === "color"
                ? "color"
                : backgroundType === "image"
                  ? "image"
                  : backgroundType === "pattern"
                    ? "pattern"
                    : backgroundType === "blur"
                      ? "blur"
                      : "gradient"
          }
          onBackgroundTypeChange={(type) => {
            setBackgroundType(type);
            updateTheme({ backgroundType: type });
            triggerAutoSaveTheme({ backgroundType: type }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              backgroundType: type,
            });
          }}
          backgroundImage={backgroundImage}
          onBackgroundImageChange={(url) => {
            setBackgroundImage(url);
            updateTheme({ backgroundImage: url, backgroundType: "image" });
            triggerAutoSaveTheme({ backgroundImage: url, backgroundType: "image" }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              backgroundImage: url,
              backgroundType: "image",
            });
          }}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={(color) => {
            setBackgroundColor(color);
            updateTheme({ backgroundColor: color });
            triggerAutoSaveTheme({ backgroundColor: color }, 200);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              backgroundColor: color,
            });
          }}
          backgroundGradient={backgroundGradient}
          onBackgroundGradientChange={(grad) => {
            setBackgroundGradient(grad);
            updateTheme({ backgroundGradient: grad });
            triggerAutoSaveTheme({ backgroundGradient: grad }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              backgroundGradient: grad,
            });
          }}
          backgroundVideo={backgroundVideo}
          onBackgroundVideoChange={(videoUrl) => {
            setBackgroundVideo(videoUrl);
            updateTheme({ backgroundVideo: videoUrl, backgroundType: "video" });
            triggerAutoSaveTheme({ backgroundVideo: videoUrl, backgroundType: "video" }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              backgroundVideo: videoUrl,
              backgroundType: "video",
            });
          }}
          wallpaperEffect={wallpaperEffect}
          onWallpaperEffectChange={(eff) => {
            setWallpaperEffect(eff);
            updateTheme({ wallpaperEffect: eff });
            triggerAutoSaveTheme({ wallpaperEffect: eff }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              wallpaperEffect: eff,
            });
          }}
          wallpaperTint={wallpaperTint}
          onWallpaperTintChange={(tint) => {
            setWallpaperTint(tint);
            updateTheme({ wallpaperTint: tint });
            triggerAutoSaveTheme({ wallpaperTint: tint }, 150);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              wallpaperTint: tint,
            });
          }}
          wallpaperNoise={wallpaperNoise}
          onWallpaperNoiseChange={(noise) => {
            setWallpaperNoise(noise);
            updateTheme({ wallpaperNoise: noise });
            triggerAutoSaveTheme({ wallpaperNoise: noise }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              wallpaperNoise: noise,
            });
          }}
          gradientStyle={gradientStyle}
          onGradientStyleChange={(style) => {
            setGradientStyle(style);
            updateTheme({ gradientStyle: style });
            triggerAutoSaveTheme({ gradientStyle: style }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              gradientStyle: style,
            });
          }}
          gradientColor={gradientColor}
          onGradientColorChange={(color) => {
            setGradientColor(color);
            updateTheme({ gradientColor: color });
            triggerAutoSaveTheme({ gradientColor: color }, 150);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              gradientColor: color,
            });
          }}
          gradientDirection={gradientDirection}
          onGradientDirectionChange={(dir) => {
            setGradientDirection(dir);
            updateTheme({ gradientDirection: dir });
            triggerAutoSaveTheme({ gradientDirection: dir }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              gradientDirection: dir,
            });
          }}
        />
      )}

      {/* VIEW 4: BUTTONS SUB-VIEW */}
      {activeSection === "buttons" && (
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/[0.04] text-emerald-600 dark:text-emerald-400">
                <Sliders className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  Button Styles & Geometry
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Customize link button shapes, background fill, text, and border glow.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">Button Geometry</Label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {buttonStyles.map((b) => {
                    const isSelected = buttonStyle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setButtonStyle(b.id);
                          setButtonRadius(b.radius);
                          updateTheme({ buttonStyle: b.id, buttonRadius: b.radius });
                          triggerAutoSaveTheme({ buttonStyle: b.id, buttonRadius: b.radius }, 0);
                          pushHistorySnapshot({
                            ...getCurrentSnapshot(),
                            buttonStyle: b.id,
                            buttonRadius: b.radius,
                          });
                        }}
                        className={`rounded-xl border p-3 text-center transition-all duration-200 ease-out-soft active:scale-[0.98] ${isSelected
                          ? "border-emerald-500/50 bg-emerald-500/[0.07] text-emerald-800 shadow-[0_0_0_1px_rgba(16,185,129,0.18)] dark:text-emerald-200"
                          : "border-border/80 bg-surface/30 text-text-secondary hover:border-border hover:text-foreground"
                          }`}
                      >
                        <span
                          className="mx-auto mb-2 block h-6 w-full border border-current opacity-80"
                          style={{ borderRadius: b.radius }}
                        />
                        <span className="text-[11px] font-semibold">{b.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Button Color Pickers */}
              <div className="grid grid-cols-1 gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
                <ColorField
                  label="Button Fill Color"
                  value={buttonColor}
                  onChange={(value) => {
                    setButtonColor(value);
                    updateTheme({ buttonColor: value });
                    triggerAutoSaveTheme({ buttonColor: value }, 300);
                  }}
                />
                <ColorField
                  label="Button Text & Icon Color"
                  value={buttonTextColor}
                  onChange={(value) => {
                    setButtonTextColor(value);
                    updateTheme({ buttonTextColor: value });
                    triggerAutoSaveTheme({ buttonTextColor: value }, 300);
                  }}
                />
                <ColorField
                  label="Border & Highlight Ring"
                  value={buttonBorderColor}
                  onChange={(value) => {
                    setButtonBorderColor(value);
                    updateTheme({ buttonBorderColor: value });
                    triggerAutoSaveTheme({ buttonBorderColor: value }, 300);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 5: TEXT & FONTS SUB-VIEW */}
      {activeSection === "text" && (
        <TypographyStudio
          currentFont={fontHeading}
          onFontChange={(f) => {
            setFontHeading(f);
            updateTheme({ fontHeading: f, fontBody: "Inter" });
            triggerAutoSaveTheme({ fontHeading: f, fontBody: "Inter" }, 0);
            pushHistorySnapshot({
              ...getCurrentSnapshot(),
              fontHeading: f,
            });
            toast.success(`Shrift tanlandi: ${f}`);
          }}
          textColor={textColor}
          onTextColorChange={(val) => {
            setTextColor(val);
            updateTheme({ textColor: val });
            triggerAutoSaveTheme({ textColor: val }, 300);
          }}
          accentColor={accentColor}
          onAccentColorChange={(val) => {
            setAccentColor(val);
            updateTheme({ accentColor: val });
            triggerAutoSaveTheme({ accentColor: val }, 300);
          }}
          displayName={profile?.displayName || "ROMAN"}
          avatarUrl={profile?.avatarUrl}
        />
      )}

      {/* VIEW 6: COLORS SUB-VIEW */}
      {activeSection === "colors" && (
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-pink-500/25 bg-gradient-to-b from-pink-500/15 to-pink-500/[0.04] text-pink-600 dark:text-pink-400">
                <Palette className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground">
                  Color Palette Studio
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Fine-tune each individual color across background, buttons, text, and accents.
                </p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <ColorField
                  label="Background Color (Base)"
                  value={backgroundColor}
                  onChange={(val) => {
                    setBackgroundColor(val);
                    updateTheme({ backgroundColor: val });
                    triggerAutoSaveTheme({ backgroundColor: val }, 300);
                  }}
                />
                <ColorField
                  label="Button Fill Color"
                  value={buttonColor}
                  onChange={(val) => {
                    setButtonColor(val);
                    updateTheme({ buttonColor: val });
                    triggerAutoSaveTheme({ buttonColor: val }, 300);
                  }}
                />
                <ColorField
                  label="Text Color"
                  value={textColor}
                  onChange={(val) => {
                    setTextColor(val);
                    updateTheme({ textColor: val });
                    triggerAutoSaveTheme({ textColor: val }, 300);
                  }}
                />
                <ColorField
                  label="Accent / Highlights"
                  value={accentColor}
                  onChange={(val) => {
                    setAccentColor(val);
                    updateTheme({ accentColor: val });
                    triggerAutoSaveTheme({ accentColor: val }, 300);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* VIEW 7: HEADER & LAYOUT SUB-VIEW */}
      {activeSection === "header" && (
        <div className="space-y-6">
          <HeaderLayoutCard
            layout={profile?.layout || "classic"}
            onLayoutChange={async (l) => {
              updateProfile({ layout: l });
              try {
                await fetch("/api/profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ layout: l }),
                });
              } catch { }
            }}
            avatarUrl={profile?.avatarUrl}
            onAvatarChange={(url) => updateProfile({ avatarUrl: url })}
            bannerUrl={profile?.bannerUrl}
            onBannerChange={(url) => updateProfile({ bannerUrl: url })}
            title={profile?.displayName || `@${profile?.username || "shahuztech"}`}
            onTitleChange={(val) => updateProfile({ displayName: val })}
          />
        </div>
      )}

      {/* VIEW 8: STICKERS SUB-VIEW */}
      {activeSection === "stickers" && (
        <div className="space-y-6">
          <StickersStudio
            enabled={stickersEnabled}
            onEnabledChange={(val) => {
              setStickersEnabled(val);
              updateTheme({ stickersEnabled: val });
              triggerAutoSaveTheme({ stickersEnabled: val }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickersEnabled: val,
              });
            }}
            stickerId={stickerId}
            onStickerIdChange={(id) => {
              setStickerId(id);
              updateTheme({ stickerId: id });
              triggerAutoSaveTheme({ stickerId: id }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerId: id,
              });
            }}
            stickerUrl={stickerUrl}
            onStickerUrlChange={(url) => {
              setStickerUrl(url);
              updateTheme({ stickerUrl: url });
              triggerAutoSaveTheme({ stickerUrl: url }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerUrl: url,
              });
            }}
            stickerPosition={stickerPosition}
            onPositionChange={(pos) => {
              setStickerPosition(pos);
              updateTheme({ stickerPosition: pos });
              triggerAutoSaveTheme({ stickerPosition: pos }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerPosition: pos,
              });
            }}
            stickerAnimation={stickerAnimation}
            onAnimationChange={(anim) => {
              setStickerAnimation(anim);
              updateTheme({ stickerAnimation: anim });
              triggerAutoSaveTheme({ stickerAnimation: anim }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerAnimation: anim,
              });
            }}
            stickerSize={stickerSize}
            onSizeChange={(sz) => {
              setStickerSize(sz);
              updateTheme({ stickerSize: sz });
              triggerAutoSaveTheme({ stickerSize: sz }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerSize: sz,
              });
            }}
            stickerRotation={stickerRotation}
            onRotationChange={(rot) => {
              setStickerRotation(rot);
              updateTheme({ stickerRotation: rot });
              triggerAutoSaveTheme({ stickerRotation: rot }, 0);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerRotation: rot,
              });
            }}
            stickerLink={stickerLink}
            onLinkChange={(link) => {
              setStickerLink(link);
              updateTheme({ stickerLink: link });
              triggerAutoSaveTheme({ stickerLink: link }, 300);
            }}
            stickerPosX={stickerPosX}
            onPosXChange={(x) => {
              setStickerPosX(x);
              updateTheme({ stickerPosX: x, stickerPosition: "custom" });
              triggerAutoSaveTheme({ stickerPosX: x, stickerPosition: "custom" }, 150);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerPosX: x,
                stickerPosition: "custom",
              });
            }}
            stickerPosY={stickerPosY}
            onPosYChange={(y) => {
              setStickerPosY(y);
              updateTheme({ stickerPosY: y, stickerPosition: "custom" });
              triggerAutoSaveTheme({ stickerPosY: y, stickerPosition: "custom" }, 150);
              pushHistorySnapshot({
                ...getCurrentSnapshot(),
                stickerPosY: y,
                stickerPosition: "custom",
              });
            }}
            creatorAvatar={profile?.avatarUrl}
            creatorName={profile?.displayName || profile?.username}
          />

          {/* Profile Music (Spotify Integration) */}
          <div className="border-t border-border/70 pt-6">
            <h3 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
              Profile Background Music (Optional)
            </h3>
            <SpotifyMusicCard
              enabled={spotifyMusicEnabled}
              onEnabledChange={(val) => {
                setSpotifyMusicEnabled(val);
                updateTheme({ spotifyMusicEnabled: val });
                triggerAutoSaveTheme({ spotifyMusicEnabled: val }, 0);
              }}
              trackUrl={spotifyTrackUrl}
              trackTitle={spotifyTrackTitle}
              trackArtist={spotifyTrackArtist}
              trackImage={spotifyTrackImage}
              trackPreview={spotifyTrackPreview}
              layout={spotifyMusicLayout}
              onLayoutChange={(l) => {
                setSpotifyMusicLayout(l);
                updateTheme({ spotifyMusicLayout: l });
                triggerAutoSaveTheme({ spotifyMusicLayout: l }, 0);
              }}
              onTrackChange={(data) => {
                setSpotifyTrackUrl(data.trackUrl);
                setSpotifyTrackTitle(data.trackTitle);
                setSpotifyTrackArtist(data.trackArtist);
                setSpotifyTrackImage(data.trackImage);
                setSpotifyTrackPreview(data.trackPreview || null);
                updateTheme({
                  spotifyTrackUrl: data.trackUrl,
                  spotifyTrackTitle: data.trackTitle,
                  spotifyTrackArtist: data.trackArtist,
                  spotifyTrackImage: data.trackImage,
                  spotifyTrackPreview: data.trackPreview || null,
                });
                triggerAutoSaveTheme({
                  spotifyTrackUrl: data.trackUrl,
                  spotifyTrackTitle: data.trackTitle,
                  spotifyTrackArtist: data.trackArtist,
                  spotifyTrackImage: data.trackImage,
                  spotifyTrackPreview: data.trackPreview || null,
                }, 0);
              }}
            />
          </div>
        </div>
      )}

      {/* VIEW 9: FOOTER SUB-VIEW */}
      {activeSection === "footer" && (
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="divide-y divide-border/70">
              <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
                <div>
                  <h4 className="text-[13px] font-bold text-foreground">
                    Smooth entrance animations
                  </h4>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    Delicate fade and spring animations when visitors load your profile.
                  </p>
                </div>
                <Switch
                  checked={animationsEnabled}
                  onCheckedChange={(val) => {
                    setAnimationsEnabled(val);
                    updateTheme({ animationsEnabled: val });
                    triggerAutoSaveTheme({ animationsEnabled: val }, 0);
                  }}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[13px] font-bold text-foreground">
                      BioSpace branding footer
                    </h4>
                    {subscriptionTier === "PRO" ? (
                      <Badge variant="pro" className="text-[9px]">
                        PRO ACTIVE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">
                        PRO FEATURE
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">
                    Remove the &ldquo;Join on BioSpace&rdquo; footer tag on your public page.
                  </p>
                </div>
                <Switch
                  checked={showBranding}
                  disabled={subscriptionTier !== "PRO"}
                  onCheckedChange={(val) => {
                    setShowBranding(val);
                    updateTheme({ showBranding: val });
                    triggerAutoSaveTheme({ showBranding: val }, 0);
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
      </div>
    </>
  );
}

"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Upload,
  Link2,
  Trash2,
  Smile,
  Move,
  Check,
  Crosshair,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  CURATED_STICKERS,
  renderStickerById,
} from "@/components/shared/sticker-art";

interface StickersStudioProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  stickerId: string;
  onStickerIdChange: (id: string) => void;
  stickerUrl: string | null;
  onStickerUrlChange: (url: string | null) => void;
  stickerPosition: string;
  onPositionChange: (pos: string) => void;
  stickerAnimation: string;
  onAnimationChange: (anim: string) => void;
  stickerSize: string;
  onSizeChange: (size: string) => void;
  stickerRotation: string;
  onRotationChange: (rot: string) => void;
  stickerLink: string | null;
  onLinkChange: (link: string | null) => void;
  stickerPosX: number;
  onPosXChange: (x: number) => void;
  stickerPosY: number;
  onPosYChange: (y: number) => void;
  creatorAvatar?: string | null;
  creatorName?: string | null;
}

const PRESET_POSITIONS = [
  { id: "custom", label: "🎯 Erkin (Drag & Drop)", desc: "Xohlagan joyingizga sudrab qo'ying", x: null, y: null },
  { id: "top-right", label: "Yuqori O'ng", desc: "Top Right burchak", x: 86, y: 10 },
  { id: "top-left", label: "Yuqori Chap", desc: "Top Left burchak", x: 14, y: 10 },
  { id: "avatar", label: "Avatar Ustida", desc: "Profil rasmi ustida nishon", x: 62, y: 26 },
  { id: "above-links", label: "Havolalar Tepasida", desc: "Havolalar ro'yxatidan oldin", x: 50, y: 40 },
  { id: "bottom-right", label: "Pastki O'ng", desc: "Bottom Right burchak", x: 86, y: 88 },
  { id: "bottom-left", label: "Pastki Chap", desc: "Bottom Left burchak", x: 14, y: 88 },
];

const ANIMATIONS = [
  { id: "float", label: "Gentle Float", desc: "Sokin yuqoriga-pastga suzish" },
  { id: "pulse", label: "Soft Pulse", desc: "Nafas olishdek kattalashib-kichrayish" },
  { id: "wiggle", label: "Playful Wiggle", desc: "O'ynoqi qimirlash" },
  { id: "bounce", label: "Bouncy", desc: "Sakrab turuvchi jonli harakat" },
  { id: "none", label: "Static", desc: "Harakatsiz doimiy turish" },
];

const SIZES = [
  { id: "small", label: "Small", px: 52 },
  { id: "medium", label: "Medium", px: 72 },
  { id: "large", label: "Large", px: 92 },
];

const ROTATIONS = [
  { id: "-12deg", label: "-12°" },
  { id: "-6deg", label: "-6°" },
  { id: "0deg", label: "0°" },
  { id: "6deg", label: "+6°" },
  { id: "12deg", label: "+12°" },
];

export function StickersStudio({
  enabled,
  onEnabledChange,
  stickerId,
  onStickerIdChange,
  stickerUrl,
  onStickerUrlChange,
  stickerPosition,
  onPositionChange,
  stickerAnimation,
  onAnimationChange,
  stickerSize,
  onSizeChange,
  stickerRotation,
  onRotationChange,
  stickerLink,
  onLinkChange,
  stickerPosX = 85,
  onPosXChange,
  stickerPosY = 12,
  onPosYChange,
  creatorAvatar,
  creatorName,
}: StickersStudioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCanvasRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Faqat rasm fayllari (PNG, GIF, WebP) qabul qilinadi");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Stiker yuklanmoqda...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Rasm yuklashda xatolik");
      }

      const json = await res.json();
      onStickerUrlChange(json.url);
      onStickerIdChange("custom");
      if (!enabled) onEnabledChange(true);
      toast.success("Maxsus stiker muvaffaqiyatli yuklandi! ✨", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Yuklashda xatolik", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentPx = SIZES.find((s) => s.id === stickerSize)?.px || 72;

  // Drag and drop coordinate calculation inside interactive canvas
  const updateCoordsFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragCanvasRef.current) return;
      const rect = dragCanvasRef.current.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      // Clamp between 6% and 94% so sticker stays inside phone canvas
      const clampedX = Math.round(Math.max(6, Math.min(94, rawX)));
      const clampedY = Math.round(Math.max(6, Math.min(94, rawY)));

      onPosXChange(clampedX);
      onPosYChange(clampedY);
      onPositionChange("custom");
    },
    [onPosXChange, onPosYChange, onPositionChange]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateCoordsFromEvent(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateCoordsFromEvent(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
      toast.success(`Stiker joylashtirildi: X: ${stickerPosX}% | Y: ${stickerPosY}% 🎯`);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_POSITIONS[0]) => {
    onPositionChange(preset.id);
    if (preset.x !== null && preset.y !== null) {
      onPosXChange(preset.x);
      onPosYChange(preset.y);
      toast.success(`Joylashuv: ${preset.label}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/gif,image/webp,image/jpeg"
        onChange={handleCustomUpload}
        className="hidden"
      />

      <Card className="overflow-hidden p-0">
        {/* Header & Toggle */}
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 sm:px-5 sm:py-4 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-gradient-to-b from-amber-500/15 to-amber-500/[0.04] text-amber-500 dark:text-amber-400">
              <Smile className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 className="font-heading text-sm font-bold tracking-[-0.02em] text-foreground sm:text-base truncate">
                  Stickers & Page Decorations
                </h2>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0">
                  ⚡ PRO
                </span>
              </div>
              <p className="text-[11px] text-text-secondary truncate sm:whitespace-normal">
                Stikerni ushlab oling va ekranning istalgan joyiga sudrab qo&apos;ying (Drag & Drop)!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor="stickers-toggle" className="text-xs font-semibold cursor-pointer hidden sm:inline">
              {enabled ? "Faol" : "O'chiq"}
            </Label>
            <Switch
              id="stickers-toggle"
              checked={enabled}
              onCheckedChange={(val) => {
                onEnabledChange(val);
                toast.success(val ? "Stickers yoqildi! 🎨" : "Stickers o'chirildi");
              }}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* INTERACTIVE DRAG-AND-DROP CANVAS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                  <Move className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Interactive Drag & Drop Canvas</span>
                </Label>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Ushlab suring
                </span>
              </div>

              <span className="font-mono text-xs font-bold text-text-secondary">
                X: {stickerPosX}% • Y: {stickerPosY}%
              </span>
            </div>

            {/* Simulated Phone Screen Canvas where user can drag the sticker */}
            <div
              ref={dragCanvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className={`relative mx-auto h-[320px] w-full max-w-[340px] select-none overflow-hidden rounded-[2.5rem] border-2 border-zinc-700/80 bg-zinc-950 p-4 shadow-2xl transition-all ${
                isDragging ? "cursor-grabbing ring-2 ring-emerald-500" : "cursor-crosshair"
              }`}
              style={{ touchAction: "none" }}
            >
              {/* Phone background subtle creator mockup */}
              <div className="pointer-events-none absolute inset-0 bg-radial from-zinc-900/60 to-black opacity-90" />

              {/* Grid guide lines */}
              <div className="pointer-events-none absolute inset-0 opacity-15">
                <div className="h-full w-full border-t border-b border-dashed border-white/40 my-auto" />
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-white/40" />
              </div>

              {/* Mockup Header items */}
              <div className="pointer-events-none relative z-10 flex flex-col items-center pt-8 text-center opacity-65">
                <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-emerald-500/40 bg-zinc-800 shadow-md">
                  {creatorAvatar ? (
                    <img src={creatorAvatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-500 to-teal-600" />
                  )}
                </div>
                <span className="mt-2 text-xs font-bold text-white">
                  {creatorName || "@username"}
                </span>
                <span className="text-[10px] text-zinc-400">Bio link creator</span>

                {/* Mockup link cards */}
                <div className="mt-4 w-full space-y-2 px-4">
                  <div className="h-7 w-full rounded-xl border border-white/10 bg-white/10 backdrop-blur-xs" />
                  <div className="h-7 w-full rounded-xl border border-white/10 bg-white/10 backdrop-blur-xs" />
                </div>
              </div>

              {/* DRAGGABLE STICKER ON CANVAS */}
              <div
                className={`absolute z-30 transition-transform duration-100 ${
                  isDragging ? "scale-110 cursor-grabbing drop-shadow-2xl" : "cursor-grab hover:scale-105"
                }`}
                style={{
                  left: `${stickerPosX}%`,
                  top: `${stickerPosY}%`,
                  transform: `translate(-50%, -50%) rotate(${stickerRotation})`,
                }}
              >
                {/* Visual Target Handle Ring when dragging */}
                {isDragging && (
                  <span className="absolute -inset-3 animate-ping rounded-full border-2 border-emerald-400 opacity-60" />
                )}

                <div
                  className={`pointer-events-none ${
                    enabled && stickerAnimation === "float"
                      ? "animate-[bounce_2s_infinite]"
                      : enabled && stickerAnimation === "pulse"
                      ? "animate-pulse"
                      : ""
                  }`}
                >
                  {renderStickerById(stickerId, stickerUrl, Math.round(currentPx * 0.75))}
                </div>
              </div>

              {/* Bottom status badge */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 font-mono text-[10px] font-semibold text-emerald-400 backdrop-blur-md border border-white/10">
                Stikerni bosib xohlagan joyga suring 👆
              </div>
            </div>

            {/* DUAL POSITION SLIDERS FOR FINE TUNING */}
            <div className="rounded-2xl border border-border/80 bg-surface/30 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">
                  Aniq koordinatalar bo&apos;yicha sozlash (Sliding Controls)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* X Coordinate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-secondary">Gorizontal joylashuv (X / Chapdan o&apos;ngga)</span>
                    <span className="font-mono font-bold text-foreground">{stickerPosX}%</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={94}
                    value={stickerPosX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onPosXChange(val);
                      onPositionChange("custom");
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Chap (6%)</span>
                    <span>Markaz (50%)</span>
                    <span>O&apos;ng (94%)</span>
                  </div>
                </div>

                {/* Y Coordinate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text-secondary">Vertikal joylashuv (Y / Yuqoridan pastga)</span>
                    <span className="font-mono font-bold text-foreground">{stickerPosY}%</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={94}
                    value={stickerPosY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onPosYChange(val);
                      onPositionChange("custom");
                    }}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-800 accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Yuqori (6%)</span>
                    <span>O&apos;rtada (50%)</span>
                    <span>Past (94%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick 1-Click Snap Position Presets */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Tezkor tayyor joylashuvlar (1-Click Snap)
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PRESET_POSITIONS.map((pos) => {
                  const isSelected =
                    stickerPosition === pos.id ||
                    (pos.x !== null && pos.y !== null && stickerPosX === pos.x && stickerPosY === pos.y);
                  return (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => handleSelectPreset(pos)}
                      className={`rounded-xl border p-2.5 text-left transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                          : "border-border/80 bg-surface/30 text-text-secondary hover:text-foreground hover:bg-surface/60 font-semibold"
                      }`}
                    >
                      <span className="block text-xs text-foreground">{pos.label}</span>
                      <span className="mt-0.5 block text-[10px] text-text-secondary">{pos.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Curated Sticker Library */}
          <div className="space-y-3 border-t border-border/70 pt-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Choose a Sticker
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                isLoading={isUploading}
                className="h-7 gap-1.5 rounded-lg text-xs"
              >
                <Upload className="h-3 w-3" />
                <span>Upload custom</span>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CURATED_STICKERS.map((stk) => {
                const isSelected = !stickerUrl && stickerId === stk.id;
                return (
                  <button
                    key={stk.id}
                    type="button"
                    onClick={() => {
                      onStickerIdChange(stk.id);
                      onStickerUrlChange(null);
                      if (!enabled) onEnabledChange(true);
                      toast.success(`"${stk.name}" stikeri tanlandi!`);
                    }}
                    className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-200 ease-out-soft active:scale-[0.98] ${
                      isSelected
                        ? "border-2 border-emerald-500 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40"
                        : "border-border/80 bg-surface/30 hover:border-border hover:bg-surface/60"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}

                    <div className="flex h-16 w-16 items-center justify-center transition-transform group-hover:scale-110">
                      {stk.render(58)}
                    </div>

                    <span className="mt-2 text-center text-xs font-semibold text-foreground">
                      {stk.name}
                    </span>
                  </button>
                );
              })}

              {/* Custom Uploaded Sticker item if exists */}
              {stickerUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onStickerIdChange("custom");
                    if (!enabled) onEnabledChange(true);
                  }}
                  className={`group relative flex flex-col items-center justify-center rounded-2xl border p-4 transition-all duration-200 ease-out-soft active:scale-[0.98] ${
                    stickerId === "custom"
                      ? "border-2 border-emerald-500 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.22)] ring-1 ring-emerald-400/40"
                      : "border-border/80 bg-surface/30 hover:border-border hover:bg-surface/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStickerUrlChange(null);
                      onStickerIdChange("big_sale");
                      toast.info("Maxsus stiker olib tashlandi");
                    }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    title="Olib tashlash"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <div className="flex h-16 w-16 items-center justify-center transition-transform group-hover:scale-110">
                    <img
                      src={stickerUrl}
                      alt="Custom sticker"
                      className="h-14 w-14 object-contain drop-shadow-md"
                    />
                  </div>

                  <span className="mt-2 text-center text-xs font-semibold text-foreground">
                    Custom Sticker
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Animation & Movement */}
          <div className="space-y-2 border-t border-border/70 pt-5">
            <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Animation & Movement
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {ANIMATIONS.map((anim) => {
                const isSelected = stickerAnimation === anim.id;
                return (
                  <button
                    key={anim.id}
                    type="button"
                    onClick={() => onAnimationChange(anim.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                        : "border-border/80 bg-surface/30 text-text-secondary hover:text-foreground hover:bg-surface/60 font-semibold"
                    }`}
                  >
                    <span className="block text-xs text-foreground">{anim.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size & Slanted Angle */}
          <div className="grid grid-cols-1 gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
            {/* Size */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Sticker Size
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((sz) => {
                  const isSelected = stickerSize === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => onSizeChange(sz.id)}
                      className={`rounded-xl border px-3 py-2 text-center text-xs transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                          : "border-border/80 bg-surface/30 text-text-secondary hover:text-foreground hover:bg-surface/60 font-semibold"
                      }`}
                    >
                      {sz.label} ({sz.px}px)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rotation Angle */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Slanted Angle (Rotation)
              </Label>
              <div className="grid grid-cols-5 gap-1.5">
                {ROTATIONS.map((rot) => {
                  const isSelected = stickerRotation === rot.id;
                  return (
                    <button
                      key={rot.id}
                      type="button"
                      onClick={() => onRotationChange(rot.id)}
                      className={`rounded-xl border py-2 text-center text-xs transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs font-bold"
                          : "border-border/80 bg-surface/30 text-text-secondary hover:text-foreground hover:bg-surface/60 font-semibold"
                      }`}
                    >
                      {rot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Optional Click Action URL */}
          <div className="space-y-2 border-t border-border/70 pt-5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Click Action Link (Optional)
              </Label>
              <span className="text-[10px] text-text-secondary">
                Stiker bosilganda ochiladigan havola
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  value={stickerLink || ""}
                  onChange={(e) => onLinkChange(e.target.value.trim() ? e.target.value : null)}
                  placeholder="https://yourstore.com/deal yoki mahsulot havolasi"
                  className="pl-9 text-xs"
                />
              </div>
              {stickerLink && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onLinkChange(null)}
                  className="text-xs text-text-secondary hover:text-destructive"
                >
                  Tozalash
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

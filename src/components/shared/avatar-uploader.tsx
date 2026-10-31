"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Camera,
  Trash2,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";

interface AvatarUploaderProps {
  currentUrl?: string | null;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
];

export function AvatarUploader({
  currentUrl,
  onUploadSuccess,
  className,
}: AvatarUploaderProps) {
  const { locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(
    currentUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Multilingual labels
  const labels = {
    uploadFromDevice: {
      uz: "Qurilmadan rasm yuklash",
      ru: "Загрузить с устройства",
      en: "Upload from device",
    },
    changePhoto: {
      uz: "Rasmni o'zgartirish",
      ru: "Изменить фото",
      en: "Change photo",
    },
    dragHint: {
      uz: "Rasmni bu yerga sudrab tashlang yoki tanlang (JPG, PNG, WEBP — maks. 5MB)",
      ru: "Перетащите фото сюда или выберите файл (JPG, PNG, WEBP — до 5МБ)",
      en: "Drag & drop your photo or choose file (JPG, PNG, WEBP — max 5MB)",
    },
    presetAvatars: {
      uz: "Tayyor avatarlar",
      ru: "Готовые аватары",
      en: "Preset avatars",
    },
    enterUrl: {
      uz: "Havola (URL) orqali kiritish",
      ru: "Вставить по ссылке",
      en: "Enter image URL",
    },
    uploading: {
      uz: "Yuklanmoqda...",
      ru: "Загрузка...",
      en: "Uploading...",
    },
    remove: {
      uz: "O'chirish",
      ru: "Удалить",
      en: "Remove",
    },
    successToast: {
      uz: "Rasm muvaffaqiyatli yuklandi!",
      ru: "Фото успешно загружено!",
      en: "Image uploaded successfully!",
    },
  };

  const currentLang = (locale === "ru" || locale === "uz") ? locale : "en";

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error(
        currentLang === "uz"
          ? "Faqat rasm fayllari tanlanishi mumkin!"
          : "Please select an image file!"
      );
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        currentLang === "uz"
          ? "Rasm hajmi 5MB dan oshmasligi kerak!"
          : "Image size cannot exceed 5MB!"
      );
      return;
    }

    // Immediate local preview
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    // Send to /api/upload
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setPreviewUrl(data.url);
      onUploadSuccess(data.url);
      toast.success(labels.successToast[currentLang]);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    onUploadSuccess(url);
    toast.success(labels.successToast[currentLang]);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setPreviewUrl(customUrl.trim());
    onUploadSuccess(customUrl.trim());
    setShowUrlInput(false);
    toast.success(labels.successToast[currentLang]);
  };

  return (
    <div className={`space-y-4 ${className || ""}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Main Upload Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col sm:flex-row items-center gap-5 p-4 sm:p-5 rounded-2xl border-2 transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-950/20"
            : "border-dashed border-border bg-surface/50 hover:bg-surface"
        }`}
      >
        {/* Avatar Circular Preview */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group cursor-pointer shrink-0"
          title={labels.changePhoto[currentLang]}
        >
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden ring-4 ring-background shadow-lg border border-border">
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Overlay hover icon */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
            {isUploading ? (
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            ) : (
              <Camera className="h-6 w-6 text-white drop-shadow" />
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-xl font-semibold gap-2 shadow-sm text-xs sm:text-sm h-9"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{labels.uploading[currentLang]}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{labels.uploadFromDevice[currentLang]}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="rounded-xl text-xs h-9 gap-1.5"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>URL</span>
            </Button>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">
            {labels.dragHint[currentLang]}
          </p>
        </div>
      </div>

      {/* Manual URL Input Form if toggled */}
      {showUrlInput && (
        <form onSubmit={handleApplyCustomUrl} className="flex gap-2 animate-in fade-in duration-150">
          <Input
            placeholder="https://example.com/photo.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="rounded-xl text-xs"
          />
          <Button type="submit" size="sm" className="rounded-xl text-xs shrink-0 font-semibold">
            <Check className="h-3.5 w-3.5 mr-1" />
            <span>Saqlash</span>
          </Button>
        </form>
      )}

      {/* Preset Quick Chooser */}
      <div>
        <p className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>{labels.presetAvatars[currentLang]}</span>
        </p>
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {PRESET_AVATARS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`h-11 w-11 rounded-full overflow-hidden shrink-0 border-2 transition-all hover:scale-105 ${
                previewUrl === preset
                  ? "border-emerald-500 ring-2 ring-emerald-500/30"
                  : "border-border hover:border-text-secondary"
              }`}
            >
              <img src={preset} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


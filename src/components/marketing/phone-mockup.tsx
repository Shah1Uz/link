"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Share2, ExternalLink, Sparkles, Wifi, Battery, Signal } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";

interface PhoneMockupProps {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  verified?: boolean;
  theme?: {
    backgroundColor?: string;
    backgroundType?: string;
    backgroundGradient?: string;
    buttonStyle?: string;
    buttonColor?: string;
    buttonTextColor?: string;
    buttonBorderColor?: string;
    buttonRadius?: string;
    textColor?: string;
    accentColor?: string;
    fontHeading?: string;
  };
  links?: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string | null;
    isPinned?: boolean;
    clicksCount?: number;
  }>;
  interactive?: boolean;
}

export function PhoneMockup({
  displayName = "Alex Rivera",
  username = "shahuztech",
  bio = "Tech entrepreneur, YouTuber & full-stack architect building modern web products. 🚀",
  avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  verified = true,
  theme = {
    backgroundColor: "#0d1117",
    backgroundType: "gradient",
    backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
    buttonStyle: "filled",
    buttonColor: "#10b981",
    buttonTextColor: "#042f2e",
    buttonBorderColor: "#34d399",
    buttonRadius: "16px",
    textColor: "#f0fdf4",
    accentColor: "#10b981",
  },
  links = [
    {
      id: "1",
      title: "YouTube Channel (150k+ Subs)",
      url: "https://youtube.com",
      icon: "youtube",
      isPinned: true,
    },
    {
      id: "2",
      title: "GitHub Portfolio & Open Source",
      url: "https://github.com",
      icon: "github",
      isPinned: false,
    },
    {
      id: "3",
      title: "BioSpace — Next-Gen Link-in-Bio",
      url: "https://biospace.com",
      icon: "website",
      isPinned: true,
    },
    {
      id: "4",
      title: "X / Twitter Tech Threads",
      url: "https://x.com",
      icon: "twitter",
      isPinned: false,
    },
    {
      id: "5",
      title: "Telegram VIP Community",
      url: "https://t.me",
      icon: "telegram",
      isPinned: false,
    },
  ],
  interactive = true,
}: PhoneMockupProps) {
  const [clickedLink, setClickedLink] = useState<string | null>(null);

  const backgroundStyle =
    theme.backgroundType === "gradient" && theme.backgroundGradient
      ? { background: theme.backgroundGradient }
      : { backgroundColor: theme.backgroundColor || "#0d1117" };

  return (
    <div className="relative mx-auto w-[310px] sm:w-[340px] select-none">
      {/* Outer Phone Shell */}
      <div className="relative overflow-hidden rounded-[48px] border-[10px] border-zinc-900 bg-zinc-900 shadow-2xl ring-1 ring-zinc-700/50">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute left-1/2 top-3 z-30 h-5 w-24 -translate-x-1/2 rounded-full bg-black flex items-center justify-center">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-900/80 mr-2" />
          <div className="h-2 w-2 rounded-full bg-blue-950/80" />
        </div>

        {/* Screen Area */}
        <div
          className="relative min-h-[640px] px-5 pb-8 pt-10 text-center transition-all duration-300 flex flex-col justify-between"
          style={{
            ...backgroundStyle,
            color: theme.textColor || "#ffffff",
          }}
        >
          {/* Top Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-semibold opacity-70 px-2 mb-4">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col items-center">
            {/* Share action button in profile */}
            <div className="w-full flex justify-end mb-1">
              <div className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-current/80 hover:bg-black/40 cursor-pointer transition-colors">
                <Share2 className="h-4 w-4" />
              </div>
            </div>

            {/* Avatar */}
            <div className="relative mb-3.5 group">
              <div
                className="h-24 w-24 rounded-full p-1 border-2 transition-transform duration-300 group-hover:scale-105"
                style={{ borderColor: theme.accentColor || "#10b981" }}
              >
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full rounded-full object-cover shadow-md"
                />
              </div>
            </div>

            {/* Display Name & Badge */}
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-bold tracking-tight">
                {displayName}
              </h2>
              {verified && (
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color: theme.accentColor || "#38bdf8" }}
                />
              )}
            </div>

            {/* Username */}
            <p className="text-xs opacity-75 font-medium mt-0.5">
              @{username}
            </p>

            {/* Bio */}
            {bio && (
              <p className="mt-2.5 max-w-[260px] text-xs leading-relaxed opacity-90 font-normal">
                {bio}
              </p>
            )}

            {/* Social Icons Quick Row */}
            <div className="flex items-center justify-center gap-3 mt-4 opacity-90">
              <div className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
                <PlatformIcon platform="youtube" size={14} />
              </div>
              <div className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
                <PlatformIcon platform="twitter" size={14} />
              </div>
              <div className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
                <PlatformIcon platform="github" size={14} />
              </div>
              <div className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors">
                <PlatformIcon platform="instagram" size={14} />
              </div>
            </div>
          </div>

          {/* Links Section */}
          <div className="mt-6 flex flex-col gap-2.5 flex-1">
            {links.map((link) => {
              const isClicked = clickedLink === link.id;

              return (
                <div
                  key={link.id}
                  onClick={() => {
                    if (!interactive) return;
                    setClickedLink(link.id);
                    setTimeout(() => setClickedLink(null), 1000);
                  }}
                  className={`relative flex items-center justify-between px-4 py-3.5 text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
                    interactive ? "hover:scale-[1.02] active:scale-[0.98]" : ""
                  }`}
                  style={{
                    backgroundColor: theme.buttonColor || "#10b981",
                    color: theme.buttonTextColor || "#042f2e",
                    borderRadius: theme.buttonRadius || "16px",
                    border: theme.buttonBorderColor
                      ? `1px solid ${theme.buttonBorderColor}`
                      : "none",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    {link.icon && (
                      <div className="shrink-0">
                        <PlatformIcon platform={link.icon} size={16} />
                      </div>
                    )}
                    <span className="truncate">{link.title}</span>
                  </div>

                  <div className="shrink-0 flex items-center opacity-70">
                    {link.isPinned ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 mr-1">
                        Pinned
                      </span>
                    ) : null}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </div>

                  {isClicked && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/70 text-white text-[11px] font-medium backdrop-blur-sm animate-in fade-in">
                      Opening Link...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* BioSpace Branding */}
          <div className="mt-6 pt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium opacity-60">
            <Sparkles className="h-3 w-3" />
            <span>Join {username} on BioSpace</span>
          </div>
        </div>
      </div>
    </div>
  );
}


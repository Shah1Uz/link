"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Instagram,
  Check,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  extractInstagramUsername,
  extractInstagramPostInfo,
  formatUrlForHref,
  getClampedMediaRadius,
  parseInstagramPostsFromLink,
  InstagramMediaItem,
} from "@/lib/utils";
import { withAlpha } from "@/components/profile/theme-surface";

interface InstagramEmbedProps {
  url: string;
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  posts?: InstagramMediaItem[];
  borderRadius?: string;
  themeButtonColor?: string;
  themeTextColor?: string;
  themeBorderColor?: string;
  themeAccentColor?: string;
  themeButtonStyle?: string;
  onPostClick?: (targetUrl: string) => void;
  className?: string;
}

export function InstagramEmbed({
  url,
  title,
  description,
  thumbnail,
  posts,
  borderRadius = "18px",
  themeButtonColor,
  themeTextColor = "#ffffff",
  themeBorderColor,
  themeAccentColor = "#e1306c",
  onPostClick,
  className = "",
}: InstagramEmbedProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [activePostIndex, setActivePostIndex] = useState(0);

  const postInfo = useMemo(() => extractInstagramPostInfo(url), [url]);
  const username = useMemo(() => postInfo.username || extractInstagramUsername(url), [postInfo, url]);
  const formattedUrl = useMemo(() => formatUrlForHref(url, "instagram"), [url]);

  // Aggregate all posts from props or parsed thumbnail/url
  const allPosts = useMemo(() => {
    const list: InstagramMediaItem[] = [];
    const seen = new Set<string>();

    if (posts && posts.length > 0) {
      posts.forEach((p) => {
        if (!seen.has(p.shortcode)) {
          seen.add(p.shortcode);
          list.push(p);
        }
      });
    }

    const parsed = parseInstagramPostsFromLink({ url, title, thumbnail });
    parsed.forEach((p) => {
      if (!seen.has(p.shortcode)) {
        seen.add(p.shortcode);
        list.push(p);
      }
    });

    return list;
  }, [posts, url, title, thumbnail]);

  const activePost = allPosts[activePostIndex] || allPosts[0] || null;

  const clampedOuterRadius = getClampedMediaRadius(borderRadius, 22);

  const handleCardClick = (targetUrl: string) => {
    if (onPostClick) {
      onPostClick(targetUrl);
    } else {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const cardBg = themeButtonColor
    ? withAlpha(themeButtonColor, 0.94)
    : "rgba(18, 18, 22, 0.94)";

  const cardBorder = themeBorderColor
    ? themeBorderColor
    : "rgba(255, 255, 255, 0.12)";

  // Official Instagram embed iframe URL for the active post
  const activeEmbedIframeUrl = activePost?.shortcode
    ? `https://www.instagram.com/p/${activePost.shortcode}/embed/captioned/`
    : postInfo.shortcode
    ? `https://www.instagram.com/p/${postInfo.shortcode}/embed/captioned/`
    : null;

  // Dynamically load Instagram's official embed.js
  useEffect(() => {
    if (typeof window !== "undefined" && activeEmbedIframeUrl) {
      if ((window as any).instgrm) {
        try {
          (window as any).instgrm.Embeds.process();
        } catch {
          // ignore
        }
      } else {
        const existingScript = document.getElementById("instagram-embed-script");
        if (!existingScript) {
          const script = document.createElement("script");
          script.id = "instagram-embed-script";
          script.src = "//www.instagram.com/embed.js";
          script.async = true;
          script.onload = () => {
            try {
              (window as any).instgrm?.Embeds?.process();
            } catch {
              // ignore
            }
          };
          document.body.appendChild(script);
        }
      }
    }
  }, [activeEmbedIframeUrl]);

  // Safety timeout: ensure iframeLoaded is set within 2s so no spinner blocks the UI
  useEffect(() => {
    setIframeLoaded(false);
    const timer = setTimeout(() => {
      setIframeLoaded(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [activeEmbedIframeUrl]);

  return (
    <div
      className={`group/insta relative w-full overflow-hidden border backdrop-blur-xl transition-all duration-300 shadow-lg hover:shadow-2xl ${className}`}
      style={{
        borderRadius: clampedOuterRadius,
        backgroundColor: cardBg,
        borderColor: cardBorder,
        color: themeTextColor,
        fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Top Instagram Brand Gradient Hairline */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
        }}
      />

      {/* CASE 1: REAL POSTS AVAILABLE (Embed official Instagram post/reel player) */}
      {allPosts.length > 0 && activeEmbedIframeUrl ? (
        <div className="flex flex-col">
          {/* Header bar: Creator info + Follow button */}
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <a
                href={formattedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCardClick(formattedUrl)}
                className="group/avatar relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-[2px] shadow-sm transition-transform hover:scale-105"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)",
                }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-white">
                  <Instagram className="h-4 w-4 text-[#e1306c]" />
                </div>
              </a>

              <div className="min-w-0">
                <a
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCardClick(formattedUrl)}
                  className="flex items-center gap-1.5 truncate text-[13px] font-bold tracking-tight hover:underline"
                  style={{ color: themeTextColor }}
                >
                  <span className="truncate">@{username}</span>
                  <span
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0095f6] text-[8px] text-white"
                    title="Verified"
                  >
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </a>
                <p className="truncate text-[10px] font-medium opacity-70">
                  {allPosts.length > 1
                    ? `${allPosts.length} ta post & reel`
                    : activePost?.title || "Instagram Post"}
                </p>
              </div>
            </div>

            {/* Quick Follow Action */}
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(formattedUrl)}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)",
              }}
            >
              <Instagram className="h-3 w-3" />
              <span>Follow</span>
            </a>
          </div>

          {/* Multiple posts switcher pills */}
          {allPosts.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-white/10 px-4 py-2 [scrollbar-width:none]">
              {allPosts.map((post, idx) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => {
                    setActivePostIndex(idx);
                  }}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-200 ${
                    activePostIndex === idx
                      ? "bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-sm"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  <Instagram className="h-3 w-3" />
                  <span>{post.title || `Post #${idx + 1}`}</span>
                </button>
              ))}
            </div>
          )}

          {/* Direct Post Open Action Subheader */}
          <div className="flex items-center justify-between border-b border-white/10 bg-black/25 px-4 py-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/90">
              <Instagram className="h-3.5 w-3.5 text-[#e1306c]" />
              <span>{activePost?.title || "Instagram Post"}</span>
            </span>
            <a
              href={`https://www.instagram.com/p/${activePost.shortcode}/`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(`https://www.instagram.com/p/${activePost.shortcode}/`)}
              className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/90 transition-colors hover:bg-white/20"
            >
              <span>Instagramda ochish</span>
            </a>
          </div>

          {/* Description caption if provided */}
          {description && (
            <div className="px-4 pt-3 text-xs leading-relaxed opacity-85">
              {description}
            </div>
          )}

          {/* Real Instagram Post / Reel Iframe Embed (Never hidden behind a blocking loader!) */}
          <div className="relative w-full overflow-hidden bg-zinc-950/60 p-2 sm:p-3">
            <iframe
              key={activeEmbedIframeUrl}
              src={activeEmbedIframeUrl}
              className="w-full min-h-[460px] sm:min-h-[520px] rounded-xl border-0 bg-transparent"
              scrolling="no"
              allow="encrypted-media; clipboard-write"
              title={activePost?.title || title || `@${username} Instagram Post`}
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </div>
      ) : (
        /* CASE 2: PROFILE CARD WITH POSTS GALLERY */
        <div className="flex flex-col items-center px-5 py-6 text-center">
          {/* Story Ring Avatar */}
          <a
            href={formattedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleCardClick(formattedUrl)}
            className="group/ring relative mb-3.5 flex h-20 w-20 items-center justify-center rounded-full p-[2.5px] shadow-lg transition-transform duration-300 hover:scale-105"
            style={{
              background:
                "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
            }}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950 text-white shadow-inner">
              <Instagram className="h-9 w-9 text-[#e1306c]" />
            </div>
          </a>

          <div className="flex items-center justify-center gap-1.5 text-base font-extrabold tracking-tight sm:text-lg">
            <span>@{username}</span>
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0095f6] text-[9px] text-white"
              title="Verified"
            >
              <Check className="h-2.5 w-2.5 stroke-[3]" />
            </span>
          </div>

          <p className="mt-1 text-xs font-medium opacity-80">
            {description || title || "Official Instagram profile"}
          </p>

          {/* Follow button */}
          <div className="mt-4 w-full max-w-xs">
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleCardClick(formattedUrl)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{
                background:
                  "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)",
              }}
            >
              <Instagram className="h-4 w-4" />
              <span>Follow on Instagram</span>
            </a>
          </div>

          {/* Recent Posts Grid Preview */}
          <div className="mt-5 w-full border-t border-white/10 pt-4 text-left">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider opacity-75">
                <Layers className="h-3 w-3 text-[#e1306c]" />
                <span>So&apos;nggi postlar</span>
              </span>
              <a
                href={formattedUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleCardClick(formattedUrl)}
                className="text-[10px] font-semibold text-[#f09433] hover:underline"
              >
                Barchasini ko&apos;rish →
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((num) => (
                <a
                  key={num}
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCardClick(formattedUrl)}
                  className="group/tile relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 p-2 shadow-xs transition-transform duration-200 hover:scale-105 hover:border-pink-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-transparent opacity-60 transition-opacity group-hover/tile:opacity-100" />
                  <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 text-center">
                    <Instagram className="h-5 w-5 text-white/70 transition-colors group-hover/tile:text-white" />
                    <span className="text-[9px] font-bold opacity-80">Post #{num}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <a
        href={formattedUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => handleCardClick(formattedUrl)}
        className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] font-semibold opacity-75 transition-opacity hover:opacity-100"
      >
        <span className="flex items-center gap-1.5">
          <Instagram className="h-3.5 w-3.5 text-[#e1306c]" />
          <span>View on Instagram</span>
        </span>
        <span className="flex items-center gap-1 text-[10px]">
          <span>@{username}</span>
        </span>
      </a>
    </div>
  );
}

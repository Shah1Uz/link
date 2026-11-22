"use client";

import React, { useEffect } from "react";

interface DynamicFontLoaderProps {
  font?: string | null;
}

/**
 * Dynamically and reliably loads Google Fonts into document <head>
 * both on server render and in real time when creator selects a font.
 */
export function DynamicFontLoader({ font }: DynamicFontLoaderProps) {
  useEffect(() => {
    if (!font || typeof window === "undefined") return;

    const cleanFont = font.trim();
    if (!cleanFont) return;

    // Common system fonts already bundled locally
    if (cleanFont === "Inter" || cleanFont === "Plus Jakarta Sans") return;

    const id = `font-link-${cleanFont.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont).replace(/%20/g, "+")}&display=swap`;
    document.head.appendChild(link);
  }, [font]);

  if (!font) return null;
  const cleanFont = font.trim();
  if (cleanFont === "Inter" || cleanFont === "Plus Jakarta Sans") return null;

  return (
    <link
      rel="stylesheet"
      href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont).replace(/%20/g, "+")}&display=swap`}
    />
  );
}

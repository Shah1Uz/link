"use client";

import React from "react";

export interface StickerDefinition {
  id: string;
  name: string;
  category: "sale" | "social" | "aesthetic";
  render: (size: number) => React.ReactNode;
}

export const CURATED_STICKERS: StickerDefinition[] = [
  {
    id: "big_sale",
    name: "Big Sale Peach",
    category: "sale",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Peach Body */}
        <defs>
          <linearGradient id="peachGrad" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffb066" />
            <stop offset="35%" stopColor="#ff7b39" />
            <stop offset="70%" stopColor="#f95721" />
            <stop offset="100%" stopColor="#d9381e" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="40" y1="10" x2="60" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a3e635" />
            <stop offset="100%" stopColor="#4d7c0f" />
          </linearGradient>
          <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3" floodColor="#f95721" />
          </filter>
        </defs>

        {/* Stem & Leaves */}
        <path
          d="M 50 24 C 47 18 43 14 36 12 C 34 20 38 25 46 25 Z"
          fill="url(#leafGrad)"
          stroke="#365314"
          strokeWidth="1.5"
        />
        <path
          d="M 52 24 C 57 16 64 12 70 14 C 71 21 66 26 55 26 Z"
          fill="url(#leafGrad)"
          stroke="#365314"
          strokeWidth="1.5"
        />
        <path d="M 50 26 C 50 18 51 14 53 10" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

        {/* Peach fruit shape */}
        <path
          d="M 50 28 C 30 26 15 42 16 63 C 17 82 36 92 49 93 C 51 93 51 93 53 93 C 66 92 85 82 86 63 C 87 42 72 26 50 28 Z"
          fill="url(#peachGrad)"
          stroke="#ffffff"
          strokeWidth="2.5"
          filter="url(#softGlow)"
        />

        {/* Peach highlight shine */}
        <path
          d="M 27 42 C 22 50 22 62 25 70"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeOpacity="0.65"
        />

        {/* Sparkles */}
        <path d="M 84 26 L 86 21 L 91 19 L 86 17 L 84 12 L 82 17 L 77 19 L 82 21 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
        <path d="M 16 38 L 17 34 L 21 33 L 17 32 L 16 28 L 15 32 L 11 33 L 15 34 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />

        {/* Bold Text "BIG SALE" */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill="#1c1917"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="14"
          letterSpacing="-0.5"
        >
          BIG
        </text>
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fill="#1c1917"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="18"
          letterSpacing="-0.5"
        >
          SALE
        </text>
      </svg>
    ),
  },
  {
    id: "sale_50",
    name: "50% OFF Starburst",
    category: "sale",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="starburstGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        {/* 16-point starburst */}
        <path
          d="M 50 5 L 61 21 L 80 14 L 80 34 L 97 43 L 88 60 L 97 75 L 78 81 L 73 100 L 54 89 L 40 99 L 33 80 L 14 83 L 18 64 L 3 53 L 17 39 L 10 20 L 30 22 L 39 4 Z"
          fill="url(#starburstGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <text
          x="50"
          y="49"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="20"
          letterSpacing="-0.5"
        >
          50%
        </text>
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fill="#fef08a"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="0.5"
        >
          OFF
        </text>
      </svg>
    ),
  },
  {
    id: "new_drop",
    name: "New Drop Neon",
    category: "sale",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="neonDrop" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect x="8" y="24" width="84" height="52" rx="26" fill="url(#neonDrop)" stroke="#ffffff" strokeWidth="3" />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="14"
          letterSpacing="0.5"
        >
          NEW
        </text>
        <text
          x="50"
          y="66"
          textAnchor="middle"
          fill="#fef08a"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="16"
          letterSpacing="1"
        >
          DROP ⚡
        </text>
      </svg>
    ),
  },
  {
    id: "tap_here",
    name: "Tap Here Badge",
    category: "social",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="limeGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bef264" />
            <stop offset="100%" stopColor="#84cc16" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="42" fill="url(#limeGrad)" stroke="#1a2e05" strokeWidth="3.5" />
        <circle cx="50" cy="50" r="36" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 3" />
        <text
          x="50"
          y="44"
          textAnchor="middle"
          fill="#14532d"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="13"
          letterSpacing="0.5"
        >
          TAP
        </text>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fill="#14532d"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="0.5"
        >
          HERE 👉
        </text>
      </svg>
    ),
  },
  {
    id: "top_creator",
    name: "Verified Star",
    category: "social",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="goldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
        <polygon
          points="50,6 63,33 93,38 72,59 77,89 50,75 23,89 28,59 7,38 37,33"
          fill="url(#goldGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <text
          x="50"
          y="56"
          textAnchor="middle"
          fill="#422006"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="11"
        >
          TOP
        </text>
        <text
          x="50"
          y="69"
          textAnchor="middle"
          fill="#422006"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="10"
        >
          CREATOR
        </text>
      </svg>
    ),
  },
  {
    id: "hot_fire",
    name: "Hot Flame",
    category: "aesthetic",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="fireGrad" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
        </defs>
        <path
          d="M 50 8 C 55 24 72 32 72 50 C 72 73 57 88 50 92 C 43 88 28 73 28 50 C 28 35 38 28 44 20 C 45 32 52 38 52 38 C 52 38 58 26 50 8 Z"
          fill="url(#fireGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <path
          d="M 50 48 C 53 58 60 62 60 72 C 60 82 53 87 50 89 C 47 87 40 82 40 72 C 40 64 45 61 48 56 C 49 61 52 64 52 64 C 52 64 54 58 50 48 Z"
          fill="#fef08a"
        />
      </svg>
    ),
  },
  {
    id: "good_vibes",
    name: "Good Vibes Heart",
    category: "aesthetic",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="heartGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <path
          d="M 50 86 C 47 84 12 58 12 34 C 12 18 25 10 37 10 C 44 10 50 14 50 18 C 50 14 56 10 63 10 C 75 10 88 18 88 34 C 88 58 53 84 50 86 Z"
          fill="url(#heartGrad)"
          stroke="#ffffff"
          strokeWidth="3.5"
        />
        <text
          x="50"
          y="42"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="12"
          letterSpacing="0.5"
        >
          GOOD
        </text>
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="#fef08a"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="14"
          letterSpacing="0.5"
        >
          VIBES ✌️
        </text>
      </svg>
    ),
  },
  {
    id: "sparkles",
    name: "Magic Sparkles",
    category: "aesthetic",
    render: (size: number) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="sparkleGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>
        <path
          d="M 50 10 L 56 36 L 82 42 L 56 48 L 50 74 L 44 48 L 18 42 L 44 36 Z"
          fill="url(#sparkleGrad)"
          stroke="#ffffff"
          strokeWidth="3"
        />
        <path
          d="M 78 58 L 81 70 L 93 73 L 81 76 L 78 88 L 75 76 L 63 73 L 75 70 Z"
          fill="#38bdf8"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <path
          d="M 24 64 L 26 72 L 34 74 L 26 76 L 24 84 L 22 76 L 14 74 L 22 72 Z"
          fill="#ec4899"
          stroke="#ffffff"
          strokeWidth="2"
        />
      </svg>
    ),
  },
];

export function renderStickerById(
  id: string | null | undefined,
  customUrl: string | null | undefined,
  size: number = 72
) {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt="Custom Sticker"
        className="object-contain drop-shadow-lg select-none pointer-events-none"
        style={{ width: size, height: size }}
      />
    );
  }
  const match = CURATED_STICKERS.find((s) => s.id === id) || CURATED_STICKERS[0];
  return match.render(size);
}

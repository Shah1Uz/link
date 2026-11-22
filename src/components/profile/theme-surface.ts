import type { CSSProperties } from "react";
import { getFontFamilyCss } from "@/lib/fonts-catalog";

/**
 * Theme-aware surface resolver for the public creator page.
 *
 * The public profile is rendered on top of the creator's own theme (arbitrary
 * background color / gradient, text color, accent, button colors and radius).
 * Platform "chrome" (newsletter, booking, store, legal footer) must stay legible
 * on top of any of those values without overriding the creator's palette.
 *
 * This module only *derives* supporting values (glass surfaces, hairlines,
 * muted text, accent contrast) from the theme — it never replaces theme values.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

const DEFAULT_DARK_BASE = "#0d1117";
const DEFAULT_LIGHT_BASE = "#f7f6f2";
const DEFAULT_ACCENT = "#10b981";
const DEFAULT_DARK_TEXT = "#ffffff";
const DEFAULT_LIGHT_TEXT = "#0f172a";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Parse `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()` values. */
export function parseColor(input?: string | null): RGBA | null {
  if (!input || typeof input !== "string") return null;
  const value = input.trim().toLowerCase();

  const hexMatch = value.match(/^#([0-9a-f]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (hex.length !== 6 && hex.length !== 8) return null;
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+))?\s*\)$/
  );
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
      a: rgbMatch[4] !== undefined ? Number(rgbMatch[4]) : 1,
    };
  }

  return null;
}

/** Relative luminance (0 = black, 1 = white) — WCAG formula. */
export function relativeLuminance(input?: string | null): number | null {
  const rgba = parseColor(input);
  if (!rgba) return null;
  const channels = [rgba.r, rgba.g, rgba.b].map((channel) => {
    const s = clamp01(channel / 255);
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** Add alpha to a hex/rgb() color. Unknown formats are returned untouched. */
export function withAlpha(color: string | null | undefined, alpha: number): string {
  if (!color) return `rgba(255, 255, 255, ${clamp01(alpha)})`;
  const rgba = parseColor(color);
  if (!rgba) return color;
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${clamp01(alpha)})`;
}

/** Mix a color toward black (`amount < 0`) or white (`amount > 0`). */
export function shadeColor(color: string | null | undefined, amount: number): string {
  const rgba = parseColor(color);
  if (!rgba) return color || DEFAULT_ACCENT;
  const target = amount < 0 ? 0 : 255;
  const t = clamp01(Math.abs(amount));
  const mix = (channel: number) => Math.round(channel + (target - channel) * t);
  return `rgb(${mix(rgba.r)}, ${mix(rgba.g)}, ${mix(rgba.b)})`;
}

/** Readable text color for a given accent/button background. */
export function contrastText(
  color?: string | null,
  dark = "#0b1220",
  light = "#ffffff"
): string {
  const luminance = relativeLuminance(color);
  if (luminance === null) return light;
  // ~0.3 is the practical crossover where dark ink starts to read better.
  return luminance > 0.3 ? dark : light;
}

function extractColors(value?: string | null): string[] {
  if (!value || typeof value !== "string") return [];
  const matches: string[] = [];
  const re = /(#[0-9a-fA-F]{3,8})|(rgba?\([^)]*\))/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(value)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

/** True when the creator's page background reads as a light surface. */
export function themeBackgroundIsLight(theme?: any): boolean {
  if (!theme) return false;

  if (theme.backgroundType === "gradient" && typeof theme.backgroundGradient === "string") {
    const luminances = extractColors(theme.backgroundGradient)
      .map((color) => relativeLuminance(color))
      .filter((lum): lum is number => lum !== null);
    if (luminances.length > 0) {
      const avg = luminances.reduce((sum, lum) => sum + lum, 0) / luminances.length;
      return avg > 0.5;
    }
  }

  const background = relativeLuminance(theme.backgroundColor);
  if (background !== null) return background > 0.5;

  return false;
}

export interface ThemeSurface {
  /** Creator background reads light (used for light/dark compensation). */
  isLight: boolean;
  /** Creator text color (falls back to a sensible default). */
  text: string;
  /** Secondary text. */
  muted: string;
  /** Tertiary text / disabled. */
  subtle: string;
  /** Very soft text-tinted fill (tiles, chips). */
  faint: string;
  /** Hover fill for tinted controls. */
  hover: string;
  /** Glass panel background. */
  surface: string;
  surfaceHover: string;
  /** More opaque panel background (inputs, inner cards). */
  surfaceStrong: string;
  border: string;
  borderStrong: string;
  /** Solid creator base background (for contrast text on accent). */
  base: string;
  /** Creator accent color. */
  accent: string;
  /** Accent adjusted to stay readable as *text* on the creator background. */
  accentInk: string;
  /** Readable text color on top of the accent. */
  accentText: string;
  accentSoft: string;
  accentBorder: string;
  /** Soft accent glow shadow. */
  glow: string;
  /** Creator button radius (fallback 16px). */
  radius: string;
  /** Creator heading/body font. */
  font: string;
  bodyFont: string;
  /** CSS custom properties exposed for theme-aware utility classes. */
  vars: CSSProperties;
}

export function resolveThemeSurface(theme?: any): ThemeSurface {
  const isLight = themeBackgroundIsLight(theme);
  const base = theme?.backgroundColor || (isLight ? DEFAULT_LIGHT_BASE : DEFAULT_DARK_BASE);
  const text = theme?.textColor || (isLight ? DEFAULT_LIGHT_TEXT : DEFAULT_DARK_TEXT);
  const accent = theme?.accentColor || DEFAULT_ACCENT;
  const accentLuminance = relativeLuminance(accent) ?? 0.4;

  const accentInk = isLight
    ? shadeColor(accent, -0.3)
    : accentLuminance < 0.3
    ? shadeColor(accent, 0.4)
    : accent;

  const accentText = contrastText(accent, "#0b1220", "#ffffff");
  const accentSoft = withAlpha(accent, isLight ? 0.12 : 0.18);
  const accentBorder = withAlpha(accent, isLight ? 0.34 : 0.46);

  const surface = isLight ? "rgba(255, 255, 255, 0.72)" : "rgba(255, 255, 255, 0.055)";
  const surfaceHover = isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.095)";
  const surfaceStrong = isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(6, 8, 12, 0.42)";
  const border = isLight ? "rgba(9, 11, 17, 0.1)" : "rgba(255, 255, 255, 0.13)";
  const borderStrong = isLight ? "rgba(9, 11, 17, 0.18)" : "rgba(255, 255, 255, 0.24)";

  const vars = {
    "--ts-text": text,
    "--ts-muted": withAlpha(text, 0.68),
    "--ts-subtle": withAlpha(text, 0.5),
    "--ts-faint": withAlpha(text, isLight ? 0.05 : 0.09),
    "--ts-hover": withAlpha(text, isLight ? 0.09 : 0.15),
    "--ts-surface": surface,
    "--ts-surface-hover": surfaceHover,
    "--ts-surface-strong": surfaceStrong,
    "--ts-border": border,
    "--ts-border-strong": borderStrong,
    "--ts-accent": accent,
    "--ts-accent-ink": accentInk,
    "--ts-accent-text": accentText,
    "--ts-accent-soft": accentSoft,
    "--ts-accent-border": accentBorder,
  } as CSSProperties;

  return {
    isLight,
    text,
    muted: withAlpha(text, 0.68),
    subtle: withAlpha(text, 0.5),
    faint: withAlpha(text, isLight ? 0.05 : 0.09),
    hover: withAlpha(text, isLight ? 0.09 : 0.15),
    surface,
    surfaceHover,
    surfaceStrong,
    border,
    borderStrong,
    base,
    accent,
    accentInk,
    accentText,
    accentSoft,
    accentBorder,
    glow: `0 22px 48px -26px ${withAlpha(accent, 0.85)}`,
    radius: theme?.buttonRadius || "16px",
    font: getFontFamilyCss(theme?.fontHeading),
    bodyFont: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    vars,
  };
}

/**
 * Inline style for creator-styled link buttons: all colors/radius come straight
 * from the theme, plus a subtle theme-tinted shadow and focus ring.
 */
export function themeButtonStyle(theme?: any): CSSProperties {
  const background = theme?.buttonColor || DEFAULT_ACCENT;
  const foreground = theme?.buttonTextColor || "#042f2e";
  return {
    backgroundColor: background,
    color: foreground,
    borderRadius: theme?.buttonRadius || "16px",
    border: `1px solid ${theme?.buttonBorderColor || "transparent"}`,
    boxShadow: `0 10px 26px -18px ${withAlpha(background, 0.9)}`,
    "--tw-ring-color": withAlpha(foreground, 0.45),
    fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  } as CSSProperties;
}

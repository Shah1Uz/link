import { z } from "zod";
import { isValidSecureUrl } from "./utils";

export const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "dashboard",
  "settings",
  "pricing",
  "features",
  "templates",
  "sign-in",
  "sign-up",
  "onboarding",
  "about",
  "contact",
  "faq",
  "privacy",
  "terms",
  "marketplace",
  "support",
  "audience",
  "store",
  "qr",
  "qr-code",
  "reports",
  "audit-logs",
  "login",
  "logout",
  "register",
  "billing",
  "help",
  "status",
  "webhook",
  "webhooks",
  "auth",
  "user",
  "users",
  "team",
  "teams",
];

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes((username || "").trim().toLowerCase());
}

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be under 30 characters")
  .regex(usernameRegex, "Only letters, numbers, underscores, and hyphens are allowed")
  .refine((val) => !isReservedUsername(val), {
    message: "This username is reserved by the platform",
  });

export const profileUpdateSchema = z.object({
  displayName: z.string().max(60, "Display name cannot exceed 60 characters").nullable().optional(),
  username: usernameSchema.optional(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters").nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  category: z.enum([
    "CREATOR",
    "INFLUENCER",
    "BUSINESS",
    "DEVELOPER",
    "ARTIST",
    "PHOTOGRAPHER",
    "BLOGGER",
    "OTHER",
  ]).optional(),
  layout: z.enum([
    "classic",
    "hero",
    "banner",
    "cutout",
    "shape",
    "minimal",
    "gradient",
    "modern",
    "glass",
    "creator",
  ]).optional(),
  isPublished: z.boolean().optional(),
  verified: z.boolean().optional(),
  storeEnabled: z.boolean().optional(),
});

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z.string().trim().email("Enter a valid email"),
  subject: z.string().trim().min(3, "Subject is too short").max(140),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(4000),
});

export const notificationPrefsSchema = z.object({
  notifyClickMilestones: z.boolean().optional(),
  notifyWeeklyDigest: z.boolean().optional(),
  notifyProductNews: z.boolean().optional(),
});

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  url: z
    .string()
    .min(1, "URL is required")
    .refine((val) => isValidSecureUrl(val), {
      message: "Please enter a valid, safe URL (http, https, mailto, or tel)",
    }),
  description: z.string().max(200, "Description cannot exceed 200 characters").nullable().optional(),
  icon: z.string().nullable().optional(),
  thumbnail: z.string().nullable().optional(),
  displayMode: z.enum(["link", "embed"]).default("link").nullable().optional(),
  collectionId: z.string().nullable().optional(),
  isEnabled: z.boolean().default(true),
  isPinned: z.boolean().default(false),
  position: z.number().int().default(0),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
});

export const collectionSchema = z.object({
  title: z.string().min(1, "Collection title is required").max(60, "Title cannot exceed 60 characters"),
  description: z.string().max(160, "Description cannot exceed 160 characters").nullable().optional(),
  position: z.number().int().default(0),
  isCollapsed: z.boolean().default(false),
});

export const themeSchema = z.object({
  backgroundColor: z.string().default("#0f172a"),
  backgroundType: z.enum(["color", "gradient", "image", "pattern", "video", "blur"]).default("color"),
  backgroundGradient: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
  backgroundVideo: z.string().nullable().optional(),
  buttonStyle: z.enum(["rounded", "square", "pill", "outlined", "filled", "shadow", "glass", "neon"]).default("rounded"),
  buttonColor: z.string().default("#ffffff"),
  buttonTextColor: z.string().default("#0f172a"),
  buttonBorderColor: z.string().nullable().optional(),
  buttonRadius: z.string().default("16px"),
  fontHeading: z.string().default("Inter"),
  fontBody: z.string().default("Inter"),
  textColor: z.string().default("#ffffff"),
  accentColor: z.string().default("#22c55e"),
  animationsEnabled: z.boolean().default(true),
  showBranding: z.boolean().default(true),
  spotifyMusicEnabled: z.boolean().default(false).optional(),
  spotifyTrackUrl: z.string().nullable().optional(),
  spotifyTrackTitle: z.string().nullable().optional(),
  spotifyTrackArtist: z.string().nullable().optional(),
  spotifyTrackImage: z.string().nullable().optional(),
  spotifyTrackPreview: z.string().nullable().optional(),
  spotifyMusicLayout: z.enum(["floating", "card"]).default("floating").optional(),
  spotifyMusicAutoplay: z.boolean().default(false).optional(),
  heroBlur: z.string().nullable().optional(),
  heroFade: z.string().nullable().optional(),
  heroDarken: z.string().nullable().optional(),
  stickersEnabled: z.boolean().default(false).optional(),
  stickerId: z.string().nullable().optional(),
  stickerUrl: z.string().nullable().optional(),
  stickerText: z.string().nullable().optional(),
  stickerPosition: z.string().default("top-right").optional(),
  stickerAnimation: z.string().default("float").optional(),
  stickerSize: z.string().default("medium").optional(),
  stickerRotation: z.string().default("-6deg").optional(),
  stickerLink: z.string().nullable().optional(),
  stickerPosX: z.number().nullable().optional(),
  stickerPosY: z.number().nullable().optional(),
  wallpaperEffect: z.string().nullable().optional(),
  wallpaperTint: z.number().nullable().optional(),
  wallpaperNoise: z.boolean().nullable().optional(),
  gradientStyle: z.string().nullable().optional(),
  gradientColor: z.string().nullable().optional(),
  gradientDirection: z.string().nullable().optional(),
});

export const reportSchema = z.object({
  profileId: z.string().nullable().optional(),
  linkId: z.string().nullable().optional(),
  reporterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  reason: z.string().min(3, "Reason is required"),
  details: z.string().max(500, "Details cannot exceed 500 characters").nullable().optional(),
});


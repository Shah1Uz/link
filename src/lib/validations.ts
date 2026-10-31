import { z } from "zod";
import { isValidSecureUrl } from "./utils";

export const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be under 30 characters")
  .regex(usernameRegex, "Only letters, numbers, underscores, and hyphens are allowed");

export const profileUpdateSchema = z.object({
  displayName: z.string().max(60, "Display name cannot exceed 60 characters").optional(),
  username: usernameSchema.optional(),
  bio: z.string().max(250, "Bio cannot exceed 250 characters").optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
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
});

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
  url: z
    .string()
    .min(1, "URL is required")
    .refine((val) => isValidSecureUrl(val), {
      message: "Please enter a valid, safe URL (http, https, mailto, or tel)",
    }),
  description: z.string().max(200, "Description cannot exceed 200 characters").optional(),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  collectionId: z.string().nullable().optional(),
  isEnabled: z.boolean().default(true),
  isPinned: z.boolean().default(false),
  position: z.number().int().default(0),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
});

export const collectionSchema = z.object({
  title: z.string().min(1, "Collection title is required").max(60, "Title cannot exceed 60 characters"),
  description: z.string().max(160, "Description cannot exceed 160 characters").optional(),
  position: z.number().int().default(0),
  isCollapsed: z.boolean().default(false),
});

export const themeSchema = z.object({
  backgroundColor: z.string().default("#0f172a"),
  backgroundType: z.enum(["color", "gradient", "image", "pattern"]).default("color"),
  backgroundGradient: z.string().nullable().optional(),
  backgroundImage: z.string().nullable().optional(),
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
});

export const reportSchema = z.object({
  profileId: z.string().optional(),
  linkId: z.string().optional(),
  reporterEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  reason: z.string().min(3, "Reason is required"),
  details: z.string().max(500, "Details cannot exceed 500 characters").optional(),
});


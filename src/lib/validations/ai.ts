import { z } from "zod";

export const AIToneEnum = z.enum([
  "professional",
  "playful",
  "bold",
  "minimalist",
  "poetic",
  "energetic",
  "tech_leader",
  "casual",
]);

export const AILanguageEnum = z.enum([
  "en",
  "uz",
  "ru",
  "es",
  "fr",
  "de",
  "tr",
  "pt",
]);

export const AIGenerationTypeEnum = z.enum([
  "BIO",
  "HEADLINE",
  "DESCRIPTION",
  "LINK_TITLE",
  "CONTENT_IMPROVE",
  "THEME_RECOMMEND",
  "PROFILE_OPTIMIZE",
  "CTA",
]);

// 1. Bio Generator Schema
export const bioGeneratorSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  profession: z.string().min(1, "Profession is required").max(100),
  category: z.string().default("CREATOR"),
  interests: z.string().max(300).optional().default(""),
  targetAudience: z.string().max(200).optional().default(""),
  tone: AIToneEnum.default("professional"),
  language: AILanguageEnum.default("en"),
  count: z.number().int().min(1).max(5).default(3),
});

// 2. Headline Generator Schema
export const headlineGeneratorSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  profession: z.string().min(1, "Profession is required").max(100),
  category: z.string().default("CREATOR"),
  tone: AIToneEnum.default("bold"),
  language: AILanguageEnum.default("en"),
  count: z.number().int().min(1).max(5).default(4),
});

// 3. Profile Description Schema
export const descriptionGeneratorSchema = z.object({
  name: z.string().optional(),
  currentBio: z.string().max(500).optional().default(""),
  interests: z.string().max(300).optional().default(""),
  achievements: z.string().max(400).optional().default(""),
  tone: AIToneEnum.default("professional"),
  language: AILanguageEnum.default("en"),
  count: z.number().int().min(1).max(4).default(3),
});

// 4. Link Title Schema
export const linkTitleGeneratorSchema = z.object({
  url: z.string().min(1, "URL is required"),
  currentTitle: z.string().max(100).optional().default(""),
  targetAudience: z.string().max(200).optional().default(""),
  tone: AIToneEnum.default("energetic"),
  language: AILanguageEnum.default("en"),
  count: z.number().int().min(1).max(5).default(3),
});

// 5. Content Improvement Schema
export const contentImproveSchema = z.object({
  text: z.string().min(3, "Text must be at least 3 characters").max(1000),
  goal: z.enum(["clarity", "conversion", "punchy", "shorter", "longer"]).default("conversion"),
  language: AILanguageEnum.default("en"),
  tone: AIToneEnum.default("professional"),
});

// 6. Theme Recommendation Schema
export const themeRecommendSchema = z.object({
  category: z.string().default("CREATOR"),
  bio: z.string().optional().default(""),
  profession: z.string().optional().default(""),
  vibe: z.enum(["modern", "dark", "bold", "minimal", "cyber", "sunset", "nature"]).default("modern"),
  preferredLayout: z.enum(["classic", "hero", "banner", "cutout", "shape"]).optional(),
});

// 7. Profile Optimization Schema
export const profileOptimizeSchema = z.object({
  username: z.string().min(1),
  displayName: z.string().optional(),
  bio: z.string().optional(),
  category: z.string().default("CREATOR"),
  linksCount: z.number().int().default(0),
  hasAvatar: z.boolean().default(true),
  hasBanner: z.boolean().default(false),
  themeName: z.string().optional(),
});

// 8. CTA Generator Schema
export const ctaGeneratorSchema = z.object({
  offerType: z.enum([
    "newsletter",
    "product",
    "portfolio",
    "booking",
    "social",
    "contact",
    "video",
    "course",
  ]).default("newsletter"),
  customContext: z.string().max(250).optional().default(""),
  tone: AIToneEnum.default("energetic"),
  language: AILanguageEnum.default("en"),
  count: z.number().int().min(1).max(5).default(4),
});

// Master request schema
export const aiGenerateRequestSchema = z.object({
  type: AIGenerationTypeEnum,
  data: z.record(z.any()),
});

export type AIGenerateRequest = z.infer<typeof aiGenerateRequestSchema>;
export type BioGeneratorInput = z.infer<typeof bioGeneratorSchema>;
export type HeadlineGeneratorInput = z.infer<typeof headlineGeneratorSchema>;
export type DescriptionGeneratorInput = z.infer<typeof descriptionGeneratorSchema>;
export type LinkTitleGeneratorInput = z.infer<typeof linkTitleGeneratorSchema>;
export type ContentImproveInput = z.infer<typeof contentImproveSchema>;
export type ThemeRecommendInput = z.infer<typeof themeRecommendSchema>;
export type ProfileOptimizeInput = z.infer<typeof profileOptimizeSchema>;
export type CTAGeneratorInput = z.infer<typeof ctaGeneratorSchema>;


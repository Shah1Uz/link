import { z } from "zod";

export const SubscriberStatusEnum = z.enum([
  "PENDING",
  "ACTIVE",
  "UNSUBSCRIBED",
  "BOUNCED",
]);

export const subscribeRequestSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  email: z.string().email("A valid email address is required"),
  name: z.string().max(100).optional().nullable(),
  source: z.string().max(50).default("profile_page"),
  consentText: z
    .string()
    .min(5, "Consent confirmation is required")
    .default("I agree to receive email updates and newsletters."),
});

export const confirmSubscriptionSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const unsubscribeSchema = z.object({
  token: z.string().min(1, "Unsubscribe token is required"),
});

export const newsletterSettingsSchema = z.object({
  newsletterEnabled: z.boolean().default(true),
  newsletterTitle: z.string().min(1, "Title is required").max(100),
  newsletterDescription: z.string().max(300).optional().nullable(),
  newsletterButtonText: z.string().min(1, "Button text is required").max(30),
  newsletterPlaceholder: z.string().min(1).max(50),
  newsletterSuccessMessage: z.string().min(1).max(200),
  newsletterLayout: z.enum(["card", "minimal", "inline", "hero"]).default("card"),
});

export type SubscribeRequestInput = z.infer<typeof subscribeRequestSchema>;
export type NewsletterSettingsInput = z.infer<typeof newsletterSettingsSchema>;


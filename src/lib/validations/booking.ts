import { z } from "zod";

export const AppointmentCategoryEnum = z.enum([
  "CONSULTATION",
  "MEETING",
  "COACHING",
  "PERSONAL",
  "SERVICE",
]);

export const LocationTypeEnum = z.enum([
  "GOOGLE_MEET",
  "ZOOM",
  "CUSTOM_URL",
  "IN_PERSON",
  "PHONE",
]);

export const BookingStatusEnum = z.enum([
  "CONFIRMED",
  "CANCELLED",
  "RESCHEDULED",
  "COMPLETED",
]);

export const appointmentTypeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional().nullable(),
  category: AppointmentCategoryEnum.default("CONSULTATION"),
  duration: z.coerce
    .number()
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(480, "Maximum duration is 480 minutes")
    .default(30),
  bufferTime: z.coerce
    .number()
    .int()
    .min(0, "Buffer time cannot be negative")
    .max(60, "Maximum buffer time is 60 minutes")
    .default(10),
  price: z.coerce.number().min(0, "Price cannot be negative").default(0),
  currency: z.string().min(3).max(3).default("USD"),
  locationType: LocationTypeEnum.default("GOOGLE_MEET"),
  locationUrl: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid color format").default("#3b82f6"),
  isActive: z.boolean().default(true),
});

export const availabilityRuleSchema = z.object({
  id: z.string().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time (HH:mm)"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time (HH:mm)"),
  isEnabled: z.boolean().default(true),
  timezone: z.string().default("UTC"),
});

export const weeklyAvailabilitySchema = z.object({
  timezone: z.string().default("UTC"),
  rules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      isEnabled: z.boolean().default(true),
    })
  ),
});

export const bookingCreateSchema = z.object({
  profileId: z.string().min(1, "Profile ID is required"),
  appointmentTypeId: z.string().min(1, "Appointment type ID is required"),
  customerName: z.string().min(2, "Name must be at least 2 characters").max(100),
  customerEmail: z.string().email("A valid email address is required"),
  customerPhone: z.string().max(30).optional().nullable(),
  customerNotes: z.string().max(500).optional().nullable(),
  startTime: z.string().datetime("Valid ISO start datetime is required"),
  timezone: z.string().optional().default("UTC"),
});

export const bookingCancelSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  cancelToken: z.string().optional(),
  reason: z.string().max(300).optional().nullable(),
});

export const bookingRescheduleSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  rescheduleToken: z.string().optional(),
  newStartTime: z.string().datetime("Valid ISO start datetime is required"),
});

export const bookingSettingsSchema = z.object({
  bookingEnabled: z.boolean().default(true),
  bookingTitle: z.string().min(1, "Title is required").max(100),
  bookingDescription: z.string().max(300).optional().nullable(),
  bookingTimezone: z.string().default("UTC"),
});

export type AppointmentTypeInput = z.infer<typeof appointmentTypeSchema>;
export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
export type BookingCancelInput = z.infer<typeof bookingCancelSchema>;
export type BookingRescheduleInput = z.infer<typeof bookingRescheduleSchema>;
export type BookingSettingsInput = z.infer<typeof bookingSettingsSchema>;


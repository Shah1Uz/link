import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  formattedTime: string; // "09:00 - 09:30"
  duration: number;  // minutes
}

export interface CreateBookingParams {
  profileId: string;
  appointmentTypeId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerNotes?: string | null;
  startTime: Date | string;
  timezone?: string;
}

export interface RescheduleBookingParams {
  bookingId: string;
  rescheduleToken?: string;
  newStartTime: Date | string;
  userId?: string; // If creator is rescheduling directly
}

export interface CancelBookingParams {
  bookingId: string;
  cancelToken?: string;
  reason?: string | null;
  userId?: string; // If creator is cancelling directly
}

/**
 * Checks for overlapping bookings for a given profile and time range.
 * Throws an error if conflict exists.
 */
export async function checkBookingConflict(
  tx: any,
  profileId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<void> {
  const conflict = await tx.booking.findFirst({
    where: {
      profileId,
      status: { in: ["CONFIRMED", "RESCHEDULED"] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    include: {
      appointmentType: true,
    },
  });

  if (conflict) {
    throw new Error(
      `Slot conflict: this time (${startTime.toISOString()} - ${endTime.toISOString()}) overlaps with an existing booking.`
    );
  }
}

/**
 * Generates available booking time slots for a given appointment type on a specific date.
 * targetDateStr format: YYYY-MM-DD
 */
export async function generateAvailableSlots(
  profileId: string,
  appointmentTypeId: string,
  targetDateStr: string,
  viewerTimezone: string = "UTC"
): Promise<TimeSlot[]> {
  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: appointmentTypeId },
    include: { profile: true },
  });

  if (!appointmentType || !appointmentType.isActive) {
    throw new Error("Appointment type is inactive or not found");
  }

  if (appointmentType.profileId !== profileId) {
    throw new Error("Appointment type does not belong to this profile");
  }

  // Parse target date (UTC baseline)
  const [year, month, day] = targetDateStr.split("-").map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

  // Fetch creator's availability rules for this day of week
  let rules = await prisma.availabilityRule.findMany({
    where: {
      profileId,
      dayOfWeek,
      isEnabled: true,
    },
    orderBy: { startTime: "asc" },
  });

  // Default to standard business hours Mon-Fri (9:00 - 17:00) if no rules configured at all
  if (rules.length === 0) {
    const allRules = await prisma.availabilityRule.count({ where: { profileId } });
    if (allRules === 0 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      rules = [
        {
          id: "default",
          profileId,
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          isEnabled: true,
          timezone: appointmentType.profile.bookingTimezone || "UTC",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  }

  if (rules.length === 0) {
    return [];
  }

  const durationMs = appointmentType.duration * 60 * 1000;
  const bufferMs = appointmentType.bufferTime * 60 * 1000;
  const stepMs = durationMs + bufferMs;

  // Fetch all existing bookings on this date (with buffer cushion)
  const windowStart = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const windowEnd = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  const existingBookings = await prisma.booking.findMany({
    where: {
      profileId,
      status: { in: ["CONFIRMED", "RESCHEDULED"] },
      startTime: { lt: windowEnd },
      endTime: { gt: windowStart },
    },
  });

  const now = new Date();
  const availableSlots: TimeSlot[] = [];

  for (const rule of rules) {
    const [startH, startM] = rule.startTime.split(":").map(Number);
    const [endH, endM] = rule.endTime.split(":").map(Number);

    const ruleStart = new Date(Date.UTC(year, month - 1, day, startH, startM, 0));
    const ruleEnd = new Date(Date.UTC(year, month - 1, day, endH, endM, 0));

    let candidateStart = new Date(ruleStart.getTime());

    while (candidateStart.getTime() + durationMs <= ruleEnd.getTime()) {
      const candidateEnd = new Date(candidateStart.getTime() + durationMs);

      // Filter out slots in the past
      if (candidateStart.getTime() > now.getTime()) {
        // Check for collision with existing confirmed/rescheduled bookings
        const hasCollision = existingBookings.some((b) => {
          return b.startTime.getTime() < candidateEnd.getTime() && b.endTime.getTime() > candidateStart.getTime();
        });

        if (!hasCollision) {
          const startHoursStr = String(candidateStart.getUTCHours()).padStart(2, "0");
          const startMinsStr = String(candidateStart.getUTCMinutes()).padStart(2, "0");
          const endHoursStr = String(candidateEnd.getUTCHours()).padStart(2, "0");
          const endMinsStr = String(candidateEnd.getUTCMinutes()).padStart(2, "0");

          availableSlots.push({
            startTime: candidateStart.toISOString(),
            endTime: candidateEnd.toISOString(),
            formattedTime: `${startHoursStr}:${startMinsStr} - ${endHoursStr}:${endMinsStr} UTC`,
            duration: appointmentType.duration,
          });
        }
      }

      candidateStart = new Date(candidateStart.getTime() + stepMs);
    }
  }

  return availableSlots;
}

/**
 * Creates a new booking with strict transaction locking to prevent race conditions & double bookings.
 */
export async function createBooking(params: CreateBookingParams) {
  const {
    profileId,
    appointmentTypeId,
    customerName,
    customerEmail,
    customerPhone,
    customerNotes,
    startTime: rawStartTime,
  } = params;

  const startDate = new Date(rawStartTime);
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid start time provided");
  }

  // Execute inside a database transaction to ensure double booking protection
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch appointment type & profile
    const appointmentType = await tx.appointmentType.findUnique({
      where: { id: appointmentTypeId },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointmentType || !appointmentType.isActive) {
      throw new Error("This appointment type is currently not available for booking.");
    }

    if (appointmentType.profileId !== profileId) {
      throw new Error("Selected appointment type does not match profile.");
    }

    // 2. Compute end time based on duration
    const endDate = new Date(startDate.getTime() + appointmentType.duration * 60 * 1000);

    // 3. Double Booking Protection Check
    await checkBookingConflict(tx, profileId, startDate, endDate);

    // 4. Generate unique management tokens
    const cancelToken = crypto.randomBytes(24).toString("hex");
    const rescheduleToken = crypto.randomBytes(24).toString("hex");

    // 5. Determine meeting URL
    let meetingUrl = appointmentType.locationUrl;
    if (appointmentType.locationType === "GOOGLE_MEET" && !meetingUrl) {
      meetingUrl = `https://meet.google.com/${crypto.randomBytes(3).toString("hex")}-${crypto.randomBytes(4).toString("hex")}-${crypto.randomBytes(3).toString("hex")}`;
    }

    // 6. Create Booking Record
    const booking = await tx.booking.create({
      data: {
        profileId,
        appointmentTypeId,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone: customerPhone?.trim() || null,
        customerNotes: customerNotes?.trim() || null,
        startTime: startDate,
        endTime: endDate,
        status: "CONFIRMED",
        meetingUrl,
        locationType: appointmentType.locationType,
        price: appointmentType.price,
        currency: appointmentType.currency,
        isPaid: appointmentType.price === 0, // Free appointments auto-marked as paid
        cancelToken,
        rescheduleToken,
      },
      include: {
        appointmentType: true,
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    // 7. Create in-system Notification Records
    await tx.bookingNotification.createMany({
      data: [
        {
          bookingId: booking.id,
          type: "CONFIRMATION",
          recipientEmail: booking.customerEmail,
          recipientRole: "ATTENDEE",
          status: "SENT",
          subject: `Booking Confirmed: ${appointmentType.title}`,
          content: `Your appointment with ${appointmentType.profile.displayName || appointmentType.profile.username} is confirmed for ${startDate.toUTCString()}.`,
        },
        {
          bookingId: booking.id,
          type: "NEW_BOOKING",
          recipientEmail: appointmentType.profile.user.email,
          recipientRole: "CREATOR",
          status: "SENT",
          subject: `New Booking: ${customerName} booked ${appointmentType.title}`,
          content: `${customerName} (${customerEmail}) booked ${appointmentType.title} on ${startDate.toUTCString()}.`,
        },
      ],
    });

    return booking;
  });
}

/**
 * Cancels an existing booking.
 */
export async function cancelBooking(params: CancelBookingParams) {
  const { bookingId, cancelToken, reason, userId } = params;

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        appointmentType: true,
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Booking is already cancelled");
    }

    // Check authorization: either matching cancelToken or authenticated profile owner
    const isOwner = userId && booking.profile.userId === userId;
    if (!isOwner && (!cancelToken || booking.cancelToken !== cancelToken)) {
      throw new Error("Unauthorized to cancel this booking");
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason || "Cancelled by user",
        cancelledAt: new Date(),
      },
    });

    // Create Cancellation notification
    await tx.bookingNotification.create({
      data: {
        bookingId: booking.id,
        type: "CANCELLATION",
        recipientEmail: booking.customerEmail,
        recipientRole: "ATTENDEE",
        status: "SENT",
        subject: `Appointment Cancelled: ${booking.appointmentType.title}`,
        content: `Your booking for ${booking.startTime.toUTCString()} was cancelled. Reason: ${reason || "N/A"}`,
      },
    });

    return updated;
  });
}

/**
 * Reschedules an existing booking to a new start time with conflict validation.
 */
export async function rescheduleBooking(params: RescheduleBookingParams) {
  const { bookingId, rescheduleToken, newStartTime, userId } = params;

  const newStartDate = new Date(newStartTime);
  if (isNaN(newStartDate.getTime())) {
    throw new Error("Invalid new start time");
  }

  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        appointmentType: true,
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Cannot reschedule a cancelled booking");
    }

    // Check authorization: either matching rescheduleToken or authenticated profile owner
    const isOwner = userId && booking.profile.userId === userId;
    if (!isOwner && (!rescheduleToken || booking.rescheduleToken !== rescheduleToken)) {
      throw new Error("Unauthorized to reschedule this booking");
    }

    const durationMs = booking.appointmentType.duration * 60 * 1000;
    const newEndDate = new Date(newStartDate.getTime() + durationMs);

    // Double-booking check excluding this booking
    await checkBookingConflict(tx, booking.profileId, newStartDate, newEndDate, booking.id);

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        startTime: newStartDate,
        endTime: newEndDate,
        status: "RESCHEDULED",
      },
    });

    // Create Rescheduling notification
    await tx.bookingNotification.create({
      data: {
        bookingId: booking.id,
        type: "RESCHEDULED",
        recipientEmail: booking.customerEmail,
        recipientRole: "ATTENDEE",
        status: "SENT",
        subject: `Appointment Rescheduled: ${booking.appointmentType.title}`,
        content: `Your appointment has been rescheduled to ${newStartDate.toUTCString()}.`,
      },
    });

    return updated;
  });
}


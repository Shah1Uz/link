import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingRescheduleSchema } from "@/lib/validations/booking";
import { rescheduleBooking } from "@/lib/booking/service";
import { z } from "zod";

/**
 * POST: Reschedule a booking (supports rescheduleToken or authenticated creator)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validated = bookingRescheduleSchema.parse(body);

    const rescheduled = await rescheduleBooking({
      bookingId: validated.bookingId,
      rescheduleToken: validated.rescheduleToken,
      newStartTime: validated.newStartTime,
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      message: "Appointment successfully rescheduled",
      booking: rescheduled,
    });
  } catch (err: any) {
    console.error("[BOOKING_RESCHEDULE_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    if (err.message && err.message.includes("Slot conflict")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Failed to reschedule booking" }, { status: 400 });
  }
}


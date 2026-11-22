import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingCancelSchema } from "@/lib/validations/booking";
import { cancelBooking } from "@/lib/booking/service";
import { z } from "zod";

/**
 * POST: Cancel a booking (supports cancelToken or authenticated creator)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const body = await req.json();
    const validated = bookingCancelSchema.parse(body);

    const cancelled = await cancelBooking({
      bookingId: validated.bookingId,
      cancelToken: validated.cancelToken,
      reason: validated.reason,
      userId: user?.id,
    });

    return NextResponse.json({
      success: true,
      message: "Appointment successfully cancelled",
      booking: cancelled,
    });
  } catch (err: any) {
    console.error("[BOOKING_CANCEL_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to cancel booking" }, { status: 400 });
  }
}


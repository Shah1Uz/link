import { NextRequest, NextResponse } from "next/server";
import { generateAvailableSlots } from "@/lib/booking/service";

/**
 * GET: Public - Fetch real-time available time slots for an appointment on a specific date
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const appointmentTypeId = searchParams.get("appointmentTypeId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const timezone = searchParams.get("timezone") || "UTC";

    if (!profileId || !appointmentTypeId || !date) {
      return NextResponse.json(
        { error: "Missing required query parameters: profileId, appointmentTypeId, and date (YYYY-MM-DD) are required" },
        { status: 400 }
      );
    }

    // Validate date format YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Expected YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const slots = await generateAvailableSlots(profileId, appointmentTypeId, date, timezone);

    return NextResponse.json({ slots, count: slots.length });
  } catch (err: any) {
    console.error("[BOOKING_SLOTS_ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate slots" },
      { status: 400 }
    );
  }
}


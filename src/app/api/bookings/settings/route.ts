import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingSettingsSchema } from "@/lib/validations/booking";
import { z } from "zod";

/**
 * GET: Creator Dashboard - Fetch booking configuration settings
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: user.profile.id },
      select: {
        bookingEnabled: true,
        bookingTitle: true,
        bookingDescription: true,
        bookingTimezone: true,
      },
    });

    return NextResponse.json({ settings: profile });
  } catch (err: any) {
    console.error("[BOOKING_SETTINGS_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch booking settings" }, { status: 500 });
  }
}

/**
 * PATCH: Creator Dashboard - Update booking configuration settings
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = bookingSettingsSchema.parse(body);

    const updated = await prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        bookingEnabled: validated.bookingEnabled,
        bookingTitle: validated.bookingTitle,
        bookingDescription: validated.bookingDescription,
        bookingTimezone: validated.bookingTimezone,
      },
      select: {
        bookingEnabled: true,
        bookingTitle: true,
        bookingDescription: true,
        bookingTimezone: true,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    console.error("[BOOKING_SETTINGS_PATCH_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update booking settings" }, { status: 400 });
  }
}


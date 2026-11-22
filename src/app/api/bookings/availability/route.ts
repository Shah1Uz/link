import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { weeklyAvailabilitySchema } from "@/lib/validations/booking";
import { z } from "zod";

/**
 * GET: Creator Dashboard - Fetch weekly availability schedule and timezone
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const rules = await prisma.availabilityRule.findMany({
      where: { profileId: user.profile.id },
      orderBy: { dayOfWeek: "asc" },
    });

    const profile = await prisma.profile.findUnique({
      where: { id: user.profile.id },
      select: { bookingTimezone: true },
    });

    // If no rules exist yet, generate default 7-day template (Mon-Fri active 9:00-17:00, Sat-Sun disabled)
    let finalRules = rules;
    if (rules.length === 0) {
      finalRules = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
        id: `default-${day}`,
        profileId: user.profile!.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "17:00",
        isEnabled: day >= 1 && day <= 5,
        timezone: profile?.bookingTimezone || "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return NextResponse.json({
      timezone: profile?.bookingTimezone || "UTC",
      rules: finalRules,
    });
  } catch (err: any) {
    console.error("[AVAILABILITY_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

/**
 * PUT: Creator Dashboard - Update weekly availability schedule and timezone
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = weeklyAvailabilitySchema.parse(body);

    const profileId = user.profile.id;

    await prisma.$transaction(async (tx) => {
      // 1. Update Profile Timezone
      await tx.profile.update({
        where: { id: profileId },
        data: { bookingTimezone: validated.timezone },
      });

      // 2. Remove existing rules
      await tx.availabilityRule.deleteMany({
        where: { profileId },
      });

      // 3. Insert updated rules
      if (validated.rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: validated.rules.map((r) => ({
            profileId,
            dayOfWeek: r.dayOfWeek,
            startTime: r.startTime,
            endTime: r.endTime,
            isEnabled: r.isEnabled,
            timezone: validated.timezone,
          })),
        });
      }
    });

    const updatedRules = await prisma.availabilityRule.findMany({
      where: { profileId },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({
      success: true,
      timezone: validated.timezone,
      rules: updatedRules,
    });
  } catch (err: any) {
    console.error("[AVAILABILITY_PUT_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update availability" }, { status: 400 });
  }
}


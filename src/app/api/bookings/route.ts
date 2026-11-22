import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { bookingCreateSchema } from "@/lib/validations/booking";
import { createBooking } from "@/lib/booking/service";
import { z } from "zod";

/**
 * GET: Creator Dashboard - Fetch bookings, metrics, and filter by status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL"; // ALL, UPCOMING, COMPLETED, CANCELLED
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const now = new Date();

    const where: any = {
      profileId: user.profile.id,
    };

    if (filter === "UPCOMING") {
      where.status = { in: ["CONFIRMED", "RESCHEDULED"] };
      where.startTime = { gte: now };
    } else if (filter === "COMPLETED") {
      where.OR = [
        { status: "COMPLETED" },
        { status: { in: ["CONFIRMED", "RESCHEDULED"] }, endTime: { lt: now } },
      ];
    } else if (filter === "CANCELLED") {
      where.status = "CANCELLED";
    }

    if (search) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
            { appointmentType: { title: { contains: search } } },
          ],
        },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { startTime: filter === "COMPLETED" || filter === "CANCELLED" ? "desc" : "asc" },
      include: {
        appointmentType: true,
        notifications: {
          orderBy: { sentAt: "desc" },
          take: 5,
        },
      },
    });

    // Compute KPI metrics across all profile bookings
    const allBookings = await prisma.booking.findMany({
      where: { profileId: user.profile.id },
      select: {
        status: true,
        startTime: true,
        endTime: true,
        price: true,
        isPaid: true,
      },
    });

    const totalBookings = allBookings.length;
    const upcomingCount = allBookings.filter(
      (b) => (b.status === "CONFIRMED" || b.status === "RESCHEDULED") && b.startTime >= now
    ).length;
    const completedCount = allBookings.filter(
      (b) => b.status === "COMPLETED" || ((b.status === "CONFIRMED" || b.status === "RESCHEDULED") && b.endTime < now)
    ).length;
    const cancelledCount = allBookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = allBookings
      .filter((b) => b.isPaid && b.status !== "CANCELLED")
      .reduce((sum, b) => sum + (b.price || 0), 0);

    return NextResponse.json({
      bookings,
      metrics: {
        totalBookings,
        upcomingCount,
        completedCount,
        cancelledCount,
        totalRevenue,
      },
    });
  } catch (err: any) {
    console.error("[BOOKINGS_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

/**
 * POST: Public - Book an appointment
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = bookingCreateSchema.parse(body);

    // Verify profile exists and booking is enabled
    const profile = await prisma.profile.findUnique({
      where: { id: validated.profileId },
      select: { id: true, bookingEnabled: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.bookingEnabled) {
      return NextResponse.json({ error: "Bookings are currently disabled for this creator" }, { status: 403 });
    }

    // Call service with concurrency & double booking transaction protection
    const booking = await createBooking(validated);

    return NextResponse.json(
      {
        success: true,
        message: "Appointment successfully booked!",
        booking: {
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          meetingUrl: booking.meetingUrl,
          cancelToken: booking.cancelToken,
          rescheduleToken: booking.rescheduleToken,
          appointmentType: {
            title: booking.appointmentType.title,
            duration: booking.appointmentType.duration,
            locationType: booking.appointmentType.locationType,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[BOOKING_CREATE_ERROR]", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }

    if (err.message && err.message.includes("Slot conflict")) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: err.message || "Failed to book appointment" },
      { status: 400 }
    );
  }
}


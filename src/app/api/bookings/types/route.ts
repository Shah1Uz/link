import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { appointmentTypeSchema } from "@/lib/validations/booking";
import { z } from "zod";

/**
 * GET: Fetch appointment types (public if profileId/username provided, or authenticated creator)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");
    const username = searchParams.get("username");

    // Public request
    if (profileId || username) {
      const where: any = { isActive: true };
      if (profileId) {
        where.profileId = profileId;
      } else if (username) {
        const profile = await prisma.profile.findUnique({
          where: { username },
          select: { id: true },
        });
        if (!profile) {
          return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        where.profileId = profile.id;
      }

      const types = await prisma.appointmentType.findMany({
        where,
        orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      });

      return NextResponse.json({ appointmentTypes: types });
    }

    // Authenticated creator dashboard request
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const types = await prisma.appointmentType.findMany({
      where: { profileId: user.profile.id },
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ appointmentTypes: types });
  } catch (err: any) {
    console.error("[APPOINTMENT_TYPES_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch appointment types" }, { status: 500 });
  }
}

/**
 * POST: Authenticated Creator - Create new appointment type
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = appointmentTypeSchema.parse(body);

    const count = await prisma.appointmentType.count({
      where: { profileId: user.profile.id },
    });

    const appointmentType = await prisma.appointmentType.create({
      data: {
        profileId: user.profile.id,
        title: validated.title,
        description: validated.description || null,
        category: validated.category,
        duration: validated.duration,
        bufferTime: validated.bufferTime,
        price: validated.price,
        currency: validated.currency,
        locationType: validated.locationType,
        locationUrl: validated.locationUrl || null,
        color: validated.color || "#3b82f6",
        isActive: validated.isActive,
        position: count,
      },
    });

    return NextResponse.json({ success: true, appointmentType }, { status: 201 });
  } catch (err: any) {
    console.error("[APPOINTMENT_TYPE_POST_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create appointment type" }, { status: 400 });
  }
}

/**
 * PUT: Authenticated Creator - Update appointment type
 */
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Appointment type ID is required" }, { status: 400 });
    }

    const existing = await prisma.appointmentType.findUnique({
      where: { id: body.id },
    });

    if (!existing || existing.profileId !== user.profile.id) {
      return NextResponse.json({ error: "Appointment type not found or forbidden" }, { status: 404 });
    }

    const validated = appointmentTypeSchema.parse(body);

    const updated = await prisma.appointmentType.update({
      where: { id: body.id },
      data: {
        title: validated.title,
        description: validated.description !== undefined ? validated.description : existing.description,
        category: validated.category,
        duration: validated.duration,
        bufferTime: validated.bufferTime,
        price: validated.price,
        currency: validated.currency,
        locationType: validated.locationType,
        locationUrl: validated.locationUrl !== undefined ? validated.locationUrl : existing.locationUrl,
        color: validated.color || existing.color,
        isActive: validated.isActive,
      },
    });

    return NextResponse.json({ success: true, appointmentType: updated });
  } catch (err: any) {
    console.error("[APPOINTMENT_TYPE_PUT_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update appointment type" }, { status: 400 });
  }
}

/**
 * DELETE: Authenticated Creator - Delete or deactivate appointment type
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Appointment type ID is required" }, { status: 400 });
    }

    const existing = await prisma.appointmentType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing || existing.profileId !== user.profile.id) {
      return NextResponse.json({ error: "Appointment type not found or forbidden" }, { status: 404 });
    }

    // If there are existing bookings, deactivate instead of hard deleting to prevent foreign key errors
    if (existing._count.bookings > 0) {
      await prisma.appointmentType.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: "Appointment type deactivated (preserved for booking history)" });
    }

    await prisma.appointmentType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Appointment type deleted successfully" });
  } catch (err: any) {
    console.error("[APPOINTMENT_TYPE_DELETE_ERROR]", err);
    return NextResponse.json({ error: err.message || "Failed to delete appointment type" }, { status: 500 });
  }
}


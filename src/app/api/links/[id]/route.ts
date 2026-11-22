import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { linkSchema } from "@/lib/validations";
import { detectPlatformFromUrl, formatUrlForHref } from "@/lib/utils";

// PATCH update link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Verify ownership
    const link = await prisma.link.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!link) return NextResponse.json({ error: "Link not found or access denied" }, { status: 404 });

    const body = await request.json();
    const validated = linkSchema.partial().parse(body);

    const updateData: any = { ...validated };
    if (validated.url) {
      if (!validated.icon) {
        updateData.icon = detectPlatformFromUrl(validated.url);
      }
      updateData.url = formatUrlForHref(validated.url, updateData.icon || validated.icon);
    }
    if (validated.scheduledStart !== undefined) {
      updateData.scheduledStart = validated.scheduledStart ? new Date(validated.scheduledStart) : null;
    }
    if (validated.scheduledEnd !== undefined) {
      updateData.scheduledEnd = validated.scheduledEnd ? new Date(validated.scheduledEnd) : null;
    }

    const updatedLink = await prisma.link.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ link: updatedLink });
  } catch (error: any) {
    if (error instanceof ZodError) {
      const msg = error.issues.map((i) => i.message).join(". ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update link" }, { status: 400 });
  }
}

// DELETE link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Verify ownership
    const link = await prisma.link.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!link) return NextResponse.json({ error: "Link not found or access denied" }, { status: 404 });

    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Link deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete link" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const subscriber = await prisma.subscriber.findFirst({
      where: {
        id,
        profileId: user.profile.id,
      },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found or unauthorized access" }, { status: 404 });
    }

    await prisma.subscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Subscriber record permanently deleted (GDPR compliant)." });
  } catch (error) {
    console.error("Subscriber DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


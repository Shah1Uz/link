import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        theme: true,
        links: {
          orderBy: [{ isPinned: "desc" }, { position: "asc" }],
        },
        collections: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json({
      profile,
      theme: profile?.theme,
      links: profile?.links || [],
      collections: profile?.collections || [],
    });
  } catch (error) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = profileUpdateSchema.parse(body);

    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: validated,
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 400 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cascade delete profile and user data
    await prisma.profile.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, message: "Profile deleted" });
  } catch (error: any) {
    console.error("Delete profile error:", error);
    return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 });
  }
}


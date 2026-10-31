import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { themeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { theme: true },
    });

    return NextResponse.json({ theme: profile?.theme });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const validated = themeSchema.partial().parse(body);

    const theme = await prisma.theme.upsert({
      where: { profileId: profile.id },
      update: validated,
      create: {
        profileId: profile.id,
        ...validated,
      },
    });

    return NextResponse.json({ theme });
  } catch (error: any) {
    console.error("Theme update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update theme" }, { status: 400 });
  }
}


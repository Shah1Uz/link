import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    let qrCode = await prisma.qRCode.findUnique({
      where: { profileId: profile.id },
    });

    if (!qrCode) {
      qrCode = await prisma.qRCode.create({
        data: {
          profileId: profile.id,
          foregroundColor: "#000000",
          backgroundColor: "#ffffff",
        },
      });
    }

    return NextResponse.json({ qrCode, username: profile.username });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch QR settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const { foregroundColor, backgroundColor, logoUrl } = body;

    const qrCode = await prisma.qRCode.upsert({
      where: { profileId: profile.id },
      update: {
        foregroundColor: foregroundColor || "#000000",
        backgroundColor: backgroundColor || "#ffffff",
        logoUrl: logoUrl || null,
      },
      create: {
        profileId: profile.id,
        foregroundColor: foregroundColor || "#000000",
        backgroundColor: backgroundColor || "#ffffff",
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json({ qrCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update QR code" }, { status: 400 });
  }
}


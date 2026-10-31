import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    let settings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const body = await request.json();

    const updated = await prisma.platformSettings.upsert({
      where: { id: "default" },
      update: body,
      create: { id: "default", ...body },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "PLATFORM_SETTINGS_UPDATED",
        targetResource: "PLATFORM_SETTINGS",
        targetId: "default",
        details: JSON.stringify(body),
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update platform settings" }, { status: 400 });
  }
}


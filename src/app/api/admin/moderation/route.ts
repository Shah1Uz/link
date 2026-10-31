import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const reports = await prisma.report.findMany({
      include: {
        profile: { select: { id: true, username: true, displayName: true } },
        link: { select: { id: true, title: true, url: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { reportId, status, actionTaken } = await request.json();

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolvedBy: admin.email,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: `REPORT_${status}`,
        targetResource: "REPORT",
        targetId: reportId,
        details: actionTaken || `Marked report as ${status}`,
      },
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update report" }, { status: 400 });
  }
}


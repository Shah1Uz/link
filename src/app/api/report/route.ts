import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = reportSchema.parse(body);

    const report = await prisma.report.create({
      data: {
        profileId: validated.profileId || null,
        linkId: validated.linkId || null,
        reporterEmail: validated.reporterEmail || null,
        reason: validated.reason,
        details: validated.details || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, reportId: report.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit report" }, { status: 400 });
  }
}


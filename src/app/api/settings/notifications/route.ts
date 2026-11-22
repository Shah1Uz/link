import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { notificationPrefsSchema } from "@/lib/validations";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      notifyClickMilestones: true,
      notifyWeeklyDigest: true,
      notifyProductNews: true,
    },
  });

  return NextResponse.json({
    notifyClickMilestones: row?.notifyClickMilestones ?? true,
    notifyWeeklyDigest: row?.notifyWeeklyDigest ?? true,
    notifyProductNews: row?.notifyProductNews ?? false,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prefs = notificationPrefsSchema.parse(await request.json());
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: prefs,
      select: {
        notifyClickMilestones: true,
        notifyWeeklyDigest: true,
        notifyProductNews: true,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.issues?.[0]?.message || "Could not save preferences" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getAIUsageStats } from "@/lib/ai/usage";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getAIUsageStats(user.id, user.subscriptionTier);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error("Fetch AI usage error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch AI usage" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferredLanguage, preferredTone, defaultProvider } = body;

    const settings = await prisma.aISettings.upsert({
      where: { userId: user.id },
      update: {
        ...(preferredLanguage ? { preferredLanguage } : {}),
        ...(preferredTone ? { preferredTone } : {}),
        ...(defaultProvider ? { defaultProvider } : {}),
      },
      create: {
        userId: user.id,
        preferredLanguage: preferredLanguage || "en",
        preferredTone: preferredTone || "professional",
        defaultProvider: defaultProvider || "gemini",
      },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Update AI settings error:", error);
    return NextResponse.json({ error: error.message || "Failed to update AI settings" }, { status: 500 });
  }
}


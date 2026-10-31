import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const { templateSlug } = await request.json();
    const template = await prisma.template.findUnique({
      where: { slug: templateSlug },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (template.isPro && user.subscriptionTier !== "PRO") {
      return NextResponse.json(
        { error: "This is a PRO template. Please upgrade your subscription to apply it." },
        { status: 403 }
      );
    }

    let styles = {};
    try {
      styles = JSON.parse(template.stylesJson);
    } catch {}

    // Apply template styles to user theme
    const theme = await prisma.theme.upsert({
      where: { profileId: profile.id },
      update: {
        ...styles,
      },
      create: {
        profileId: profile.id,
        ...styles,
      },
    });

    // Update layout on Profile
    await prisma.profile.update({
      where: { id: profile.id },
      data: { layout: template.layout },
    });

    // Increment template use count
    await prisma.template.update({
      where: { id: template.id },
      data: { useCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, theme, layout: template.layout });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to apply template" }, { status: 500 });
  }
}


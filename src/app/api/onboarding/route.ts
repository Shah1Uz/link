import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { usernameRegex } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      username,
      displayName,
      category = "CREATOR",
      bio = "",
      avatarUrl = "",
      socialLinks = [],
      templateSlug = "creator-horizon",
    } = body;

    const cleanUsername = (username || "").trim().toLowerCase();
    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
    }

    // Check if another profile uses this username
    const existing = await prisma.profile.findUnique({
      where: { username: cleanUsername },
    });

    if (existing && existing.userId !== user.id) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Upsert Profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        username: cleanUsername,
        displayName: displayName || user.name || cleanUsername,
        category,
        bio,
        avatarUrl: avatarUrl || user.avatar,
        isPublished: true,
      },
      create: {
        userId: user.id,
        username: cleanUsername,
        displayName: displayName || user.name || cleanUsername,
        category,
        bio,
        avatarUrl: avatarUrl || user.avatar,
        isPublished: true,
      },
    });

    // Fetch template styles
    const template = await prisma.template.findUnique({
      where: { slug: templateSlug },
    });

    let styles = {
      backgroundColor: "#0d1117",
      backgroundType: "gradient",
      backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
      buttonStyle: "filled",
      buttonColor: "#10b981",
      buttonTextColor: "#042f2e",
      buttonBorderColor: "#34d399",
      buttonRadius: "16px",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      textColor: "#f0fdf4",
      accentColor: "#10b981",
      animationsEnabled: true,
      showBranding: true,
    };

    if (template?.stylesJson) {
      try {
        styles = { ...styles, ...JSON.parse(template.stylesJson) };
      } catch {}
    }

    // Upsert Theme
    await prisma.theme.upsert({
      where: { profileId: profile.id },
      update: {
        ...styles,
      },
      create: {
        profileId: profile.id,
        ...styles,
      },
    });

    // Create Initial Links from social links provided
    if (Array.isArray(socialLinks) && socialLinks.length > 0) {
      let position = 0;
      for (const link of socialLinks) {
        if (link.url && link.title) {
          await prisma.link.create({
            data: {
              profileId: profile.id,
              title: link.title,
              url: link.url,
              icon: link.platform || "website",
              isEnabled: true,
              position: position++,
            },
          });
        }
      }
    }

    // Increment template use count
    if (template) {
      await prisma.template.update({
        where: { id: template.id },
        data: { useCount: { increment: 1 } },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete onboarding" }, { status: 500 });
  }
}


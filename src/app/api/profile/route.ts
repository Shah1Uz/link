import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { profileUpdateSchema } from "@/lib/validations";
import { isPremiumTier } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const searchUsername = req.nextUrl?.searchParams?.get("username");
    let profile: any = null;

    if (searchUsername) {
      profile = await prisma.profile.findUnique({
        where: { username: searchUsername.toLowerCase() },
        include: {
          user: { select: { subscriptionTier: true } },
          theme: true,
          links: {
            where: { isEnabled: true },
            orderBy: [{ isPinned: "desc" }, { position: "asc" }],
          },
          collections: {
            orderBy: { position: "asc" },
          },
        },
      });
      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }
    } else {
      const user = await getAuthenticatedUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        include: {
          user: { select: { subscriptionTier: true } },
          theme: true,
          links: {
            orderBy: [{ isPinned: "desc" }, { position: "asc" }],
          },
          collections: {
            orderBy: { position: "asc" },
          },
        },
      });
    }

    if (profile) {
      profile = {
        ...profile,
        verified: Boolean(profile.verified && isPremiumTier(profile.user?.subscriptionTier)),
      };
    }

    let theme: any = profile?.theme;
    if (theme) {
      let heroBlur = "16px";
      let heroFade = "high";
      let heroDarken = "balanced";
      let stickersEnabled = false;
      let stickerId = "big_sale";
      let stickerUrl: string | null = null;
      let stickerText: string | null = "BIG SALE";
      let stickerPosition = "top-right";
      let stickerAnimation = "float";
      let stickerSize = "medium";
      let stickerRotation = "-6deg";
      let stickerLink: string | null = null;
      let stickerPosX = 85;
      let stickerPosY = 12;
      let wallpaperEffect = "blur";
      let wallpaperTint = 20;
      let wallpaperNoise = false;
      let gradientStyle = "custom";
      let gradientColor = "#778a00";
      let gradientDirection = "radial";
      try {
        const rawRes: any = await prisma.$queryRaw`
          SELECT "heroBlur", "heroFade", "heroDarken", "stickersEnabled", "stickerId", "stickerUrl", "stickerText", "stickerPosition", "stickerAnimation", "stickerSize", "stickerRotation", "stickerLink", "stickerPosX", "stickerPosY", "wallpaperEffect", "wallpaperTint", "wallpaperNoise", "gradientStyle", "gradientColor", "gradientDirection"
          FROM "Theme"
          WHERE "profileId" = ${profile?.id}
          LIMIT 1
        `;
        if (rawRes?.[0]) {
          if (rawRes[0].heroBlur) heroBlur = rawRes[0].heroBlur;
          if (rawRes[0].heroFade) heroFade = rawRes[0].heroFade;
          if (rawRes[0].heroDarken) heroDarken = rawRes[0].heroDarken;
          if (rawRes[0].stickersEnabled !== undefined && rawRes[0].stickersEnabled !== null) {
            stickersEnabled = Boolean(rawRes[0].stickersEnabled);
          }
          if (rawRes[0].stickerId) stickerId = rawRes[0].stickerId;
          if (rawRes[0].stickerUrl) stickerUrl = rawRes[0].stickerUrl;
          if (rawRes[0].stickerText) stickerText = rawRes[0].stickerText;
          if (rawRes[0].stickerPosition) stickerPosition = rawRes[0].stickerPosition;
          if (rawRes[0].stickerAnimation) stickerAnimation = rawRes[0].stickerAnimation;
          if (rawRes[0].stickerSize) stickerSize = rawRes[0].stickerSize;
          if (rawRes[0].stickerRotation) stickerRotation = rawRes[0].stickerRotation;
          if (rawRes[0].stickerLink) stickerLink = rawRes[0].stickerLink;
          if (rawRes[0].stickerPosX !== null && rawRes[0].stickerPosX !== undefined) stickerPosX = Number(rawRes[0].stickerPosX);
          if (rawRes[0].stickerPosY !== null && rawRes[0].stickerPosY !== undefined) stickerPosY = Number(rawRes[0].stickerPosY);
          if (rawRes[0].wallpaperEffect) wallpaperEffect = rawRes[0].wallpaperEffect;
          if (rawRes[0].wallpaperTint !== null && rawRes[0].wallpaperTint !== undefined) wallpaperTint = Number(rawRes[0].wallpaperTint);
          if (rawRes[0].wallpaperNoise !== null && rawRes[0].wallpaperNoise !== undefined) wallpaperNoise = Boolean(rawRes[0].wallpaperNoise);
          if (rawRes[0].gradientStyle) gradientStyle = rawRes[0].gradientStyle;
          if (rawRes[0].gradientColor) gradientColor = rawRes[0].gradientColor;
          if (rawRes[0].gradientDirection) gradientDirection = rawRes[0].gradientDirection;
        }
      } catch { }
      theme = {
        ...theme,
        heroBlur,
        heroFade,
        heroDarken,
        stickersEnabled,
        stickerId,
        stickerUrl,
        stickerText,
        stickerPosition,
        stickerAnimation,
        stickerSize,
        stickerRotation,
        stickerLink,
        stickerPosX,
        stickerPosY,
        wallpaperEffect,
        wallpaperTint,
        wallpaperNoise,
        gradientStyle,
        gradientColor,
        gradientDirection,
      };
    }

    return NextResponse.json({
      profile,
      theme,
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

    if (validated.verified === true && user.subscriptionTier !== "PRO" && user.subscriptionTier !== "BUSINESS") {
      return NextResponse.json({ error: "Verified badge is available on the PRO plan" }, { status: 403 });
    }

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


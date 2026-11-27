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

    if (!profile?.theme) {
      return NextResponse.json({ theme: null });
    }

    let heroData: any = {
      heroBlur: "16px",
      heroFade: "high",
      heroDarken: "balanced",
    };
    let stickerData: any = {
      stickersEnabled: false,
      stickerId: "big_sale",
      stickerUrl: null,
      stickerText: "BIG SALE",
      stickerPosition: "top-right",
      stickerAnimation: "float",
      stickerSize: "medium",
      stickerRotation: "-6deg",
      stickerLink: null,
      stickerPosX: 85,
      stickerPosY: 12,
    };
    let wallpaperData: any = {
      wallpaperEffect: "blur",
      wallpaperTint: 20,
      wallpaperNoise: false,
      gradientStyle: "custom",
      gradientColor: "#778a00",
      gradientDirection: "radial",
    };

    try {
      const rawTheme: any = await prisma.$queryRaw`
        SELECT "heroBlur", "heroFade", "heroDarken",
               "stickersEnabled", "stickerId", "stickerUrl", "stickerText",
               "stickerPosition", "stickerAnimation", "stickerSize",
               "stickerRotation", "stickerLink", "stickerPosX", "stickerPosY",
               "wallpaperEffect", "wallpaperTint", "wallpaperNoise",
               "gradientStyle", "gradientColor", "gradientDirection"
        FROM "Theme"
        WHERE "profileId" = ${profile.id}
        LIMIT 1
      `;
      if (rawTheme?.[0]) {
        const row = rawTheme[0];
        if (row.heroBlur) heroData.heroBlur = row.heroBlur;
        if (row.heroFade) heroData.heroFade = row.heroFade;
        if (row.heroDarken) heroData.heroDarken = row.heroDarken;
        stickerData = {
          stickersEnabled: Boolean(row.stickersEnabled),
          stickerId: row.stickerId || "big_sale",
          stickerUrl: row.stickerUrl || null,
          stickerText: row.stickerText || "BIG SALE",
          stickerPosition: row.stickerPosition || "top-right",
          stickerAnimation: row.stickerAnimation || "float",
          stickerSize: row.stickerSize || "medium",
          stickerRotation: row.stickerRotation || "-6deg",
          stickerLink: row.stickerLink || null,
          stickerPosX: row.stickerPosX !== null && row.stickerPosX !== undefined ? Number(row.stickerPosX) : 85,
          stickerPosY: row.stickerPosY !== null && row.stickerPosY !== undefined ? Number(row.stickerPosY) : 12,
        };
        wallpaperData = {
          wallpaperEffect: row.wallpaperEffect || "blur",
          wallpaperTint: row.wallpaperTint !== null && row.wallpaperTint !== undefined ? Number(row.wallpaperTint) : 20,
          wallpaperNoise: Boolean(row.wallpaperNoise),
          gradientStyle: row.gradientStyle || "custom",
          gradientColor: row.gradientColor || "#778a00",
          gradientDirection: row.gradientDirection || "radial",
        };
      }
    } catch {
      // Extended optional columns may not exist in all schemas
    }

    const theme = {
      ...profile.theme,
      ...heroData,
      ...stickerData,
      ...wallpaperData,
    };

    return NextResponse.json({ theme });
  } catch {
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

    // Separate only optional non-Prisma extended fields;
    // backgroundVideo and all spotify* fields live natively in Theme model.
    const {
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
      ...prismaData
    } = validated;

    const theme = await prisma.theme.upsert({
      where: { profileId: profile.id },
      update: prismaData,
      create: {
        profileId: profile.id,
        ...prismaData,
      },
    });

    // Optional Hero Layout extended columns (silently skipped if columns aren't in schema)
    if (heroBlur !== undefined || heroFade !== undefined || heroDarken !== undefined) {
      try {
        await prisma.$executeRaw`
          UPDATE "Theme"
          SET "heroBlur" = COALESCE(${heroBlur ?? null}, "heroBlur"),
              "heroFade" = COALESCE(${heroFade ?? null}, "heroFade"),
              "heroDarken" = COALESCE(${heroDarken ?? null}, "heroDarken")
          WHERE "profileId" = ${profile.id}
        `;
      } catch {}
    }

    // Optional Stickers extended columns
    if (
      stickersEnabled !== undefined ||
      stickerId !== undefined ||
      stickerUrl !== undefined ||
      stickerText !== undefined ||
      stickerPosition !== undefined ||
      stickerAnimation !== undefined ||
      stickerSize !== undefined ||
      stickerRotation !== undefined ||
      stickerLink !== undefined ||
      stickerPosX !== undefined ||
      stickerPosY !== undefined
    ) {
      try {
        await prisma.$executeRaw`
          UPDATE "Theme"
          SET "stickersEnabled" = COALESCE(${stickersEnabled !== undefined ? Boolean(stickersEnabled) : null}, "stickersEnabled"),
              "stickerId" = COALESCE(${stickerId ?? null}, "stickerId"),
              "stickerUrl" = COALESCE(${stickerUrl ?? null}, "stickerUrl"),
              "stickerText" = COALESCE(${stickerText ?? null}, "stickerText"),
              "stickerPosition" = COALESCE(${stickerPosition ?? null}, "stickerPosition"),
              "stickerAnimation" = COALESCE(${stickerAnimation ?? null}, "stickerAnimation"),
              "stickerSize" = COALESCE(${stickerSize ?? null}, "stickerSize"),
              "stickerRotation" = COALESCE(${stickerRotation ?? null}, "stickerRotation"),
              "stickerLink" = COALESCE(${stickerLink ?? null}, "stickerLink"),
              "stickerPosX" = COALESCE(${stickerPosX ?? null}, "stickerPosX"),
              "stickerPosY" = COALESCE(${stickerPosY ?? null}, "stickerPosY")
          WHERE "profileId" = ${profile.id}
        `;
      } catch {}
    }

    // Optional Wallpaper & Gradient extended columns
    if (
      wallpaperEffect !== undefined ||
      wallpaperTint !== undefined ||
      wallpaperNoise !== undefined ||
      gradientStyle !== undefined ||
      gradientColor !== undefined ||
      gradientDirection !== undefined
    ) {
      try {
        await prisma.$executeRaw`
          UPDATE "Theme"
          SET "wallpaperEffect" = COALESCE(${wallpaperEffect ?? null}, "wallpaperEffect"),
              "wallpaperTint" = COALESCE(${wallpaperTint ?? null}, "wallpaperTint"),
              "wallpaperNoise" = COALESCE(${wallpaperNoise !== undefined ? Boolean(wallpaperNoise) : null}, "wallpaperNoise"),
              "gradientStyle" = COALESCE(${gradientStyle ?? null}, "gradientStyle"),
              "gradientColor" = COALESCE(${gradientColor ?? null}, "gradientColor"),
              "gradientDirection" = COALESCE(${gradientDirection ?? null}, "gradientDirection")
          WHERE "profileId" = ${profile.id}
        `;
      } catch {}
    }

    return NextResponse.json({
      theme: {
        ...theme,
        heroBlur: heroBlur !== undefined ? heroBlur : (theme as any).heroBlur || "16px",
        heroFade: heroFade !== undefined ? heroFade : (theme as any).heroFade || "high",
        heroDarken: heroDarken !== undefined ? heroDarken : (theme as any).heroDarken || "balanced",
        stickersEnabled:
          stickersEnabled !== undefined ? stickersEnabled : Boolean((theme as any).stickersEnabled),
        stickerId:
          stickerId !== undefined ? stickerId : (theme as any).stickerId || "big_sale",
        stickerUrl:
          stickerUrl !== undefined ? stickerUrl : (theme as any).stickerUrl || null,
        stickerText:
          stickerText !== undefined ? stickerText : (theme as any).stickerText || "BIG SALE",
        stickerPosition:
          stickerPosition !== undefined ? stickerPosition : (theme as any).stickerPosition || "top-right",
        stickerAnimation:
          stickerAnimation !== undefined ? stickerAnimation : (theme as any).stickerAnimation || "float",
        stickerSize:
          stickerSize !== undefined ? stickerSize : (theme as any).stickerSize || "medium",
        stickerRotation:
          stickerRotation !== undefined ? stickerRotation : (theme as any).stickerRotation || "-6deg",
        stickerLink:
          stickerLink !== undefined ? stickerLink : (theme as any).stickerLink || null,
        stickerPosX:
          stickerPosX !== undefined ? stickerPosX : (theme as any).stickerPosX !== undefined ? Number((theme as any).stickerPosX) : 85,
        stickerPosY:
          stickerPosY !== undefined ? stickerPosY : (theme as any).stickerPosY !== undefined ? Number((theme as any).stickerPosY) : 12,
        wallpaperEffect:
          wallpaperEffect !== undefined ? wallpaperEffect : (theme as any).wallpaperEffect || "blur",
        wallpaperTint:
          wallpaperTint !== undefined ? wallpaperTint : (theme as any).wallpaperTint !== undefined ? Number((theme as any).wallpaperTint) : 20,
        wallpaperNoise:
          wallpaperNoise !== undefined ? wallpaperNoise : Boolean((theme as any).wallpaperNoise),
        gradientStyle:
          gradientStyle !== undefined ? gradientStyle : (theme as any).gradientStyle || "custom",
        gradientColor:
          gradientColor !== undefined ? gradientColor : (theme as any).gradientColor || "#778a00",
        gradientDirection:
          gradientDirection !== undefined ? gradientDirection : (theme as any).gradientDirection || "radial",
      },
    });
  } catch (error: any) {
    console.error("Theme update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update theme" }, { status: 400 });
  }
}

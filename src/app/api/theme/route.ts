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

    let backgroundVideo: string | null = null;
    let spotifyData: any = {};
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
      const rawTheme: any = await prisma.$queryRawUnsafe(
        "SELECT \"backgroundVideo\", \"spotifyMusicEnabled\", \"spotifyTrackUrl\", \"spotifyTrackTitle\", \"spotifyTrackArtist\", \"spotifyTrackImage\", \"spotifyTrackPreview\", \"spotifyMusicLayout\", \"spotifyMusicAutoplay\", \"heroBlur\", \"heroFade\", \"heroDarken\", \"stickersEnabled\", \"stickerId\", \"stickerUrl\", \"stickerText\", \"stickerPosition\", \"stickerAnimation\", \"stickerSize\", \"stickerRotation\", \"stickerLink\", \"stickerPosX\", \"stickerPosY\", \"wallpaperEffect\", \"wallpaperTint\", \"wallpaperNoise\", \"gradientStyle\", \"gradientColor\", \"gradientDirection\" FROM \"Theme\" WHERE \"profileId\" = ? LIMIT 1",
        profile.id
      );
      if (rawTheme?.[0]) {
        if (rawTheme[0].backgroundVideo) backgroundVideo = rawTheme[0].backgroundVideo;
        if (rawTheme[0].heroBlur) heroData.heroBlur = rawTheme[0].heroBlur;
        if (rawTheme[0].heroFade) heroData.heroFade = rawTheme[0].heroFade;
        if (rawTheme[0].heroDarken) heroData.heroDarken = rawTheme[0].heroDarken;
        spotifyData = {
          spotifyMusicEnabled: Boolean(rawTheme[0].spotifyMusicEnabled),
          spotifyTrackUrl: rawTheme[0].spotifyTrackUrl || null,
          spotifyTrackTitle: rawTheme[0].spotifyTrackTitle || null,
          spotifyTrackArtist: rawTheme[0].spotifyTrackArtist || null,
          spotifyTrackImage: rawTheme[0].spotifyTrackImage || null,
          spotifyTrackPreview: rawTheme[0].spotifyTrackPreview || null,
          spotifyMusicLayout: rawTheme[0].spotifyMusicLayout || "floating",
          spotifyMusicAutoplay: Boolean(rawTheme[0].spotifyMusicAutoplay),
        };
        stickerData = {
          stickersEnabled: Boolean(rawTheme[0].stickersEnabled),
          stickerId: rawTheme[0].stickerId || "big_sale",
          stickerUrl: rawTheme[0].stickerUrl || null,
          stickerText: rawTheme[0].stickerText || "BIG SALE",
          stickerPosition: rawTheme[0].stickerPosition || "top-right",
          stickerAnimation: rawTheme[0].stickerAnimation || "float",
          stickerSize: rawTheme[0].stickerSize || "medium",
          stickerRotation: rawTheme[0].stickerRotation || "-6deg",
          stickerLink: rawTheme[0].stickerLink || null,
          stickerPosX: rawTheme[0].stickerPosX !== null && rawTheme[0].stickerPosX !== undefined ? Number(rawTheme[0].stickerPosX) : 85,
          stickerPosY: rawTheme[0].stickerPosY !== null && rawTheme[0].stickerPosY !== undefined ? Number(rawTheme[0].stickerPosY) : 12,
        };
        wallpaperData = {
          wallpaperEffect: rawTheme[0].wallpaperEffect || "blur",
          wallpaperTint: rawTheme[0].wallpaperTint !== null && rawTheme[0].wallpaperTint !== undefined ? Number(rawTheme[0].wallpaperTint) : 20,
          wallpaperNoise: Boolean(rawTheme[0].wallpaperNoise),
          gradientStyle: rawTheme[0].gradientStyle || "custom",
          gradientColor: rawTheme[0].gradientColor || "#778a00",
          gradientDirection: rawTheme[0].gradientDirection || "radial",
        };
      }
    } catch { }

    const theme = {
      ...profile.theme,
      ...spotifyData,
      ...heroData,
      ...stickerData,
      ...wallpaperData,
      backgroundVideo: backgroundVideo || null,
    };

    return NextResponse.json({ theme });
  } catch (error) {
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

    // Separate backgroundVideo, Spotify, Hero Layout, and Stickers fields to keep Prisma client upsert backwards-compatible
    const {
      backgroundVideo,
      spotifyMusicEnabled,
      spotifyTrackUrl,
      spotifyTrackTitle,
      spotifyTrackArtist,
      spotifyTrackImage,
      spotifyTrackPreview,
      spotifyMusicLayout,
      spotifyMusicAutoplay,
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

    // Persist backgroundVideo
    if (backgroundVideo !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          "UPDATE \"Theme\" SET \"backgroundVideo\" = ? WHERE \"profileId\" = ?",
          backgroundVideo || null,
          profile.id
        );
      } catch (rawErr) {
        console.warn("Could not execute raw update on Theme.backgroundVideo:", rawErr);
      }
    }

    // Persist Spotify music fields directly
    if (
      spotifyMusicEnabled !== undefined ||
      spotifyTrackUrl !== undefined ||
      spotifyTrackTitle !== undefined ||
      spotifyTrackArtist !== undefined ||
      spotifyTrackImage !== undefined ||
      spotifyTrackPreview !== undefined ||
      spotifyMusicLayout !== undefined ||
      spotifyMusicAutoplay !== undefined
    ) {
      try {
        await prisma.$executeRawUnsafe(
          "UPDATE \"Theme\" SET \"spotifyMusicEnabled\" = ?, \"spotifyTrackUrl\" = ?, \"spotifyTrackTitle\" = ?, \"spotifyTrackArtist\" = ?, \"spotifyTrackImage\" = ?, \"spotifyTrackPreview\" = ?, \"spotifyMusicLayout\" = ?, \"spotifyMusicAutoplay\" = ? WHERE \"profileId\" = ?",
          spotifyMusicEnabled ? 1 : 0,
          spotifyTrackUrl || null,
          spotifyTrackTitle || null,
          spotifyTrackArtist || null,
          spotifyTrackImage || null,
          spotifyTrackPreview || null,
          spotifyMusicLayout || "floating",
          spotifyMusicAutoplay ? 1 : 0,
          profile.id
        );
      } catch (rawErr) {
        console.warn("Could not execute raw update on Theme Spotify fields:", rawErr);
      }
    }

    // Persist Hero Layout blur & fade fields directly
    if (heroBlur !== undefined || heroFade !== undefined || heroDarken !== undefined) {
      try {
        await prisma.$executeRawUnsafe(
          "UPDATE \"Theme\" SET \"heroBlur\" = COALESCE(?, \"heroBlur\"), \"heroFade\" = COALESCE(?, \"heroFade\"), \"heroDarken\" = COALESCE(?, \"heroDarken\") WHERE \"profileId\" = ?",
          heroBlur !== undefined ? heroBlur : null,
          heroFade !== undefined ? heroFade : null,
          heroDarken !== undefined ? heroDarken : null,
          profile.id
        );
      } catch (rawErr) {
        console.warn("Could not execute raw update on Theme Hero fields:", rawErr);
      }
    }

    // Persist Stickers fields directly
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
        await prisma.$executeRawUnsafe(
          "UPDATE \"Theme\" SET \"stickersEnabled\" = COALESCE(?, \"stickersEnabled\"), \"stickerId\" = COALESCE(?, \"stickerId\"), \"stickerUrl\" = COALESCE(?, \"stickerUrl\"), \"stickerText\" = COALESCE(?, \"stickerText\"), \"stickerPosition\" = COALESCE(?, \"stickerPosition\"), \"stickerAnimation\" = COALESCE(?, \"stickerAnimation\"), \"stickerSize\" = COALESCE(?, \"stickerSize\"), \"stickerRotation\" = COALESCE(?, \"stickerRotation\"), \"stickerLink\" = COALESCE(?, \"stickerLink\"), \"stickerPosX\" = COALESCE(?, \"stickerPosX\"), \"stickerPosY\" = COALESCE(?, \"stickerPosY\") WHERE \"profileId\" = ?",
          stickersEnabled !== undefined ? (stickersEnabled ? 1 : 0) : null,
          stickerId !== undefined ? stickerId : null,
          stickerUrl !== undefined ? stickerUrl : null,
          stickerText !== undefined ? stickerText : null,
          stickerPosition !== undefined ? stickerPosition : null,
          stickerAnimation !== undefined ? stickerAnimation : null,
          stickerSize !== undefined ? stickerSize : null,
          stickerRotation !== undefined ? stickerRotation : null,
          stickerLink !== undefined ? stickerLink : null,
          stickerPosX !== undefined ? stickerPosX : null,
          stickerPosY !== undefined ? stickerPosY : null,
          profile.id
        );
      } catch (rawErr) {
        console.warn("Could not execute raw update on Theme Stickers fields:", rawErr);
      }
    }

    // Persist Wallpaper & Gradient fields directly
    if (
      wallpaperEffect !== undefined ||
      wallpaperTint !== undefined ||
      wallpaperNoise !== undefined ||
      gradientStyle !== undefined ||
      gradientColor !== undefined ||
      gradientDirection !== undefined
    ) {
      try {
        await prisma.$executeRawUnsafe(
          "UPDATE \"Theme\" SET \"wallpaperEffect\" = COALESCE(?, \"wallpaperEffect\"), \"wallpaperTint\" = COALESCE(?, \"wallpaperTint\"), \"wallpaperNoise\" = COALESCE(?, \"wallpaperNoise\"), \"gradientStyle\" = COALESCE(?, \"gradientStyle\"), \"gradientColor\" = COALESCE(?, \"gradientColor\"), \"gradientDirection\" = COALESCE(?, \"gradientDirection\") WHERE \"profileId\" = ?",
          wallpaperEffect !== undefined ? wallpaperEffect : null,
          wallpaperTint !== undefined ? wallpaperTint : null,
          wallpaperNoise !== undefined ? (wallpaperNoise ? 1 : 0) : null,
          gradientStyle !== undefined ? gradientStyle : null,
          gradientColor !== undefined ? gradientColor : null,
          gradientDirection !== undefined ? gradientDirection : null,
          profile.id
        );
      } catch (rawErr) {
        console.warn("Could not execute raw update on Theme Wallpaper fields:", rawErr);
      }
    }

    return NextResponse.json({
      theme: {
        ...theme,
        heroBlur: heroBlur !== undefined ? heroBlur : (theme as any).heroBlur || "16px",
        heroFade: heroFade !== undefined ? heroFade : (theme as any).heroFade || "high",
        heroDarken: heroDarken !== undefined ? heroDarken : (theme as any).heroDarken || "balanced",
        spotifyMusicEnabled:
          spotifyMusicEnabled !== undefined ? spotifyMusicEnabled : (theme as any).spotifyMusicEnabled,
        spotifyTrackUrl:
          spotifyTrackUrl !== undefined ? spotifyTrackUrl : (theme as any).spotifyTrackUrl,
        spotifyTrackTitle:
          spotifyTrackTitle !== undefined ? spotifyTrackTitle : (theme as any).spotifyTrackTitle,
        spotifyTrackArtist:
          spotifyTrackArtist !== undefined ? spotifyTrackArtist : (theme as any).spotifyTrackArtist,
        spotifyTrackImage:
          spotifyTrackImage !== undefined ? spotifyTrackImage : (theme as any).spotifyTrackImage,
        spotifyTrackPreview:
          spotifyTrackPreview !== undefined ? spotifyTrackPreview : (theme as any).spotifyTrackPreview,
        spotifyMusicLayout:
          spotifyMusicLayout !== undefined ? spotifyMusicLayout : (theme as any).spotifyMusicLayout || "floating",
        spotifyMusicAutoplay:
          spotifyMusicAutoplay !== undefined ? spotifyMusicAutoplay : (theme as any).spotifyMusicAutoplay,
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
        backgroundVideo:
          backgroundVideo !== undefined
            ? backgroundVideo
            : (theme.backgroundImage || null),
      },
    });
  } catch (error: any) {
    console.error("Theme update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update theme" }, { status: 400 });
  }
}


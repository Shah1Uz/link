import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applyRequestSchema = z.object({
  target: z.enum(["bio", "headline", "theme", "link"]),
  generationId: z.string().optional(),
  payload: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { target, generationId, payload } = applyRequestSchema.parse(body);

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { theme: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let message = "Applied successfully";

    if (target === "bio") {
      const bioText = String(payload.bio || "").slice(0, 250);
      await prisma.profile.update({
        where: { id: profile.id },
        data: { bio: bioText },
      });
      message = "Bio applied to your profile!";
    } else if (target === "headline") {
      const titleText = String(payload.displayName || payload.headline || "").slice(0, 60);
      await prisma.profile.update({
        where: { id: profile.id },
        data: { displayName: titleText },
      });
      message = "Display name updated on your profile!";
    } else if (target === "theme") {
      const themeData = payload.theme || payload;

      // Update layout on Profile
      if (themeData.layout) {
        await prisma.profile.update({
          where: { id: profile.id },
          data: { layout: themeData.layout },
        });
      }

      // Upsert Theme
      await prisma.theme.upsert({
        where: { profileId: profile.id },
        update: {
          backgroundColor: themeData.backgroundColor || "#000000",
          backgroundType: themeData.backgroundType || "gradient",
          backgroundGradient: themeData.backgroundGradient || null,
          accentColor: themeData.accentColor || "#10b981",
          textColor: themeData.textColor || "#ffffff",
          buttonStyle: themeData.buttonStyle || "filled",
          buttonColor: themeData.buttonColor || "#10b981",
          buttonTextColor: themeData.buttonTextColor || "#042f2e",
          buttonBorderColor: themeData.buttonBorderColor || null,
          buttonRadius: themeData.buttonRadius || "18px",
          fontHeading: themeData.fontHeading || "Plus Jakarta Sans",
          fontBody: themeData.fontBody || "Inter",
        },
        create: {
          profileId: profile.id,
          backgroundColor: themeData.backgroundColor || "#000000",
          backgroundType: themeData.backgroundType || "gradient",
          backgroundGradient: themeData.backgroundGradient || null,
          accentColor: themeData.accentColor || "#10b981",
          textColor: themeData.textColor || "#ffffff",
          buttonStyle: themeData.buttonStyle || "filled",
          buttonColor: themeData.buttonColor || "#10b981",
          buttonTextColor: themeData.buttonTextColor || "#042f2e",
          buttonBorderColor: themeData.buttonBorderColor || null,
          buttonRadius: themeData.buttonRadius || "18px",
          fontHeading: themeData.fontHeading || "Plus Jakarta Sans",
          fontBody: themeData.fontBody || "Inter",
        },
      });
      message = "AI Theme applied to your profile!";
    } else if (target === "link") {
      const linkId = payload.linkId;
      if (!linkId) {
        return NextResponse.json({ error: "Missing linkId" }, { status: 400 });
      }

      await prisma.link.update({
        where: { id: linkId, profileId: profile.id },
        data: {
          title: payload.title,
          ...(payload.description !== undefined ? { description: payload.description } : {}),
        },
      });
      message = "Link title optimized!";
    }

    // Mark generation record as applied if ID provided
    if (generationId) {
      await prisma.aIGeneration.update({
        where: { id: generationId, userId: user.id },
        data: { isApplied: true },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      target,
      message,
    });
  } catch (error: any) {
    console.error("AI Apply API error:", error);
    return NextResponse.json({ error: error.message || "Failed to apply AI changes" }, { status: 500 });
  }
}


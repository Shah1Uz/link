import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { linkSchema } from "@/lib/validations";
import { detectPlatformFromUrl, formatUrlForHref } from "@/lib/utils";

// GET all links for current user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ links: [] });

    const links = await prisma.link.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isPinned: "desc" }, { position: "asc" }],
    });

    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch links" }, { status: 500 });
  }
}

// POST create link
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { links: true } } },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Subscription link limit check
    const platformSettings = await prisma.platformSettings.findUnique({ where: { id: "default" } });
    const maxFree = platformSettings?.maxFreeLinks ?? 10;
    if (user.subscriptionTier === "FREE" && profile._count.links >= maxFree) {
      return NextResponse.json(
        { error: `Free plan limit reached (${maxFree} links). Please upgrade to PRO for unlimited links.` },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = linkSchema.parse(body);

    const detectedIcon = validated.icon || detectPlatformFromUrl(validated.url);
    const sanitizedUrl = formatUrlForHref(validated.url, detectedIcon);

    // Get max position
    const lastLink = await prisma.link.findFirst({
      where: { profileId: profile.id },
      orderBy: { position: "desc" },
    });
    const position = lastLink ? lastLink.position + 1 : 0;

    const newLink = await prisma.link.create({
      data: {
        profileId: profile.id,
        title: validated.title,
        url: sanitizedUrl,
        description: validated.description || null,
        icon: detectedIcon,
        thumbnail: validated.thumbnail || null,
        displayMode: validated.displayMode || "link",
        collectionId: validated.collectionId || null,
        isEnabled: validated.isEnabled,
        isPinned: validated.isPinned,
        position,
        scheduledStart: validated.scheduledStart ? new Date(validated.scheduledStart) : null,
        scheduledEnd: validated.scheduledEnd ? new Date(validated.scheduledEnd) : null,
      },
    });

    return NextResponse.json({ link: newLink }, { status: 201 });
  } catch (error: any) {
    console.error("Create link error:", error);
    if (error instanceof ZodError) {
      const msg = error.issues.map((i) => i.message).join(". ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to create link" }, { status: 400 });
  }
}

// PUT reorder links batch
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { linkIds } = body; // Array of IDs in the new order

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: "Invalid linkIds array" }, { status: 400 });
    }

    // Verify ownership
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Update positions
    await Promise.all(
      linkIds.map((id, index) =>
        prisma.link.updateMany({
          where: { id, profileId: profile.id },
          data: { position: index },
        })
      )
    );

    const updatedLinks = await prisma.link.findMany({
      where: { profileId: profile.id },
      orderBy: [{ isPinned: "desc" }, { position: "asc" }],
    });

    return NextResponse.json({ links: updatedLinks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder links" }, { status: 500 });
  }
}


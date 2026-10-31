import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { collectionSchema } from "@/lib/validations";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ collections: [] });

    const collections = await prisma.collection.findMany({
      where: { profileId: profile.id },
      include: { links: true },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const validated = collectionSchema.parse(body);

    const lastCol = await prisma.collection.findFirst({
      where: { profileId: profile.id },
      orderBy: { position: "desc" },
    });
    const position = lastCol ? lastCol.position + 1 : 0;

    const collection = await prisma.collection.create({
      data: {
        profileId: profile.id,
        title: validated.title,
        description: validated.description || null,
        position,
        isCollapsed: validated.isCollapsed,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create collection" }, { status: 400 });
  }
}


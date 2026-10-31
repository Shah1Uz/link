import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { collectionSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const col = await prisma.collection.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!col) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    const body = await request.json();
    const validated = collectionSchema.partial().parse(body);

    const updated = await prisma.collection.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ collection: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update collection" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const col = await prisma.collection.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!col) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    // When deleting a collection, links inside have collectionId set to null (onDelete: SetNull in Prisma schema)
    await prisma.collection.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}


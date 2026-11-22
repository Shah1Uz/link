import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      position: z.number().int(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { items } = reorderSchema.parse(body);

    // Update positions in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.updateMany({
          where: {
            id: item.id,
            profileId: user.profile!.id, // security constraint: ensure creator owns the item
          },
          data: { position: item.position },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
    }
    console.error("Products reorder error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(2, "Product title must be at least 2 characters").max(100),
  description: z.string().max(500).optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().default("USD"),
  imageUrl: z.string().url().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  externalUrl: z.string().url().optional().nullable(),
  isDigital: z.boolean().default(true),
  isEnabled: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { profileId: user.profile.id },
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = productSchema.parse(body);

    const count = await prisma.product.count({
      where: { profileId: user.profile.id },
    });

    const product = await prisma.product.create({
      data: {
        profileId: user.profile.id,
        title: validated.title,
        description: validated.description || null,
        price: validated.price,
        currency: validated.currency,
        imageUrl: validated.imageUrl || null,
        fileUrl: validated.fileUrl || null,
        externalUrl: validated.externalUrl || null,
        isDigital: validated.isDigital,
        isEnabled: validated.isEnabled,
        position: count,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.product.findFirst({
      where: { id, profileId: user.profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    const validated = productSchema.partial().parse(data);

    const updated = await prisma.product.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Products PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const existing = await prisma.product.findFirst({
      where: { id, profileId: user.profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Products DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


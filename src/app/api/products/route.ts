import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { productCreateSchema, productUpdateSchema } from "@/lib/validations/product";
import { getProductLimitByTier } from "@/lib/store/config";
import { z } from "zod";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { profileId: user.profile.id },
      orderBy: [{ isFeatured: "desc" }, { position: "asc" }, { createdAt: "desc" }],
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    // Also get creator's subscription plan & product limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    const tier = subscription?.plan || "FREE";
    const maxProducts = getProductLimitByTier(tier);

    return NextResponse.json({
      products,
      subscription: {
        tier,
        maxProducts,
        currentCount: products.length,
        canAddMore: products.length < maxProducts,
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Subscription Product Limit Check
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    const tier = subscription?.plan || "FREE";
    const maxProducts = getProductLimitByTier(tier);

    const currentCount = await prisma.product.count({
      where: { profileId: user.profile.id },
    });

    if (currentCount >= maxProducts) {
      return NextResponse.json(
        {
          error: `You have reached the maximum product limit (${maxProducts}) for your ${tier} plan. Please upgrade to Pro to add more products.`,
          tier,
          limit: maxProducts,
          currentCount,
        },
        { status: 403 }
      );
    }

    // 2. Validate input
    const body = await req.json();
    const validated = productCreateSchema.parse(body);

    // 3. Create product
    const product = await prisma.product.create({
      data: {
        profileId: user.profile.id,
        title: validated.title,
        description: validated.description || null,
        price: validated.price,
        currency: validated.currency || "USD",
        imageUrl: validated.imageUrl || null,
        galleryUrls: validated.galleryUrls && validated.galleryUrls.length > 0 ? JSON.stringify(validated.galleryUrls) : null,
        fileUrl: validated.fileUrl || null,
        externalUrl: validated.externalUrl || null,
        type: validated.type,
        category: validated.category || "General",
        categoryId: validated.categoryId || null,
        isDigital: validated.isDigital,
        isEnabled: validated.isEnabled,
        isFeatured: validated.isFeatured,
        position: currentCount,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Products POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = productUpdateSchema.parse(body);

    // Verify ownership
    const existing = await prisma.product.findFirst({
      where: { id: validated.id, profileId: user.profile.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    const updateData: any = {};
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.price !== undefined) updateData.price = validated.price;
    if (validated.currency !== undefined) updateData.currency = validated.currency;
    if (validated.imageUrl !== undefined) updateData.imageUrl = validated.imageUrl || null;
    if (validated.galleryUrls !== undefined) {
      updateData.galleryUrls = validated.galleryUrls && validated.galleryUrls.length > 0 ? JSON.stringify(validated.galleryUrls) : null;
    }
    if (validated.fileUrl !== undefined) updateData.fileUrl = validated.fileUrl || null;
    if (validated.externalUrl !== undefined) updateData.externalUrl = validated.externalUrl || null;
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.category !== undefined) updateData.category = validated.category;
    if (validated.categoryId !== undefined) updateData.categoryId = validated.categoryId || null;
    if (validated.isDigital !== undefined) updateData.isDigital = validated.isDigital;
    if (validated.isEnabled !== undefined) updateData.isEnabled = validated.isEnabled;
    if (validated.isFeatured !== undefined) updateData.isFeatured = validated.isFeatured;

    const updated = await prisma.product.update({
      where: { id: validated.id },
      data: updateData,
    });

    return NextResponse.json({ product: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Products PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
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

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Products DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

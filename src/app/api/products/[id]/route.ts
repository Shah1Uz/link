import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPremiumTier } from "@/lib/utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            verified: true,
            user: {
              select: {
                subscriptionTier: true,
              },
            },
          },
        },
      },
    });

    if (!product || !product.isEnabled) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const sanitizedProduct = {
      ...product,
      profile: {
        id: product.profile.id,
        username: product.profile.username,
        displayName: product.profile.displayName,
        avatarUrl: product.profile.avatarUrl,
        verified: Boolean(
          product.profile.verified &&
            isPremiumTier(product.profile.user?.subscriptionTier)
        ),
      },
    };

    return NextResponse.json({ product: sanitizedProduct });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


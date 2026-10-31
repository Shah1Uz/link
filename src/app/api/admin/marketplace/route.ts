import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { userHasPermission, logAdminAction } from "@/lib/rbac";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "marketplace:read")) {
      return NextResponse.json({ error: "Forbidden: Admin permission required" }, { status: 403 });
    }

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categoryRel: true,
        _count: {
          select: {
            purchases: true,
            reviews: true,
          },
        },
      },
    });

    const categories = await prisma.templateCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        _count: {
          select: { templates: true },
        },
      },
    });

    const totalPurchases = await prisma.templatePurchase.count();
    const totalRevenue = await prisma.templatePurchase.aggregate({
      _sum: { price: true },
    });

    return NextResponse.json({
      templates,
      categories,
      metrics: {
        totalTemplates: templates.length,
        totalPurchases,
        totalRevenue: totalRevenue._sum.price || 0,
      },
    });
  } catch (error) {
    console.error("Admin marketplace GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "marketplace:moderate")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { templateId, isFeatured, isPublished, price } = body;

    if (!templateId) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    const updated = await prisma.template.update({
      where: { id: templateId },
      data: {
        ...(typeof isFeatured === "boolean" ? { isFeatured } : {}),
        ...(typeof isPublished === "boolean" ? { isPublished } : {}),
        ...(typeof price === "number" ? { price, isPro: price > 0 } : {}),
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "UPDATE_MARKETPLACE_TEMPLATE",
      targetResource: "TEMPLATE",
      targetId: templateId,
      details: { isFeatured, isPublished, price },
    });

    return NextResponse.json({ template: updated });
  } catch (error) {
    console.error("Admin marketplace PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


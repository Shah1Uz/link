import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const body = await request.json();
    const { name, slug, category, description, layout, stylesJson, isPro, isPublished, isFeatured } = body;

    if (!name || !slug || !category || !description) {
      return NextResponse.json({ error: "Missing required template fields" }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
        category,
        description,
        layout: layout || "classic",
        stylesJson: stylesJson || JSON.stringify({}),
        isPro: Boolean(isPro),
        isPublished: isPublished ?? true,
        isFeatured: Boolean(isFeatured),
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "TEMPLATE_CREATED",
        targetResource: "TEMPLATE",
        targetId: template.id,
        details: JSON.stringify({ name, slug }),
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Template ID is required" }, { status: 400 });

    const updated = await prisma.template.update({
      where: { id },
      data: updates,
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "TEMPLATE_UPDATED",
        targetResource: "TEMPLATE",
        targetId: id,
        details: JSON.stringify(updates),
      },
    });

    return NextResponse.json({ template: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update template" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Template ID is required" }, { status: 400 });

    await prisma.template.delete({ where: { id } });

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "TEMPLATE_DELETED",
        targetResource: "TEMPLATE",
        targetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}


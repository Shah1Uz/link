import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const tier = searchParams.get("tier") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { profile: { username: { contains: search } } },
      ];
    }
    if (role) where.role = role;
    if (tier) where.subscriptionTier = tier;

    const users = await prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            verified: true,
            isPublished: true,
            _count: { select: { links: true, analyticsEvents: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const body = await request.json();
    const { userId, role, isSuspended, isBanned, subscriptionTier } = body;

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Write to immutable AdminAuditLog
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: `USER_UPDATE_${Object.keys(updateData).join("_").toUpperCase()}`,
        targetResource: "USER",
        targetId: userId,
        details: JSON.stringify(updateData),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    if (userId === admin.id) return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });

    await prisma.user.delete({
      where: { id: userId },
    });

    // Write to immutable AdminAuditLog
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "USER_DELETED",
        targetResource: "USER",
        targetId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}


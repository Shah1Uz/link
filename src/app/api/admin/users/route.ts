import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession, ensureUserProfile } from "@/lib/auth";
import { isPremiumTier } from "@/lib/utils";

const SAFE_USER_SELECT = {
  id: true,
  clerkId: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  isSuspended: true,
  isBanned: true,
  subscriptionTier: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      verified: true,
      isPublished: true,
      layout: true,
      _count: {
        select: {
          links: true,
          analyticsEvents: true,
          customDomains: true,
          orders: true,
        },
      },
    },
  },
};

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const tier = searchParams.get("tier") || "";
    const verifiedParam = searchParams.get("verified") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { profile: { username: { contains: search } } },
        { profile: { displayName: { contains: search } } },
      ];
    }
    if (role) where.role = role;
    if (tier) where.subscriptionTier = tier;
    if (verifiedParam === "true") {
      where.AND = [
        ...(where.AND || []),
        { subscriptionTier: { in: ["PRO", "BUSINESS"] } },
        { profile: { is: { verified: true } } },
      ];
    } else if (verifiedParam === "false") {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { subscriptionTier: { notIn: ["PRO", "BUSINESS"] } },
            { NOT: { profile: { is: { verified: true } } } },
          ],
        },
      ];
    }

    const rawUsers = await prisma.user.findMany({
      where,
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    const users = rawUsers.map((u) => ({
      ...u,
      profile: u.profile
        ? {
            ...u.profile,
            verified: Boolean(u.profile.verified && isPremiumTier(u.subscriptionTier)),
          }
        : null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, isSuspended, isBanned, subscriptionTier, verified } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const effectiveTier =
      subscriptionTier !== undefined ? subscriptionTier : targetUser.subscriptionTier;

    if (verified === true && !isPremiumTier(effectiveTier)) {
      return NextResponse.json(
        {
          error:
            "Ko'k galochka (Verified badge) faqat Premium (PRO) obuna olgan foydalanuvchilarga beriladi.",
        },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isSuspended !== undefined) updateData.isSuspended = isSuspended;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (subscriptionTier !== undefined) updateData.subscriptionTier = subscriptionTier;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    const auditDetails: Record<string, any> = { ...updateData };

    const shouldAutoRevokeVerified =
      subscriptionTier !== undefined &&
      !isPremiumTier(subscriptionTier) &&
      verified === undefined &&
      Boolean(targetUser.profile?.verified);

    const nextVerified =
      verified !== undefined
        ? Boolean(verified) && isPremiumTier(effectiveTier)
        : shouldAutoRevokeVerified
          ? false
          : undefined;

    if (nextVerified !== undefined) {
      if (!targetUser.profile) {
        await ensureUserProfile(targetUser);
      }
      await prisma.profile.update({
        where: { userId },
        data: { verified: nextVerified },
      });
      auditDetails.verified = nextVerified;
      if (shouldAutoRevokeVerified) {
        auditDetails.autoRevokedVerified = true;
      }
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    const actionLabel =
      nextVerified !== undefined && Object.keys(updateData).length === 0
        ? nextVerified
          ? "PROFILE_VERIFIED_GRANTED"
          : "PROFILE_VERIFIED_REVOKED"
        : `USER_UPDATE_${Object.keys(auditDetails).join("_").toUpperCase()}`;

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: actionLabel,
        targetResource: "USER",
        targetId: userId,
        details: JSON.stringify(auditDetails),
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    console.error("Admin update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }
    if (userId === admin.id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

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

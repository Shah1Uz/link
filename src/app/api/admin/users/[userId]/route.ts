import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { isPremiumTier } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { userId } = await context.params;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const [user, activityLogs, adminAuditLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isSuspended: true,
          isBanned: true,
          subscriptionTier: true,
          notifyClickMilestones: true,
          notifyWeeklyDigest: true,
          notifyProductNews: true,
          createdAt: true,
          updatedAt: true,
          subscription: true,
          aiUsage: true,
          profile: {
            include: {
              theme: true,
              links: {
                orderBy: [{ isPinned: "desc" }, { position: "asc" }],
                include: {
                  collection: {
                    select: { id: true, title: true },
                  },
                },
              },
              collections: {
                orderBy: { position: "asc" },
              },
              customDomains: {
                orderBy: { createdAt: "desc" },
              },
              products: {
                orderBy: { createdAt: "desc" },
              },
              orders: {
                orderBy: { createdAt: "desc" },
                take: 50,
                include: {
                  product: {
                    select: { id: true, title: true, type: true },
                  },
                },
              },
              socialAccounts: true,
              subscribers: {
                orderBy: { createdAt: "desc" },
                take: 25,
                select: {
                  id: true,
                  email: true,
                  name: true,
                  status: true,
                  subscribedAt: true,
                },
              },
              bookings: {
                orderBy: { startTime: "desc" },
                take: 25,
                include: {
                  appointmentType: {
                    select: { title: true, duration: true },
                  },
                },
              },
              _count: {
                select: {
                  links: true,
                  collections: true,
                  customDomains: true,
                  products: true,
                  orders: true,
                  subscribers: true,
                  bookings: true,
                  analyticsEvents: true,
                  profileViews: true,
                  linkClicks: true,
                },
              },
            },
          },
        },
      }),
      prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 60,
      }),
      prisma.adminAuditLog.findMany({
        where: { targetResource: "USER", targetId: userId },
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrichedUser: any = {
      ...user,
      profile: user.profile
        ? {
            ...user.profile,
            verified: Boolean(
              user.profile.verified && isPremiumTier(user.subscriptionTier)
            ),
          }
        : null,
    };

    return NextResponse.json({
      user: enrichedUser,
      activityLogs,
      adminAuditLogs,
    });
  } catch (error) {
    console.error("Admin fetch user details error:", error);
    return NextResponse.json(
      { error: "Failed to load user details" },
      { status: 500 }
    );
  }
}

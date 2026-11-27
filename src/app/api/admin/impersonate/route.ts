import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyAdminSession,
  ensureUserProfile,
  createImpersonationToken,
  IMPERSONATION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const targetUserId = body?.targetUserId;
    if (!targetUserId || typeof targetUserId !== "string") {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    if (targetUserId === admin.id) {
      return NextResponse.json(
        { error: "You are already signed in as this account" },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { profile: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!targetUser.profile) {
      await ensureUserProfile(targetUser);
    }

    const token = createImpersonationToken(admin.id, targetUserId);

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "USER_IMPERSONATION_STARTED",
        targetResource: "USER",
        targetId: targetUserId,
        details: JSON.stringify({
          targetEmail: targetUser.email,
          targetUsername: targetUser.profile?.username || null,
        }),
      },
    });

    const response = NextResponse.json({
      success: true,
      redirectUrl: "/dashboard",
      targetEmail: targetUser.email,
    });

    response.cookies.set(IMPERSONATION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    console.error("Start impersonation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start impersonation" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: "USER_IMPERSONATION_STOPPED",
        targetResource: "USER",
        targetId: admin.id,
      },
    });

    const response = NextResponse.json({
      success: true,
      redirectUrl: "/admin/users",
    });

    response.cookies.set(IMPERSONATION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("Stop impersonation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to stop impersonation" },
      { status: 500 }
    );
  }
}

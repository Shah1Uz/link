import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, ensureUserProfile, isEmailInAdminAllowlist } from "@/lib/auth";
import { isReservedUsername } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { clerkUsername, displayName, avatarUrl, email } = body;

    let candidate = (clerkUsername || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

    // Fallback if clerkUsername is empty or too short: try email or name
    if (!candidate || candidate.length < 3) {
      if (email && !email.endsWith("@clerk.user")) {
        candidate = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }
    }
    if (!candidate || candidate.length < 3) {
      if (displayName) {
        candidate = displayName.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }
    }

    // If still no candidate, ensure profile exists and return current username
    if (!candidate || candidate.length < 3) {
      let currentProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
      if (!currentProfile) {
        await ensureUserProfile(user);
        currentProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
      }
      return NextResponse.json({ success: true, username: currentProfile?.username });
    }

    // Find if candidate is available or already owned by this user
    let targetUsername = candidate.slice(0, 24);
    let counter = 1;
    while (true) {
      const isReserved = isReservedUsername(targetUsername);
      const taken = await prisma.profile.findUnique({
        where: { username: targetUsername },
      });

      if (!isReserved && (!taken || taken.userId === user.id)) {
        break;
      }
      targetUsername = `${candidate.slice(0, 20)}${counter}`;
      counter++;
    }

    // Check existing profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      // Update if current username is generic or different from desired Clerk username
      const isGeneric =
        existingProfile.username.startsWith("creator_") ||
        existingProfile.username.startsWith("biospacecreator") ||
        existingProfile.username.startsWith("user_");

      if (isGeneric || (clerkUsername && existingProfile.username !== targetUsername)) {
        await prisma.profile.update({
          where: { id: existingProfile.id },
          data: {
            username: targetUsername,
            displayName: displayName || existingProfile.displayName || targetUsername,
            ...(avatarUrl && !existingProfile.avatarUrl ? { avatarUrl } : {}),
          },
        });
      }
    } else {
      // Create new profile with the clerk username
      await ensureUserProfile(user, targetUsername);
    }

    // Also update user record email & name if better info provided
    const effectiveEmail = (email || user.email || "").toLowerCase();
    const isEmailAdmin = isEmailInAdminAllowlist(effectiveEmail);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(email && email !== user.email && !email.endsWith("@clerk.user") ? { email } : {}),
        ...(displayName ? { name: displayName } : {}),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
        ...(isEmailAdmin && user.role !== "SUPER_ADMIN" ? { role: "ADMIN" } : {}),
      },
    });

    return NextResponse.json({ success: true, username: targetUsername });
  } catch (error: any) {
    console.error("Clerk sync error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync" }, { status: 500 });
  }
}

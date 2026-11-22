import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { isEmailInAdminAllowlist } from "@/lib/auth";
import { usernameRegex } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, username } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || "").trim() || "BioSpace Creator";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    // Check optional username availability
    let cleanUsername = "";
    if (username && typeof username === "string" && username.trim().length > 0) {
      cleanUsername = username.trim().toLowerCase();
      if (!usernameRegex.test(cleanUsername)) {
        return NextResponse.json({ error: "Username can only contain letters, numbers, underscores, and hyphens (3-30 chars)." }, { status: 400 });
      }
      const existingProfile = await prisma.profile.findUnique({
        where: { username: cleanUsername },
      });
      if (existingProfile) {
        return NextResponse.json({ error: "This username is already taken. Please choose another." }, { status: 400 });
      }
    }

    // Generate secure password hash
    const passwordHash = hashPassword(password);
    const isAdmin = isEmailInAdminAllowlist(cleanEmail);
    const customClerkId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create user in database
    const user = await prisma.user.create({
      data: {
        clerkId: customClerkId,
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role: isAdmin ? "ADMIN" : "USER",
        subscriptionTier: "FREE",
      },
    });

    // If username provided, create initial profile and theme
    if (cleanUsername) {
      const profile = await prisma.profile.create({
        data: {
          userId: user.id,
          username: cleanUsername,
          displayName: cleanName,
          bio: "Welcome to my BioSpace profile!",
          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
          category: "CREATOR",
          isPublished: true,
          newsletterEnabled: false,
          bookingEnabled: false,
        },
      });

      // Default theme
      await prisma.theme.create({
        data: {
          profileId: profile.id,
          backgroundColor: "#0d1117",
          backgroundType: "gradient",
          backgroundGradient: "linear-gradient(135deg, #0d1117 0%, #161b22 50%, #064e3b 100%)",
          buttonStyle: "filled",
          buttonColor: "#10b981",
          buttonTextColor: "#042f2e",
          buttonBorderColor: "#34d399",
          buttonRadius: "16px",
          fontHeading: "Plus Jakarta Sans",
          textColor: "#f0fdf4",
          accentColor: "#10b981",
        },
      });
    }

    // Set secure HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set("biospace_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
      },
      hasProfile: Boolean(cleanUsername),
    });
  } catch (error: any) {
    console.error("Direct registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}


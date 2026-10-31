import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT" | "USER";

export interface AuthenticatedUser {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  subscriptionTier: "FREE" | "PRO" | "BUSINESS";
  isSuspended: boolean;
  isBanned: boolean;
  profile?: {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    category: string;
    verified: boolean;
    layout: string;
  } | null;
}

/**
 * Checks if an email address is in the administrator allowlist
 */
export function isEmailInAdminAllowlist(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.toLowerCase());
}

export function isLiveClerkKeyConfigured(): boolean {
  const secret = process.env.CLERK_SECRET_KEY || "";
  const pub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  return (
    secret.length > 25 &&
    !secret.includes("demo_secret_key") &&
    !secret.includes("…") &&
    !secret.includes("...") &&
    (secret.startsWith("sk_test_") || secret.startsWith("sk_live_")) &&
    pub.length > 25 &&
    !pub.includes("demo")
  );
}

/**
 * Retrieves the currently authenticated user from Prisma database,
 * synchronizing with Clerk session or falling back to demo user if keys are unconfigured.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    let clerkUser = null;
    if (isLiveClerkKeyConfigured()) {
      try {
        const { userId } = await auth();
        if (userId) {
          clerkUser = await currentUser();
        }
      } catch {
        clerkUser = null;
      }
    }

    if (clerkUser) {
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress || "";
      const isAdminByEmail = isEmailInAdminAllowlist(primaryEmail);

      // Find or upsert user in database
      const user = await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
          email: primaryEmail,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          avatar: clerkUser.imageUrl || null,
          ...(isAdminByEmail ? { role: "ADMIN" } : {}),
        },
        create: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null,
          avatar: clerkUser.imageUrl || null,
          role: isAdminByEmail ? "ADMIN" : "USER",
          subscriptionTier: "FREE",
        },
        include: {
          profile: true,
        },
      });

      return user as unknown as AuthenticatedUser;
    }

    // In local development or demo inspection without Clerk keys, return demo user
    const demoUser = await prisma.user.findFirst({
      where: { email: "alex@creator.dev" },
      include: { profile: true },
    });

    if (demoUser) {
      return demoUser as unknown as AuthenticatedUser;
    }

    return null;
  } catch (error) {
    console.error("Authentication resolution error:", error);
    return null;
  }
}

/**
 * Strictly verifies admin role server-side.
 * Returns the admin user or null if unauthorized.
 */
export async function verifyAdminSession(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser();
  if (!user) return null;

  if (
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    user.role === "SUPPORT" ||
    isEmailInAdminAllowlist(user.email)
  ) {
    return user;
  }

  return null;
}


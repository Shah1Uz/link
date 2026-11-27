import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./prisma";
import { isReservedUsername } from "./validations";

export const IMPERSONATION_COOKIE_NAME = "biospace_impersonate";

function getImpersonationSecret(): string {
  return (
    process.env.IMPERSONATION_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.DATABASE_URL ||
    "biospace-local-impersonation-secret"
  );
}

export function createImpersonationToken(
  adminId: string,
  targetUserId: string,
  ttlMs = 3600 * 1000
): string {
  const expiresAt = Date.now() + ttlMs;
  const payload = `${targetUserId}.${adminId}.${expiresAt}`;
  const sig = crypto
    .createHmac("sha256", getImpersonationSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

export function verifyImpersonationToken(
  token: string,
  expectedAdminId: string
): { targetUserId: string; adminId: string; expiresAt: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 4) return null;
    const [targetUserId, adminId, expiresAtStr, sigHex] = parts;
    if (!targetUserId || !adminId || !expiresAtStr || !sigHex) return null;
    if (adminId !== expectedAdminId) return null;

    const expiresAt = Number(expiresAtStr);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;

    const expectedSig = crypto
      .createHmac("sha256", getImpersonationSecret())
      .update(`${targetUserId}.${adminId}.${expiresAtStr}`)
      .digest("hex");

    const sigBuf = Buffer.from(sigHex, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

    return { targetUserId, adminId, expiresAt };
  } catch {
    return null;
  }
}

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
  impersonatedBy?: {
    id: string;
    email: string;
    name: string | null;
  } | null;
  profile?: {
    id: string;
    username: string;
    displayName: string | null;
    bio: string | null;
    avatarUrl: string | null;
    category: string;
    verified: boolean;
    layout: string;
    newsletterEnabled?: boolean;
    newsletterTitle?: string;
    newsletterDescription?: string | null;
    newsletterButtonText?: string;
    newsletterPlaceholder?: string;
    newsletterSuccessMessage?: string;
    newsletterLayout?: string;
    bookingEnabled?: boolean;
    bookingTitle?: string;
    bookingDescription?: string | null;
    bookingTimezone?: string;
  } | null;
}

/**
 * Checks if an email address is in the administrator allowlist
 */
export function isEmailInAdminAllowlist(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === "shahuztech@gmail.com") return true;

  const allowlist = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(cleanEmail);
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

function getClerkFrontendApi(): string {
  const pub = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  try {
    const b64 = pub.replace(/^pk_(?:test|live)_/, "");
    const decoded = Buffer.from(b64, "base64").toString("utf-8").replace(/\$$/, "");
    if (decoded && decoded.includes(".")) {
      return `https://${decoded}`;
    }
  } catch {}
  return "https://live-halibut-6305.clerk.accounts.dev";
}

/**
 * Guarantees that a user has a valid BioSpace Profile and default Theme.
 * Automatically derives a unique username from:
 * 1. preferredUsername (from Clerk: clerkUser.username)
 * 2. email username part (before @)
 * 3. user.name
 * 4. fallback creator_<id>
 * If the username is already taken by another user, adds a number suffix (e.g. username1, username2)
 * so it never collides or crashes with a unique constraint failure.
 */
export async function ensureUserProfile(
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    avatar?: string | null;
  },
  preferredUsername?: string | null
) {
  // Check if profile already exists for this user
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      theme: true,
      links: { orderBy: [{ isPinned: "desc" }, { position: "asc" }] },
      collections: { orderBy: { position: "asc" } },
    },
  });

  if (existingProfile) {
    if (preferredUsername) {
      const cleanPreferred = preferredUsername.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
      const isGeneric =
        existingProfile.username.startsWith("creator_") ||
        existingProfile.username.startsWith("biospacecreator") ||
        existingProfile.username.startsWith("user_");

      if (cleanPreferred && cleanPreferred.length >= 3 && isGeneric && cleanPreferred !== existingProfile.username) {
        const taken = await prisma.profile.findUnique({ where: { username: cleanPreferred } });
        if (!taken || taken.userId === user.id) {
          await prisma.profile.update({
            where: { id: existingProfile.id },
            data: { username: cleanPreferred },
          });
        }
      }
    }

    if (!existingProfile.theme) {
      await prisma.theme.create({
        data: {
          profileId: existingProfile.id,
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
          showBranding: true,
        },
      });
    }
    return prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
  }

  // 1. Candidate from preferredUsername
  let candidate = (preferredUsername || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

  // 2. Candidate from email prefix (if not a placeholder clerk.user)
  if (!candidate || candidate.length < 3) {
    if (user.email && !user.email.endsWith("@clerk.user")) {
      candidate = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
    }
  }

  // 3. Candidate from name
  if (!candidate || candidate.length < 3) {
    if (user.name) {
      candidate = user.name.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 20);
    }
  }

  // 4. Candidate fallback
  if (!candidate || candidate.length < 3) {
    candidate = `creator_${user.id.slice(-6)}`;
  }

  candidate = candidate.slice(0, 24);

  // Find unique username
  let finalUsername = candidate;
  let counter = 1;
  while (true) {
    const isReserved = isReservedUsername(finalUsername);
    const taken = await prisma.profile.findUnique({
      where: { username: finalUsername },
    });

    if (!isReserved && (!taken || taken.userId === user.id)) {
      break;
    }

    finalUsername = `${candidate}${counter}`;
    counter++;
  }

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      username: finalUsername,
      displayName: user.name || finalUsername,
      bio: "Welcome to my BioSpace profile! Connect with me through my links below.",
      avatarUrl: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      category: "CREATOR",
      isPublished: true,
    },
  });

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
      showBranding: true,
    },
  });

  return prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
}

/**
 * Queries Clerk frontend client API using active __session cookie
 * to resolve Clerk user profile even when secret key is not configured locally.
 */
async function fetchClerkUserFromClient(sessionToken: string): Promise<{
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  username: string | null;
} | null> {
  try {
    const host = getClerkFrontendApi();
    const res = await fetch(`${host}/v1/client`, {
      headers: {
        Cookie: `__session=${sessionToken}`,
        "User-Agent": "BioSpace/1.0",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const sessions = json.response?.sessions || json.client?.sessions || [];
    if (sessions.length > 0 && sessions[0].user) {
      const u = sessions[0].user;
      return {
        id: u.id as string,
        email: (u.email_addresses?.[0]?.email_address as string) || "",
        name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || null,
        avatar: (u.image_url as string) || null,
        username: (u.username as string) || null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Retrieves the currently authenticated user from Prisma database.
 * Supports:
 * 1. Direct session cookie ("biospace_session")
 * 2. Standard Clerk auth ("@clerk/nextjs")
 * 3. Fallback Clerk session JWT / client sync ("__session")
 * 4. Local dev / test runner fallback ("alex@creator.dev")
 */
async function resolveBaseAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    let cookieStore = null;
    try {
      cookieStore = await cookies();
    } catch {
      // In standalone scripts or tests where Next.js headers are not available
      cookieStore = null;
    }

    // 1. Check Direct Email Session Cookie first
    if (cookieStore) {
      const directUserId = cookieStore.get("biospace_session")?.value;
      if (directUserId) {
        const directUser = await prisma.user.findUnique({
          where: { id: directUserId },
          include: { profile: true },
        });

        if (directUser && !directUser.isBanned) {
          return directUser as unknown as AuthenticatedUser;
        }
      }
    }

    // 2. Standard Clerk Authentication (when secret key is valid)
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
      const clerkUsername = clerkUser.username || null;
      const clerkName = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || null;
      const clerkAvatar = clerkUser.imageUrl || null;
      const isAdminByEmail = isEmailInAdminAllowlist(primaryEmail);

      // Check if user already exists in DB by clerkId OR email to prevent duplication
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { clerkId: clerkUser.id },
            ...(primaryEmail ? [{ email: primaryEmail }] : []),
          ],
        },
        include: { profile: true },
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkId: clerkUser.id,
            email: primaryEmail || user.email,
            name: clerkName || user.name,
            avatar: clerkAvatar || user.avatar,
            ...(isAdminByEmail ? { role: "ADMIN" } : {}),
          },
          include: { profile: true },
        });
      } else {
        user = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: primaryEmail || `${clerkUser.id}@clerk.user`,
            name: clerkName,
            avatar: clerkAvatar,
            role: isAdminByEmail ? "ADMIN" : "USER",
            subscriptionTier: "FREE",
          },
          include: { profile: true },
        });
      }

      // Automatically guarantee Profile and Theme exist from Clerk details!
      if (!user.profile) {
        const withProfile = await ensureUserProfile(user, clerkUsername);
        if (withProfile) user = withProfile as any;
      }

      return user as unknown as AuthenticatedUser;
    }

    // 3. Fallback: Parse Clerk __session cookie directly if user signed up on frontend
    if (cookieStore) {
      const clerkSessionJwt = cookieStore.get("__session")?.value;
      if (clerkSessionJwt) {
        try {
          const parts = clerkSessionJwt.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
            const clerkId = payload.sub;

            if (clerkId && typeof clerkId === "string" && clerkId.startsWith("user_")) {
              // Fetch user metadata from Clerk client API
              const fetched = await fetchClerkUserFromClient(clerkSessionJwt);
              const email = fetched?.email || (payload.email as string) || "";
              const name = fetched?.name || (payload.name as string) || null;
              const avatar = fetched?.avatar || null;
              const clerkUsername =
                fetched?.username ||
                (payload.username as string) ||
                (payload.preferred_username as string) ||
                null;
              const isAdmin = email ? isEmailInAdminAllowlist(email) : false;

              // Check if user already exists in DB by clerkId OR by email
              let existingUser = await prisma.user.findFirst({
                where: {
                  OR: [
                    { clerkId },
                    ...(email ? [{ email }] : []),
                  ],
                },
                include: { profile: true },
              });

              if (existingUser) {
                existingUser = await prisma.user.update({
                  where: { id: existingUser.id },
                  data: {
                    clerkId,
                    ...(email ? { email } : {}),
                    ...(name ? { name } : {}),
                    ...(avatar ? { avatar } : {}),
                    ...(isAdmin ? { role: "ADMIN" } : {}),
                  },
                  include: { profile: true },
                });
              } else {
                existingUser = await prisma.user.create({
                  data: {
                    clerkId,
                    email: email || `${clerkId}@clerk.user`,
                    name: name || "BioSpace Creator",
                    avatar,
                    role: isAdmin ? "ADMIN" : "USER",
                    subscriptionTier: "FREE",
                  },
                  include: { profile: true },
                });
              }

              // Automatically guarantee Profile and Theme exist from Clerk details!
              if (!existingUser.profile) {
                const withProfile = await ensureUserProfile(existingUser, clerkUsername);
                if (withProfile) existingUser = withProfile as any;
              }

              if (existingUser && !existingUser.isBanned) {
                return existingUser as unknown as AuthenticatedUser;
              }
            }
          }
        } catch (err) {
          console.error("Clerk session cookie parsing error:", err);
        }
      }
    }

    // 4. In automated CI/test environments without cookies, fallback to test user
    if (process.env.NODE_ENV === "test" || process.env.TEST_MODE === "true") {
      const testUser = await prisma.user.findFirst({
        where: { email: "alex@creator.dev" },
        include: { profile: true },
      });

      if (testUser) {
        return testUser as unknown as AuthenticatedUser;
      }
    }

    return null;
  } catch (error) {
    console.error("Authentication resolution error:", error);
    return null;
  }
}

export async function getAuthenticatedUser(options?: {
  ignoreImpersonation?: boolean;
}): Promise<AuthenticatedUser | null> {
  const baseUser = await resolveBaseAuthenticatedUser();
  if (!baseUser) return null;

  if (!options?.ignoreImpersonation) {
    const isRealAdmin =
      baseUser.role === "SUPER_ADMIN" ||
      baseUser.role === "ADMIN" ||
      isEmailInAdminAllowlist(baseUser.email);

    if (isRealAdmin) {
      try {
        const cookieStore = await cookies();
        const impToken = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;
        if (impToken) {
          const parsed = verifyImpersonationToken(impToken, baseUser.id);
          if (parsed && parsed.targetUserId !== baseUser.id) {
            const targetUser = await prisma.user.findUnique({
              where: { id: parsed.targetUserId },
              include: { profile: true },
            });
            if (targetUser) {
              return {
                ...(targetUser as unknown as AuthenticatedUser),
                impersonatedBy: {
                  id: baseUser.id,
                  email: baseUser.email,
                  name: baseUser.name,
                },
              };
            }
          }
        }
      } catch {
        // Ignore impersonation lookup failures in non-request contexts
      }
    }
  }

  return baseUser;
}

/**
 * Strictly verifies admin role server-side.
 * Returns the admin user or null if unauthorized.
 */
export async function verifyAdminSession(): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser({ ignoreImpersonation: true });
  if (!user) return null;

  const isEmailAdmin = isEmailInAdminAllowlist(user.email);

  if (isEmailAdmin && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      user.role = "ADMIN";
    } catch {}
  }

  if (
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "MODERATOR" ||
    user.role === "SUPPORT" ||
    isEmailAdmin
  ) {
    return user;
  }

  return null;
}

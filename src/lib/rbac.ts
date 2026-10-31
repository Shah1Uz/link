import { prisma } from "./prisma";
import { AuthenticatedUser } from "./auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "MODERATOR" | "SUPPORT" | "USER";

export type Permission =
  | "users:read"
  | "users:write"
  | "users:ban"
  | "users:delete"
  | "templates:read"
  | "templates:create"
  | "templates:publish"
  | "templates:delete"
  | "subscriptions:read"
  | "subscriptions:manage"
  | "reports:read"
  | "reports:moderate"
  | "marketplace:read"
  | "marketplace:moderate"
  | "marketplace:payout"
  | "support:read"
  | "support:reply"
  | "settings:read"
  | "settings:write"
  | "feature_flags:read"
  | "feature_flags:manage"
  | "audit:read"
  | "health:read";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "users:read",
    "users:write",
    "users:ban",
    "users:delete",
    "templates:read",
    "templates:create",
    "templates:publish",
    "templates:delete",
    "subscriptions:read",
    "subscriptions:manage",
    "reports:read",
    "reports:moderate",
    "marketplace:read",
    "marketplace:moderate",
    "marketplace:payout",
    "support:read",
    "support:reply",
    "settings:read",
    "settings:write",
    "feature_flags:read",
    "feature_flags:manage",
    "audit:read",
    "health:read",
  ],
  ADMIN: [
    "users:read",
    "users:write",
    "users:ban",
    "templates:read",
    "templates:create",
    "templates:publish",
    "templates:delete",
    "subscriptions:read",
    "reports:read",
    "reports:moderate",
    "marketplace:read",
    "marketplace:moderate",
    "support:read",
    "support:reply",
    "settings:read",
    "settings:write",
    "feature_flags:read",
    "audit:read",
    "health:read",
  ],
  MODERATOR: [
    "users:read",
    "reports:read",
    "reports:moderate",
    "templates:read",
    "marketplace:read",
    "marketplace:moderate",
    "support:read",
  ],
  SUPPORT: [
    "users:read",
    "subscriptions:read",
    "support:read",
    "support:reply",
  ],
  USER: [],
};

/**
 * Checks whether a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const normalizedRole = (role || "USER").toUpperCase() as Role;
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(permission);
}

/**
 * Checks whether an authenticated user has a specific permission
 */
export function userHasPermission(user: AuthenticatedUser | null, permission: Permission): boolean {
  if (!user) return false;
  return hasPermission(user.role, permission);
}

/**
 * Logs an administrative action into the AdminAuditLog table for enterprise compliance.
 */
export async function logAdminAction({
  adminId,
  adminEmail,
  action,
  targetResource,
  targetId,
  details,
  ipAddress,
}: {
  adminId: string;
  adminEmail: string;
  action: string;
  targetResource: string;
  targetId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    return await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminEmail,
        action,
        targetResource,
        targetId: targetId || null,
        details: typeof details === "object" ? JSON.stringify(details) : details || null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write to admin audit log:", error);
    return null;
  }
}


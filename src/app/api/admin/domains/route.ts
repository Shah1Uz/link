import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { adminDomainActionSchema } from "@/lib/validations/domain";
import { verifyCustomDomainDNS } from "@/lib/domain/service";
import { z } from "zod";

/**
 * GET: Admin - List all connected custom domains across users with filters & metrics
 */
export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.toLowerCase().trim() || "";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { domain: { contains: search } },
        { profile: { username: { contains: search } } },
        { profile: { displayName: { contains: search } } },
      ];
    }

    const domains = await prisma.customDomain.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            user: {
              select: {
                id: true,
                email: true,
                subscriptionTier: true,
              },
            },
          },
        },
        events: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    // Compute admin overview metrics
    const allDomains = await prisma.customDomain.findMany({
      select: { status: true },
    });

    const metrics = {
      total: allDomains.length,
      active: allDomains.filter((d) => d.status === "ACTIVE").length,
      pending: allDomains.filter((d) => d.status === "PENDING" || d.status === "VERIFYING").length,
      failed: allDomains.filter((d) => d.status === "FAILED").length,
      suspended: allDomains.filter((d) => d.status === "SUSPENDED").length,
    };

    return NextResponse.json({ domains, metrics });
  } catch (err: any) {
    console.error("[ADMIN_DOMAINS_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch admin domains" }, { status: 500 });
  }
}

/**
 * POST / PATCH: Admin - Perform administrative action on custom domain (SUSPEND, UNSUSPEND, FORCE_VERIFY, DELETE)
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const validated = adminDomainActionSchema.parse(body);

    const domain = await prisma.customDomain.findUnique({
      where: { id: validated.domainId },
      include: { profile: true },
    });

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    let updated;
    const reason = validated.reason || `Action executed by administrator ${admin.email}`;

    if (validated.action === "SUSPEND") {
      updated = await prisma.customDomain.update({
        where: { id: validated.domainId },
        data: {
          status: "SUSPENDED",
          errorMessage: `Domain suspended by platform administration. Reason: ${reason}`,
        },
      });

      await prisma.domainEvent.create({
        data: {
          domainId: domain.id,
          eventType: "SUSPENDED",
          description: `Domain suspended by admin (${admin.email}): ${reason}`,
        },
      });
    } else if (validated.action === "UNSUSPEND") {
      updated = await prisma.customDomain.update({
        where: { id: validated.domainId },
        data: {
          status: "ACTIVE",
          errorMessage: null,
        },
      });

      await prisma.domainEvent.create({
        data: {
          domainId: domain.id,
          eventType: "ACTIVATED",
          description: `Domain unsuspended by admin (${admin.email}): ${reason}`,
        },
      });
    } else if (validated.action === "FORCE_VERIFY") {
      const verifyRes = await verifyCustomDomainDNS(validated.domainId, undefined, true);
      updated = verifyRes.domain;
    } else if (validated.action === "DELETE") {
      await prisma.customDomain.delete({
        where: { id: validated.domainId },
      });
      return NextResponse.json({ success: true, message: "Domain permanently deleted" });
    }

    // Log in admin audit logs
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action: `CUSTOM_DOMAIN_${validated.action}`,
        targetResource: "CUSTOM_DOMAIN",
        targetId: domain.id,
        details: JSON.stringify({ domain: domain.domain, reason }),
      },
    });

    return NextResponse.json({ success: true, domain: updated });
  } catch (err: any) {
    console.error("[ADMIN_DOMAIN_ACTION_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to execute admin domain action" }, { status: 400 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDomainSchema, removeDomainSchema } from "@/lib/validations/domain";
import {
  connectCustomDomain,
  removeCustomDomain,
  getDNSInstructions,
} from "@/lib/domain/service";
import { z } from "zod";

/**
 * GET: Fetch creator's custom domains with DNS instructions and live status
 */
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const domains = await prisma.customDomain.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        events: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    const enrichedDomains = domains.map((d) => ({
      ...d,
      instructions: getDNSInstructions(d.domain, d.verificationTxt, d.isApex),
    }));

    return NextResponse.json({
      domains: enrichedDomains,
      subscriptionTier: user.subscriptionTier,
      isPro: user.subscriptionTier === "PRO" || user.subscriptionTier === "BUSINESS",
    });
  } catch (err: any) {
    console.error("[CUSTOM_DOMAINS_GET_ERROR]", err);
    return NextResponse.json({ error: "Failed to fetch domains" }, { status: 500 });
  }
}

/**
 * POST: Connect a new custom domain (PRO gated)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = connectDomainSchema.parse(body);

    const domain = await connectCustomDomain(
      user.profile.id,
      validated.domain,
      user.subscriptionTier
    );

    const instructions = getDNSInstructions(
      domain.domain,
      domain.verificationTxt,
      domain.isApex
    );

    return NextResponse.json(
      {
        success: true,
        message: "Domain registered. Please configure the DNS records shown below.",
        domain: {
          ...domain,
          instructions,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[CUSTOM_DOMAIN_CONNECT_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid domain format", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to connect domain" }, { status: 400 });
  }
}

/**
 * DELETE: Remove / disconnect a custom domain
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domainId = searchParams.get("id");

    if (!domainId) {
      return NextResponse.json({ error: "Domain ID is required" }, { status: 400 });
    }

    const result = await removeCustomDomain(domainId, user.id);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[CUSTOM_DOMAIN_REMOVE_ERROR]", err);
    return NextResponse.json({ error: err.message || "Failed to remove domain" }, { status: 400 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { verifyDomainSchema } from "@/lib/validations/domain";
import { verifyCustomDomainDNS, getDNSInstructions } from "@/lib/domain/service";
import { z } from "zod";

/**
 * POST: Verify DNS records and trigger automated SSL provisioning
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = verifyDomainSchema.parse(body);

    const result = await verifyCustomDomainDNS(validated.domainId, user.id);

    const instructions = getDNSInstructions(
      result.domain.domain,
      result.domain.verificationTxt,
      result.domain.isApex
    );

    return NextResponse.json({
      ...result,
      domain: {
        ...result.domain,
        instructions,
      },
    });
  } catch (err: any) {
    console.error("[CUSTOM_DOMAIN_VERIFY_ERROR]", err);
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "DNS verification failed" }, { status: 400 });
  }
}


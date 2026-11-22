import { NextRequest, NextResponse } from "next/server";
import { resolveDomainProfile } from "@/lib/domain/service";

/**
 * GET: Public Edge Endpoint to resolve active custom domains to profile usernames
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "Domain parameter is required" }, { status: 400 });
    }

    const profile = await resolveDomainProfile(domain);

    if (!profile) {
      return NextResponse.json({ error: "Domain not configured or inactive" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      username: profile.username,
      profileId: profile.id,
      displayName: profile.displayName,
    });
  } catch (err: any) {
    console.error("[CUSTOM_DOMAIN_RESOLVE_ERROR]", err);
    return NextResponse.json({ error: "Failed to resolve domain" }, { status: 500 });
  }
}


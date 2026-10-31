import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { userHasPermission, logAdminAction } from "@/lib/rbac";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "settings:read")) {
      return NextResponse.json({ error: "Forbidden: Admin settings permission required" }, { status: 403 });
    }

    let flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });

    if (flags.length === 0) {
      await prisma.featureFlag.createMany({
        data: [
          {
            key: "marketplace_v2",
            name: "Community Template Marketplace",
            description: "Allows verified creators to publish and sell custom themes on the marketplace.",
            isEnabled: true,
          },
          {
            key: "custom_domains",
            name: "Automated Custom Domain SSL Provisioning",
            description: "Enables CNAME verification and automated Let's Encrypt certificates for PRO users.",
            isEnabled: true,
          },
          {
            key: "ai_bio_assistant",
            name: "AI Bio & Link Headline Generator",
            description: "Provides automated copywriting recommendations during profile editing.",
            isEnabled: true,
          },
          {
            key: "stripe_connect_payouts",
            name: "Creator Direct Stripe Connect Payouts",
            description: "Enables instant revenue split and automated payouts for digital store sales.",
            isEnabled: false,
          },
        ],
      });

      flags = await prisma.featureFlag.findMany({
        orderBy: { key: "asc" },
      });
    }

    return NextResponse.json({ flags });
  } catch (error) {
    console.error("Feature flags GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "settings:write")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { key, isEnabled } = body;

    if (!key || typeof isEnabled !== "boolean") {
      return NextResponse.json({ error: "Key and boolean isEnabled status required" }, { status: 400 });
    }

    const updated = await prisma.featureFlag.update({
      where: { key },
      data: { isEnabled },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "TOGGLE_FEATURE_FLAG",
      targetResource: "FEATURE_FLAG",
      targetId: key,
      details: { key, isEnabled },
    });

    return NextResponse.json({ flag: updated });
  } catch (error) {
    console.error("Feature flags PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


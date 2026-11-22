import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { sendConfirmationEmail } from "@/lib/email/service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;

    const subscriber = await prisma.subscriber.findFirst({
      where: {
        id,
        profileId: user.profile.id,
      },
      include: { profile: true },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (subscriber.status === "ACTIVE") {
      return NextResponse.json({ error: "Subscriber is already confirmed and active." }, { status: 400 });
    }

    // Generate fresh 24h token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verificationToken = await prisma.emailVerificationToken.create({
      data: {
        subscriberId: subscriber.id,
        expiresAt,
        type: "CONFIRMATION",
      },
    });

    const appUrl = req.headers.get("origin") || undefined;
    await sendConfirmationEmail({
      to: subscriber.email,
      creatorName: subscriber.profile.displayName || subscriber.profile.username,
      profileUsername: subscriber.profile.username,
      verificationToken: verificationToken.token,
      subscriberId: subscriber.id,
      appUrl,
    });

    return NextResponse.json({ success: true, message: `Confirmation email re-sent to ${subscriber.email}.` });
  } catch (error) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


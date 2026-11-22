import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return renderConfirmationResult({
        success: false,
        title: "Invalid Verification Link",
        message: "No verification token was provided in the request.",
      });
    }

    // 1. Find token
    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: {
        subscriber: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!verificationRecord) {
      return renderConfirmationResult({
        success: false,
        title: "Token Not Found",
        message: "This confirmation link is invalid or has already been removed.",
      });
    }

    const { subscriber } = verificationRecord;

    // Check expiration
    if (new Date() > verificationRecord.expiresAt) {
      return renderConfirmationResult({
        success: false,
        title: "Link Expired",
        message: "This verification link has expired (links are valid for 24 hours). Please subscribe again to receive a fresh confirmation link.",
        profileUsername: subscriber.profile.username,
      });
    }

    // If already active
    if (subscriber.status === "ACTIVE") {
      return renderConfirmationResult({
        success: true,
        title: "Already Confirmed!",
        message: `Your subscription to @${subscriber.profile.username}'s newsletter is already active and verified.`,
        profileUsername: subscriber.profile.username,
      });
    }

    // 2. Mark active & token used
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { id: subscriber.id },
        data: {
          status: "ACTIVE",
          confirmedAt: new Date(),
        },
      }),
      prisma.emailVerificationToken.update({
        where: { id: verificationRecord.id },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    // 3. Dispatch Welcome Email
    const appUrl = req.headers.get("origin") || undefined;
    await sendWelcomeEmail({
      to: subscriber.email,
      creatorName: subscriber.profile.displayName || subscriber.profile.username,
      profileUsername: subscriber.profile.username,
      unsubscribeToken: subscriber.unsubscribeToken,
      subscriberId: subscriber.id,
      appUrl,
    });

    return renderConfirmationResult({
      success: true,
      title: "Subscription Confirmed! 🎉",
      message: `You are now officially subscribed to @${subscriber.profile.username}'s newsletter. A welcome email has been sent to ${subscriber.email}.`,
      profileUsername: subscriber.profile.username,
    });
  } catch (error) {
    console.error("Subscription confirmation error:", error);
    return renderConfirmationResult({
      success: false,
      title: "Confirmation Error",
      message: "An unexpected error occurred while confirming your subscription. Please try again later.",
    });
  }
}

function renderConfirmationResult(params: {
  success: boolean;
  title: string;
  message: string;
  profileUsername?: string;
}) {
  const { success, title, message, profileUsername } = params;
  const profileLink = profileUsername ? `/${profileUsername}` : "/";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — BioSpace</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #ffffff; margin: 0; padding: 40px 16px; display: flex; align-items: center; justify-content: center; min-height: 80vh;">
  <div style="max-width: 460px; width: 100%; background: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 36px 28px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <div style="width: 56px; height: 56px; border-radius: 50%; background: ${success ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}; color: ${success ? "#10b981" : "#ef4444"}; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 26px;">
      ${success ? "✓" : "✕"}
    </div>
    <h1 style="font-size: 22px; font-weight: 800; margin: 0 0 12px 0; color: #ffffff;">${title}</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 28px 0;">${message}</p>
    <div>
      <a href="${profileLink}" style="background-color: #10b981; color: #000000; text-decoration: none; font-weight: 800; font-size: 14px; padding: 12px 24px; border-radius: 12px; display: inline-block;">
        ${profileUsername ? `Return to @${profileUsername}` : "Go to BioSpace"} &rarr;
      </a>
    </div>
  </div>
</body>
</html>
`;

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}


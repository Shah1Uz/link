import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendUnsubscribeConfirmationEmail } from "@/lib/email/service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return renderUnsubscribeHtml({
        success: false,
        title: "Invalid Unsubscribe Link",
        message: "No unsubscribe token was found in the link.",
      });
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
      include: { profile: true },
    });

    if (!subscriber) {
      return renderUnsubscribeHtml({
        success: false,
        title: "Subscriber Not Found",
        message: "This unsubscribe link is invalid or your record has already been removed.",
      });
    }

    if (subscriber.status === "UNSUBSCRIBED") {
      return renderUnsubscribeHtml({
        success: true,
        title: "Already Unsubscribed",
        message: `Your email (${subscriber.email}) is already unsubscribed from @${subscriber.profile.username}'s newsletter.`,
        profileUsername: subscriber.profile.username,
      });
    }

    // Mark as UNSUBSCRIBED
    await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    // Optional confirmation email
    sendUnsubscribeConfirmationEmail({
      to: subscriber.email,
      creatorName: subscriber.profile.displayName || subscriber.profile.username,
      subscriberId: subscriber.id,
    }).catch(() => {});

    return renderUnsubscribeHtml({
      success: true,
      title: "Successfully Unsubscribed",
      message: `You have been removed from @${subscriber.profile.username}'s newsletter list (${subscriber.email}). You will no longer receive emails from this creator.`,
      profileUsername: subscriber.profile.username,
    });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return renderUnsubscribeHtml({
      success: false,
      title: "Unsubscribe Error",
      message: "An error occurred while processing your unsubscribe request. Please try again.",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;

    if (!token) {
      return NextResponse.json({ error: "Unsubscribe token is required" }, { status: 400 });
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    const updated = await prisma.subscriber.update({
      where: { id: subscriber.id },
      data: {
        status: "UNSUBSCRIBED",
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, subscriber: updated });
  } catch (error) {
    console.error("Unsubscribe POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function renderUnsubscribeHtml(params: {
  success: boolean;
  title: string;
  message: string;
  profileUsername?: string;
}) {
  const { success, title, message, profileUsername } = params;

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
    ${
      profileUsername
        ? `<div><a href="/${profileUsername}" style="color: #10b981; text-decoration: none; font-size: 13px; font-weight: 700;">&larr; Return to @${profileUsername}</a></div>`
        : `<div><a href="/" style="color: #10b981; text-decoration: none; font-size: 13px; font-weight: 700;">Return to Homepage</a></div>`
    }
  </div>
</body>
</html>
`;

  return new NextResponse(html, {
    status: success ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}


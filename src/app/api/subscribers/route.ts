import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { subscribeRequestSchema } from "@/lib/validations/subscriber";
import { sendConfirmationEmail, sendCreatorNotificationEmail } from "@/lib/email/service";
import { z } from "zod";

/**
 * GET: Creator Dashboard - Fetch subscribers with metrics and filters
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const status = searchParams.get("status") || "ALL";

    // Where clause
    const where: any = {
      profileId: user.profile.id,
    };

    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        consents: {
          take: 1,
          orderBy: { consentedAt: "desc" },
        },
      },
    });

    // Compute Metrics
    const allProfileSubscribers = await prisma.subscriber.findMany({
      where: { profileId: user.profile.id },
      select: { status: true, createdAt: true },
    });

    const totalCount = allProfileSubscribers.length;
    const activeCount = allProfileSubscribers.filter((s) => s.status === "ACTIVE").length;
    const pendingCount = allProfileSubscribers.filter((s) => s.status === "PENDING").length;
    const unsubscribedCount = allProfileSubscribers.filter((s) => s.status === "UNSUBSCRIBED").length;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newThisMonthCount = allProfileSubscribers.filter((s) => s.createdAt >= thirtyDaysAgo).length;

    return NextResponse.json({
      subscribers,
      metrics: {
        total: totalCount,
        active: activeCount,
        pending: pendingCount,
        unsubscribed: unsubscribedCount,
        newThisMonth: newThisMonthCount,
      },
      newsletterSettings: {
        newsletterEnabled: user.profile.newsletterEnabled,
        newsletterTitle: user.profile.newsletterTitle,
        newsletterDescription: user.profile.newsletterDescription,
        newsletterButtonText: user.profile.newsletterButtonText,
        newsletterPlaceholder: user.profile.newsletterPlaceholder,
        newsletterSuccessMessage: user.profile.newsletterSuccessMessage,
        newsletterLayout: user.profile.newsletterLayout,
      },
    });
  } catch (error) {
    console.error("Subscribers GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST: Public Subscription Submission (Double Opt-In flow)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = subscribeRequestSchema.parse(body);

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // 1. Fetch Profile and Creator User
    const profile = await prisma.profile.findUnique({
      where: { id: validated.profileId },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.newsletterEnabled) {
      return NextResponse.json({ error: "Newsletter subscriptions are disabled by creator." }, { status: 400 });
    }

    const cleanEmail = validated.email.trim().toLowerCase();

    // 2. Check for existing subscriber
    const existing = await prisma.subscriber.findUnique({
      where: {
        profileId_email: {
          profileId: profile.id,
          email: cleanEmail,
        },
      },
    });

    if (existing && existing.status === "ACTIVE") {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already an active subscriber to this newsletter!",
      });
    }

    let subscriber = existing;

    // 3. Create or update subscriber record
    if (!subscriber) {
      subscriber = await prisma.subscriber.create({
        data: {
          profileId: profile.id,
          email: cleanEmail,
          name: validated.name || null,
          status: "PENDING",
          source: validated.source || "profile_page",
          consents: {
            create: {
              consentType: "EMAIL_MARKETING",
              consentText: validated.consentText,
              source: validated.source || "profile_page",
              ipAddress: clientIp,
              userAgent: userAgent.slice(0, 255),
            },
          },
        },
      });
    } else {
      // Re-record consent for returning subscriber
      await prisma.subscriptionConsent.create({
        data: {
          subscriberId: subscriber.id,
          consentType: "EMAIL_MARKETING",
          consentText: validated.consentText,
          source: validated.source || "profile_page",
          ipAddress: clientIp,
          userAgent: userAgent.slice(0, 255),
        },
      });
    }

    // 4. Generate 24-hour Double Opt-In Verification Token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const verificationToken = await prisma.emailVerificationToken.create({
      data: {
        subscriberId: subscriber.id,
        expiresAt,
        type: "CONFIRMATION",
      },
    });

    // 5. Send Double Opt-In Email
    const appUrl = req.headers.get("origin") || undefined;
    await sendConfirmationEmail({
      to: cleanEmail,
      creatorName: profile.displayName || profile.username,
      profileUsername: profile.username,
      verificationToken: verificationToken.token,
      subscriberId: subscriber.id,
      appUrl,
    });

    // 6. Notify creator in background (non-blocking)
    if (profile.user.email) {
      sendCreatorNotificationEmail({
        creatorEmail: profile.user.email,
        creatorName: profile.displayName || profile.username,
        subscriberEmail: cleanEmail,
        profileUsername: profile.username,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: profile.newsletterSuccessMessage || "Thanks for subscribing! Please check your email to confirm.",
      subscriberId: subscriber.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid subscription request" }, { status: 400 });
    }
    console.error("Subscription POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


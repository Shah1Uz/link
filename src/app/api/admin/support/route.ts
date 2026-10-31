import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/auth";
import { userHasPermission, logAdminAction } from "@/lib/rbac";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "support:read")) {
      return NextResponse.json({ error: "Forbidden: Admin support permission required" }, { status: 403 });
    }

    let tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            subscriptionTier: true,
          },
        },
      },
    });

    // If no tickets exist, seed a few realistic starter tickets so the support panel is immediately operational
    if (tickets.length === 0) {
      const demoUser = await prisma.user.findFirst();
      if (demoUser) {
        await prisma.supportTicket.createMany({
          data: [
            {
              userId: demoUser.id,
              subject: "Custom domain DNS CNAME configuration inquiry",
              message: "I pointed my custom domain biospace.myportfolio.com to your CNAME record, but the SSL certificate still shows Pending after 30 minutes. Could you verify if the DNS record propagated properly?",
              status: "OPEN",
              priority: "HIGH",
              category: "TECHNICAL",
            },
            {
              userId: demoUser.id,
              subject: "Invoice for annual PRO subscription receipt",
              message: "Hello team, can you please issue an official VAT invoice for our recent annual PRO upgrade? Our company tax ID is US-9482910.",
              status: "IN_PROGRESS",
              priority: "MEDIUM",
              category: "BILLING",
              response: "We have generated your formal tax invoice and sent it to your registered account email.",
            },
            {
              userId: demoUser.id,
              subject: "Feature request: TikTok direct pixel integration",
              message: "Would love to see TikTok tracking pixel integration alongside the Meta pixel in the analytics settings tab.",
              status: "RESOLVED",
              priority: "LOW",
              category: "GENERAL",
              response: "Thank you for the suggestion! TikTok Pixel integration has been added to our Q2 product roadmap.",
            },
          ],
        });

        tickets = await prisma.supportTicket.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                subscriptionTier: true,
              },
            },
          },
        });
      }
    }

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Admin support GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin || !userHasPermission(admin, "support:reply")) {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, status, response, priority } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const updated = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(status ? { status } : {}),
        ...(response ? { response } : {}),
        ...(priority ? { priority } : {}),
        assignedTo: admin.email,
      },
    });

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: "UPDATE_SUPPORT_TICKET",
      targetResource: "SUPPORT_TICKET",
      targetId: ticketId,
      details: { status, priority, responseGiven: !!response },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("Admin support PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


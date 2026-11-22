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

    const [tickets, inquiries] = await Promise.all([
      prisma.supportTicket.findMany({
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
      }),
      prisma.contactInquiry.findMany({
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
      }),
    ]);

    const inquiryTickets = inquiries.map((inquiry) => ({
      id: inquiry.id,
      subject: inquiry.subject,
      message: inquiry.message,
      status: inquiry.status,
      priority: "MEDIUM",
      category: inquiry.category,
      response: inquiry.response,
      assignedTo: null,
      createdAt: inquiry.createdAt,
      source: "inquiry" as const,
      user: inquiry.user || {
        id: "guest",
        email: inquiry.email,
        name: inquiry.name,
        subscriptionTier: "FREE",
      },
    }));

    const merged = [
      ...tickets.map((ticket) => ({ ...ticket, source: "ticket" as const })),
      ...inquiryTickets,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ tickets: merged });
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
    const { ticketId, status, response, priority, source } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    const allowedStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (status && !allowedStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (source === "inquiry") {
      const updated = await prisma.contactInquiry.update({
        where: { id: ticketId },
        data: {
          ...(status ? { status } : {}),
          ...(response !== undefined ? { response: response || null } : {}),
        },
      });

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: "UPDATE_CONTACT_INQUIRY",
        targetResource: "CONTACT_INQUIRY",
        targetId: ticketId,
        details: { status, responseGiven: !!response },
      });

      return NextResponse.json({ ticket: updated });
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


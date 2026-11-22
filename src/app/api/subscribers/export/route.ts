import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const subscribers = await prisma.subscriber.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        consents: {
          take: 1,
          orderBy: { consentedAt: "desc" },
        },
      },
    });

    const headers = ["ID", "Email", "Name", "Status", "Source", "Subscribed At", "Confirmed At", "Consent Text"];
    const rows = subscribers.map((s) => [
      s.id,
      s.email,
      s.name ? `"${s.name.replace(/"/g, '""')}"` : "",
      s.status,
      s.source,
      new Date(s.subscribedAt).toISOString(),
      s.confirmedAt ? new Date(s.confirmedAt).toISOString() : "",
      s.consents[0]?.consentText ? `"${s.consents[0].consentText.replace(/"/g, '""')}"` : "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const filename = `subscribers_${user.profile.username}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Subscribers export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


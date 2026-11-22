import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true,
            imageUrl: true,
          },
        },
        items: true,
      },
    });

    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === "COMPLETED");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const refundedOrders = orders.filter((o) => o.status === "REFUNDED");
    const totalRefunded = refundedOrders.reduce((sum, o) => sum + (o.refundedAmount || o.amount), 0);

    return NextResponse.json({
      orders,
      metrics: {
        totalOrders,
        completedCount: completedOrders.length,
        refundedCount: refundedOrders.length,
        pendingCount: orders.filter((o) => o.status === "PENDING").length,
        grossRevenue: totalRevenue,
        netRevenue: Math.max(0, totalRevenue - totalRefunded),
      },
    });
  } catch (error) {
    console.error("Store orders GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


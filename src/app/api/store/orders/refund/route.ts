import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { refundRequestSchema } from "@/lib/validations/product";
import { refundStoreOrder } from "@/lib/store/payment";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, reason } = refundRequestSchema.parse(body);

    const result = await refundStoreOrder({
      orderId,
      userId: user.id,
      reason,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message, order: result.order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid refund payload" }, { status: 400 });
    }
    console.error("Order refund error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


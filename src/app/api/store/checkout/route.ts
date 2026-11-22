import { NextResponse } from "next/server";
import { checkoutRequestSchema } from "@/lib/validations/product";
import { createStoreCheckoutSession } from "@/lib/store/payment";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = checkoutRequestSchema.parse(body);

    const origin = req.headers.get("origin") || req.headers.get("referer") || undefined;

    const result = await createStoreCheckoutSession({
      productId: validated.productId,
      customerEmail: validated.customerEmail,
      customerName: validated.customerName,
      quantity: validated.quantity,
      successUrl: validated.successUrl,
      cancelUrl: validated.cancelUrl,
      origin,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to create checkout session" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Invalid checkout input" }, { status: 400 });
    }
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


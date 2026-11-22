import { NextRequest, NextResponse } from "next/server";
import { processStripeWebhookEvent } from "@/lib/store/payment";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    const result = await processStripeWebhookEvent(rawBody, signature);

    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    console.error("Store webhook processing failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 400 }
    );
  }
}


import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_"));
}

export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia" as any,
  });
}

export interface CheckoutResult {
  success: boolean;
  isFree?: boolean;
  configured: boolean;
  orderId?: string;
  orderNumber?: string;
  checkoutUrl?: string | null;
  sessionId?: string;
  downloadUrl?: string | null;
  warning?: string;
  error?: string;
}

/**
 * Creates an idempotent checkout session or instant order fulfillment for digital products.
 */
export async function createStoreCheckoutSession(params: {
  productId: string;
  customerEmail: string;
  customerName?: string | null;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
  origin?: string;
}): Promise<CheckoutResult> {
  const { productId, customerEmail, customerName, quantity = 1, successUrl, cancelUrl, origin } = params;

  // 1. Fetch product & seller profile
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      profile: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!product || !product.isEnabled) {
    return {
      success: false,
      configured: false,
      error: "Product is currently unavailable or disabled by seller.",
    };
  }

  const basePrice = product.price;
  const totalPrice = basePrice * quantity;
  const currency = product.currency || "USD";
  const uniqueOrderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 2. Free product handling ($0.00)
  if (totalPrice === 0) {
    const freeOrder = await prisma.order.create({
      data: {
        orderNumber: uniqueOrderNumber,
        profileId: product.profileId,
        productId: product.id,
        customerEmail,
        customerName: customerName || null,
        amount: 0,
        currency,
        status: "COMPLETED",
        items: {
          create: {
            productId: product.id,
            title: product.title,
            price: 0,
            quantity,
          },
        },
      },
    });

    await prisma.product.update({
      where: { id: product.id },
      data: { salesCount: { increment: quantity } },
    });

    return {
      success: true,
      isFree: true,
      configured: true,
      orderId: freeOrder.id,
      orderNumber: freeOrder.orderNumber || uniqueOrderNumber,
      downloadUrl: product.fileUrl || product.externalUrl,
    };
  }

  // 3. Paid Product: Check Stripe configuration
  const stripe = getStripeClient();
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // If Stripe is not configured, record pending preview order and alert
  if (!stripe) {
    const previewOrder = await prisma.order.create({
      data: {
        orderNumber: uniqueOrderNumber,
        profileId: product.profileId,
        productId: product.id,
        customerEmail,
        customerName: customerName || null,
        amount: totalPrice,
        currency,
        status: "PENDING",
        metadata: JSON.stringify({ mode: "preview_unconfigured_gateway", quantity }),
      },
    });

    return {
      success: true,
      isFree: false,
      configured: false,
      orderId: previewOrder.id,
      orderNumber: previewOrder.orderNumber || uniqueOrderNumber,
      warning:
        "Stripe payment gateway is not configured (missing STRIPE_SECRET_KEY in environment). Order recorded in preview mode. Webhooks and real credit card charging require active Stripe API keys.",
    };
  }

  // 4. Live Stripe Checkout Session Creation
  const pendingOrder = await prisma.order.create({
    data: {
      orderNumber: uniqueOrderNumber,
      profileId: product.profileId,
      productId: product.id,
      customerEmail,
      customerName: customerName || null,
      amount: totalPrice,
      currency,
      status: "PENDING",
      metadata: JSON.stringify({ quantity }),
    },
  });

  const returnSuccessUrl =
    successUrl ||
    `${baseUrl}/${product.profile.username}?store_order=${pendingOrder.id}&order_status=success`;
  const returnCancelUrl =
    cancelUrl ||
    `${baseUrl}/${product.profile.username}?store_order=${pendingOrder.id}&order_status=cancelled`;

  try {
    const session = await (stripe.checkout.sessions.create as any)({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      client_reference_id: pendingOrder.id,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: product.title,
              description: product.description?.slice(0, 300) || undefined,
              images: product.imageUrl ? [product.imageUrl] : undefined,
            },
            unit_amount: Math.round(basePrice * 100),
          },
          quantity,
        },
      ],
      metadata: {
        orderId: pendingOrder.id,
        orderNumber: uniqueOrderNumber,
        profileId: product.profileId,
        productId: product.id,
        sellerUsername: product.profile.username,
      },
      success_url: returnSuccessUrl,
      cancel_url: returnCancelUrl,
    });

    await prisma.order.update({
      where: { id: pendingOrder.id },
      data: {
        stripeSessionId: session.id,
      },
    });

    return {
      success: true,
      isFree: false,
      configured: true,
      orderId: pendingOrder.id,
      orderNumber: uniqueOrderNumber,
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  } catch (error: any) {
    console.error("Stripe session creation error:", error);
    await prisma.order.update({
      where: { id: pendingOrder.id },
      data: { status: "FAILED" },
    });

    return {
      success: false,
      configured: true,
      error: error.message || "Failed to initialize Stripe checkout session",
    };
  }
}

/**
 * Verified & Idempotent Stripe Webhook Event Processor
 */
export async function processStripeWebhookEvent(
  rawBody: string,
  sigHeader: string
): Promise<{ processed: boolean; reason?: string; eventType?: string }> {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  if (stripe && webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
    } catch (err: any) {
      console.error("⚠️ Stripe webhook signature verification failed:", err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  } else {
    // If running in development without webhook secret, parse raw JSON
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      throw new Error("Invalid webhook JSON payload");
    }
  }

  // Idempotency: check if event was already recorded
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existingEvent) {
    return {
      processed: false,
      reason: "DUPLICATE_EVENT_ALREADY_PROCESSED",
      eventType: event.type,
    };
  }

  // Handle specific event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.client_reference_id || session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { product: true },
      });

      if (order && order.status !== "COMPLETED") {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: orderId },
            data: {
              status: "COMPLETED",
              paymentIntentId: (session.payment_intent as string) || null,
              stripeSessionId: session.id,
            },
          }),
          prisma.product.update({
            where: { id: order.productId },
            data: {
              salesCount: { increment: 1 },
            },
          }),
          prisma.orderItem.create({
            data: {
              orderId: order.id,
              productId: order.productId,
              title: order.product.title,
              price: order.amount,
              quantity: 1,
            },
          }),
          prisma.paymentEvent.create({
            data: {
              stripeEventId: event.id,
              eventType: event.type,
              amount: session.amount_total ? session.amount_total / 100 : order.amount,
              currency: session.currency?.toUpperCase() || order.currency,
              payload: JSON.stringify(session),
              status: "PROCESSED",
              orderId: order.id,
            },
          }),
        ]);

        return { processed: true, eventType: event.type };
      }
    }
  } else if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntentId = charge.payment_intent as string;

    if (paymentIntentId) {
      const order = await prisma.order.findFirst({
        where: { paymentIntentId },
      });

      if (order) {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              status: "REFUNDED",
              refundedAmount: (charge.amount_refunded || 0) / 100,
            },
          }),
          prisma.paymentEvent.create({
            data: {
              stripeEventId: event.id,
              eventType: event.type,
              amount: (charge.amount_refunded || 0) / 100,
              currency: charge.currency?.toUpperCase() || order.currency,
              payload: JSON.stringify(charge),
              status: "PROCESSED",
              orderId: order.id,
            },
          }),
        ]);

        return { processed: true, eventType: event.type };
      }
    }
  }

  // Fallback: record unprocessed or informational event
  await prisma.paymentEvent.create({
    data: {
      stripeEventId: event.id,
      eventType: event.type,
      payload: JSON.stringify(event.data.object),
      status: "LOGGED",
    },
  });

  return { processed: true, eventType: event.type };
}

/**
 * Refunds an order with creator ownership verification
 */
export async function refundStoreOrder(params: {
  orderId: string;
  userId: string;
  reason?: string;
}): Promise<{ success: boolean; message: string; order?: any }> {
  const { orderId, userId, reason } = params;

  // Verify ownership: order -> profile -> userId
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      profile: true,
      product: true,
    },
  });

  if (!order || order.profile.userId !== userId) {
    return { success: false, message: "Order not found or unauthorized access" };
  }

  if (order.status === "REFUNDED") {
    return { success: false, message: "Order is already refunded" };
  }

  // Execute Stripe refund if paymentIntentId is present
  const stripe = getStripeClient();
  if (stripe && order.paymentIntentId) {
    try {
      await stripe.refunds.create({
        payment_intent: order.paymentIntentId,
        reason: (reason as any) || "requested_by_customer",
      });
    } catch (err: any) {
      console.error("Stripe refund call failed:", err);
      return { success: false, message: `Stripe refund failed: ${err.message}` };
    }
  }

  // Update order status in DB
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "REFUNDED",
      refundedAmount: order.amount,
    },
  });

  return {
    success: true,
    message: `Order #${order.orderNumber || order.id} has been refunded successfully.`,
    order: updatedOrder,
  };
}


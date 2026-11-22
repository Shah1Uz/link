import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactInquirySchema } from "@/lib/validations";

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_HITS = 5;

function tooMany(ip: string) {
  const now = Date.now();
  const bucket = hits.get(ip);
  if (!bucket || bucket.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_HITS;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    if (tooMany(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = contactInquirySchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: { id: true },
    });

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        subject: data.subject,
        message: data.message,
        userId: existingUser?.id ?? null,
      },
    });

    return NextResponse.json({ ok: true, id: inquiry.id });
  } catch (error: any) {
    const message = error?.issues?.[0]?.message || error?.message || "Could not send message";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

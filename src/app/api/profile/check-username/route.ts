import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { usernameRegex, isReservedUsername } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = (searchParams.get("username") || "").trim().toLowerCase();

    if (!username) {
      return NextResponse.json({ available: false, message: "Username is required" });
    }

    if (!usernameRegex.test(username)) {
      return NextResponse.json({
        available: false,
        message: "3-30 characters, letters, numbers, hyphens, and underscores only",
      });
    }

    if (isReservedUsername(username)) {
      return NextResponse.json({ available: false, message: "This username is reserved" });
    }

    const existing = await prisma.profile.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json({ available: false, message: "Username is already taken" });
    }

    return NextResponse.json({ available: true, message: "Username is available!" });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json({ available: false, message: "Error verifying username" }, { status: 500 });
  }
}


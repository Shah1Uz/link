import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { newsletterSettingsSchema } from "@/lib/validations/subscriber";
import { z } from "zod";

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || !user.profile) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const validated = newsletterSettingsSchema.parse(body);

    const updatedProfile = await prisma.profile.update({
      where: { id: user.profile.id },
      data: {
        newsletterEnabled: validated.newsletterEnabled,
        newsletterTitle: validated.newsletterTitle,
        newsletterDescription: validated.newsletterDescription || null,
        newsletterButtonText: validated.newsletterButtonText,
        newsletterPlaceholder: validated.newsletterPlaceholder,
        newsletterSuccessMessage: validated.newsletterSuccessMessage,
        newsletterLayout: validated.newsletterLayout,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Newsletter form settings updated successfully!",
      settings: {
        newsletterEnabled: updatedProfile.newsletterEnabled,
        newsletterTitle: updatedProfile.newsletterTitle,
        newsletterDescription: updatedProfile.newsletterDescription,
        newsletterButtonText: updatedProfile.newsletterButtonText,
        newsletterPlaceholder: updatedProfile.newsletterPlaceholder,
        newsletterSuccessMessage: updatedProfile.newsletterSuccessMessage,
        newsletterLayout: updatedProfile.newsletterLayout,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("Newsletter settings PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


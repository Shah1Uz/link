import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserAIGenerationHistory } from "@/lib/ai/usage";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type") || undefined;

    const history = await getUserAIGenerationHistory(user.id, limit, type);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error: any) {
    console.error("Fetch AI history error:", error);
    return NextResponse.json({ error: error.message || "Failed to load AI history" }, { status: 500 });
  }
}


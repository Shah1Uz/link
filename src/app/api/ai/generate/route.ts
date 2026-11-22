import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkUserAILimit, recordAIGeneration } from "@/lib/ai/usage";
import {
  aiGenerateRequestSchema,
  bioGeneratorSchema,
  headlineGeneratorSchema,
  descriptionGeneratorSchema,
  linkTitleGeneratorSchema,
  contentImproveSchema,
  themeRecommendSchema,
  profileOptimizeSchema,
  ctaGeneratorSchema,
} from "@/lib/validations/ai";
import {
  generateAIBio,
  generateAIHeadlines,
  generateAIDescriptions,
  generateAILinkTitles,
  improveAIContent,
  recommendAIThemes,
  auditAndOptimizeProfile,
  generateAICTAs,
} from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Validate request payload structure
    const body = await req.json();
    const parsed = aiGenerateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, data } = parsed.data;

    // 3. Enforce subscription quotas server-side
    const quota = await checkUserAILimit(user.id, user.subscriptionTier);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `Monthly AI generation limit reached for your ${user.subscriptionTier} plan (${quota.used}/${quota.limit}). Upgrade to Pro for 200 generations per month.`,
          upgradeRequired: true,
          quota,
        },
        { status: 403 }
      );
    }

    // 4. Validate domain-specific input and execute generator
    let engineResult: any;

    switch (type) {
      case "BIO": {
        const val = bioGeneratorSchema.parse(data);
        engineResult = await generateAIBio(val);
        break;
      }
      case "HEADLINE": {
        const val = headlineGeneratorSchema.parse(data);
        engineResult = await generateAIHeadlines(val);
        break;
      }
      case "DESCRIPTION": {
        const val = descriptionGeneratorSchema.parse(data);
        engineResult = await generateAIDescriptions(val);
        break;
      }
      case "LINK_TITLE": {
        const val = linkTitleGeneratorSchema.parse(data);
        engineResult = await generateAILinkTitles(val);
        break;
      }
      case "CONTENT_IMPROVE": {
        const val = contentImproveSchema.parse(data);
        engineResult = await improveAIContent(val);
        break;
      }
      case "THEME_RECOMMEND": {
        const val = themeRecommendSchema.parse(data);
        engineResult = await recommendAIThemes(val);
        break;
      }
      case "PROFILE_OPTIMIZE": {
        const val = profileOptimizeSchema.parse(data);
        engineResult = await auditAndOptimizeProfile(val);
        break;
      }
      case "CTA": {
        const val = ctaGeneratorSchema.parse(data);
        engineResult = await generateAICTAs(val);
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported AI generator type" }, { status: 400 });
    }

    // 5. Persist generation record and update user usage totals
    const record = await recordAIGeneration({
      userId: user.id,
      type,
      prompt: engineResult.prompt,
      inputJson: data,
      outputJson: engineResult.data,
      tokensUsed: engineResult.tokensUsed,
      costEst: engineResult.costEst,
      provider: engineResult.provider,
      model: engineResult.model,
      status: "SUCCESS",
    });

    // 6. Return response with remaining quota
    return NextResponse.json({
      success: true,
      id: record.id,
      type,
      data: engineResult.data,
      tokensUsed: engineResult.tokensUsed,
      provider: engineResult.provider,
      quota: {
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.remaining - 1),
        period: quota.period,
        tier: quota.tier,
      },
    });
  } catch (error: any) {
    console.error("AI Generation API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI content" },
      { status: 500 }
    );
  }
}


import { prisma } from "@/lib/prisma";
import { AI_TIER_LIMITS, getCurrentMonthPeriod } from "./config";

export interface AIQuotaStatus {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  period: string;
  tier: string;
}

/**
 * Checks whether a user has remaining AI generation quota for the current period.
 */
export async function checkUserAILimit(userId: string, subscriptionTier: string = "FREE"): Promise<AIQuotaStatus> {
  const period = getCurrentMonthPeriod();
  const tier = (subscriptionTier || "FREE").toUpperCase();
  const limitConfig = AI_TIER_LIMITS[tier] || AI_TIER_LIMITS.FREE;
  const limit = limitConfig.maxGenerationsPerMonth;

  const usage = await prisma.aIUsage.findUnique({
    where: { userId },
  });

  // If usage belongs to a previous month, treat as 0 used for the current period
  let currentUsed = 0;
  if (usage && usage.period === period) {
    currentUsed = usage.generationCount;
  }

  const remaining = Math.max(0, limit - currentUsed);
  const allowed = currentUsed < limit;

  return {
    allowed,
    remaining,
    limit,
    used: currentUsed,
    period,
    tier,
  };
}

/**
 * Records an AI generation event and updates the user's monthly usage totals.
 */
export async function recordAIGeneration(params: {
  userId: string;
  type: string;
  prompt?: string;
  inputJson: Record<string, any>;
  outputJson: Record<string, any> | Array<any>;
  tokensUsed: number;
  costEst: number;
  provider: string;
  model: string;
  status?: string;
}) {
  const period = getCurrentMonthPeriod();

  // 1. Create generation record
  const generation = await prisma.aIGeneration.create({
    data: {
      userId: params.userId,
      type: params.type,
      prompt: params.prompt || null,
      inputJson: JSON.stringify(params.inputJson),
      outputJson: JSON.stringify(params.outputJson),
      tokensUsed: params.tokensUsed,
      costEst: params.costEst,
      provider: params.provider,
      model: params.model,
      status: params.status || "SUCCESS",
      isApplied: false,
    },
  });

  // 2. Upsert usage totals
  await prisma.aIUsage.upsert({
    where: { userId: params.userId },
    update: {
      period,
      generationCount: { increment: 1 },
      tokenCount: { increment: params.tokensUsed },
      estimatedCost: { increment: params.costEst },
      lastUsedAt: new Date(),
    },
    create: {
      userId: params.userId,
      period,
      generationCount: 1,
      tokenCount: params.tokensUsed,
      estimatedCost: params.costEst,
      lastUsedAt: new Date(),
    },
  });

  return generation;
}

/**
 * Fetches user's AI usage statistics and current settings.
 */
export async function getAIUsageStats(userId: string, subscriptionTier: string = "FREE") {
  const quota = await checkUserAILimit(userId, subscriptionTier);

  const usage = await prisma.aIUsage.findUnique({
    where: { userId },
  });

  const totalGenerationsCount = await prisma.aIGeneration.count({
    where: { userId },
  });

  const settings = await prisma.aISettings.findUnique({
    where: { userId },
  });

  return {
    quota,
    totalGenerationsCount,
    totalTokens: usage?.tokenCount || 0,
    estimatedCost: usage?.estimatedCost || 0.0,
    lastUsedAt: usage?.lastUsedAt || null,
    settings: settings || {
      preferredLanguage: "en",
      preferredTone: "professional",
      defaultProvider: "gemini",
    },
  };
}

/**
 * Retrieves the user's recent AI generations history.
 */
export async function getUserAIGenerationHistory(userId: string, limit: number = 20, type?: string) {
  return prisma.aIGeneration.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });
}


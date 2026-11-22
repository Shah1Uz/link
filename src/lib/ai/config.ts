export type AIProvider = "gemini" | "openai" | "anthropic";

export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  maxTokens: number;
  temperature: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
}

export const AI_MODELS: Record<string, AIModelConfig> = {
  "gemini-2.5-flash": {
    provider: "gemini",
    model: "gemini-2.5-flash",
    maxTokens: 1024,
    temperature: 0.7,
    costPer1kInputTokens: 0.0001,
    costPer1kOutputTokens: 0.0004,
  },
  "gpt-4o-mini": {
    provider: "openai",
    model: "gpt-4o-mini",
    maxTokens: 1024,
    temperature: 0.7,
    costPer1kInputTokens: 0.00015,
    costPer1kOutputTokens: 0.0006,
  },
};

export const DEFAULT_AI_CONFIG: AIModelConfig = AI_MODELS["gemini-2.5-flash"];

export const AI_TIER_LIMITS: Record<string, { maxGenerationsPerMonth: number; features: string[] }> = {
  FREE: {
    maxGenerationsPerMonth: 10,
    features: [
      "Basic Bio Variations",
      "Standard Headlines",
      "Link Title Optimizer",
      "10 generations / month",
    ],
  },
  PRO: {
    maxGenerationsPerMonth: 200,
    features: [
      "Unlimited Bio & Headline Generation",
      "Full AI Design Studio & Color Recommendation",
      "Comprehensive Link Portfolio Optimization",
      "Content Enhancer & Tone Rewriting",
      "Priority AI Queue & Higher Output Quality",
      "200 generations / month",
    ],
  },
  BUSINESS: {
    maxGenerationsPerMonth: 1000,
    features: [
      "Enterprise Multi-lingual Optimization",
      "Team-wide Shared AI Quotas",
      "Custom Brand Voice Tuning",
      "1000 generations / month",
    ],
  },
};

export function calculateEstimatedCost(inputTokens: number, outputTokens: number, config: AIModelConfig = DEFAULT_AI_CONFIG): number {
  const inputCost = (inputTokens / 1000) * config.costPer1kInputTokens;
  const outputCost = (outputTokens / 1000) * config.costPer1kOutputTokens;
  return Number((inputCost + outputCost).toFixed(6));
}

export function getCurrentMonthPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}


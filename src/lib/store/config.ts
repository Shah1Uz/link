export type ProductType =
  | "DIGITAL_DOWNLOAD"
  | "EBOOK"
  | "COURSE"
  | "SERVICE"
  | "PHYSICAL"
  | "EXTERNAL";

export interface ProductTypeConfig {
  type: ProductType;
  label: string;
  description: string;
  icon: string;
  defaultDeliverableLabel: string;
}

export const PRODUCT_TYPES: Record<ProductType, ProductTypeConfig> = {
  DIGITAL_DOWNLOAD: {
    type: "DIGITAL_DOWNLOAD",
    label: "Digital Download",
    description: "Design assets, templates, code presets, ZIP files",
    icon: "Download",
    defaultDeliverableLabel: "Download Files",
  },
  EBOOK: {
    type: "EBOOK",
    label: "E-Book",
    description: "PDF guides, digital books, written blueprints",
    icon: "BookOpen",
    defaultDeliverableLabel: "Read / Download PDF",
  },
  COURSE: {
    type: "COURSE",
    label: "Online Course",
    description: "Video masterclasses, cohorts, educational modules",
    icon: "GraduationCap",
    defaultDeliverableLabel: "Access Course",
  },
  SERVICE: {
    type: "SERVICE",
    label: "Service / 1-on-1",
    description: "Consulting calls, mentoring, custom design, coaching",
    icon: "Calendar",
    defaultDeliverableLabel: "Book Session",
  },
  PHYSICAL: {
    type: "PHYSICAL",
    label: "Physical Product",
    description: "Apparel, merchandise, hardware, printed items",
    icon: "Package",
    defaultDeliverableLabel: "Track Shipment",
  },
  EXTERNAL: {
    type: "EXTERNAL",
    label: "External Product",
    description: "Affiliate products, external shop listings, partner tools",
    icon: "ExternalLink",
    defaultDeliverableLabel: "View on Partner Store",
  },
};

export const PRODUCT_CATEGORIES = [
  { slug: "general", name: "General" },
  { slug: "development", name: "Development & Code" },
  { slug: "design", name: "Design & Creative" },
  { slug: "business", name: "Business & Marketing" },
  { slug: "productivity", name: "Productivity & Tools" },
  { slug: "education", name: "Education & Learning" },
  { slug: "fitness", name: "Fitness & Health" },
  { slug: "lifestyle", name: "Lifestyle & Music" },
] as const;

export const STORE_SUBSCRIPTION_LIMITS: Record<
  string,
  { maxProducts: number; allowFeatured: boolean; feePercent: number }
> = {
  FREE: {
    maxProducts: 3,
    allowFeatured: false,
    feePercent: 9.0, // 9% platform fee on free tier
  },
  PRO: {
    maxProducts: 25,
    allowFeatured: true,
    feePercent: 4.0, // 4% platform fee on Pro
  },
  BUSINESS: {
    maxProducts: 1000,
    allowFeatured: true,
    feePercent: 0.0, // 0% platform fee on Business
  },
};

export function getProductLimitByTier(tier: string = "FREE"): number {
  const normalized = (tier || "FREE").toUpperCase();
  const limitObj = STORE_SUBSCRIPTION_LIMITS[normalized] || STORE_SUBSCRIPTION_LIMITS.FREE;
  return limitObj.maxProducts;
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    UZS: "so'm",
  };
  const sym = symbols[currency.toUpperCase()] || "$";
  if (currency.toUpperCase() === "UZS") {
    return `${amount.toLocaleString()} ${sym}`;
  }
  return `${sym}${amount.toFixed(2)}`;
}


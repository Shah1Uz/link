import { z } from "zod";

export const ProductTypeEnum = z.enum([
  "DIGITAL_DOWNLOAD",
  "EBOOK",
  "COURSE",
  "SERVICE",
  "PHYSICAL",
  "EXTERNAL",
]);

const isUrlOrPath = (val: string | null | undefined) => {
  if (!val || val === "") return true;
  return (
    val.startsWith("/") ||
    val.startsWith("data:") ||
    val.startsWith("http://") ||
    val.startsWith("https://")
  );
};

export const productCreateSchema = z.object({
  title: z
    .string()
    .min(2, "Product title must be at least 2 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z.string().max(2500, "Description cannot exceed 2500 characters").optional().nullable(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  currency: z.string().max(5).default("USD"),
  imageUrl: z
    .string()
    .refine(isUrlOrPath, { message: "Valid image URL or uploaded file path required" })
    .optional()
    .nullable()
    .or(z.literal("")),
  galleryUrls: z
    .array(z.string().refine(isUrlOrPath, { message: "Valid image URL or file path required" }))
    .optional()
    .nullable()
    .default([]),
  fileUrl: z.string().optional().nullable().or(z.literal("")),
  externalUrl: z
    .string()
    .refine(
      (val) => !val || val === "" || isUrlOrPath(val) || val.includes("."),
      { message: "Valid external URL required" }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  type: ProductTypeEnum.default("DIGITAL_DOWNLOAD"),
  category: z.string().max(50).default("General"),
  categoryId: z.string().optional().nullable(),
  isDigital: z.boolean().default(true),
  isEnabled: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
});

export const checkoutRequestSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerEmail: z.string().email("A valid email address is required for receipt and delivery"),
  customerName: z.string().max(100).optional().nullable(),
  quantity: z.number().int().min(1).max(10).default(1),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export const refundRequestSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().max(500).optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;


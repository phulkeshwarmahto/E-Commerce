import { z } from "zod";

export const productValidator = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  category: z.string().trim().min(1, "Category is required."),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be positive.")),
  originalPrice: z.preprocess((val) => (val === "" || val === null || val === undefined) ? null : Number(val), z.number().min(0).nullable().optional()),
  description: z.string().trim().min(1, "Description is required."),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string().optional(),
    alt: z.string().optional()
  })).optional(),
  emoji: z.string().optional(),
  badge: z.string().nullable().optional(),
  inStock: z.boolean().optional(),
  stockCount: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  deliveryFee: z.preprocess((val) => val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  variants: z.array(z.object({
    name: z.string(),
    price: z.number().min(0),
    originalPrice: z.number().min(0).nullable().optional(),
    stockCount: z.number().min(0)
  })).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  isPublished: z.boolean().optional()
});

import { z } from "zod";

export const reviewValidator = z.object({
  productId: z.string().min(1, "Product is required."),
  body: z.string().trim().min(1, "Review text is required."),
  rating: z.preprocess((val) => val === undefined ? 5 : Number(val), z.number().min(1, "Rating must be at least 1.").max(5, "Rating must be at most 5.")),
  title: z.string().trim().optional(),
  media: z.array(z.string()).optional()
});

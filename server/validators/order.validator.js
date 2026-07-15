import { z } from "zod";

export const orderValidator = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    variantName: z.string().optional()
  })).min(1, "At least one order item is required."),
  shippingAddress: z.object({
    name: z.string().trim().min(1, "Shipping address name is required."),
    phone: z.string().trim().min(1, "Phone number is required."),
    line1: z.string().trim().min(1, "Address line is required."),
    city: z.string().trim().min(1, "City is required."),
    state: z.string().trim().min(1, "State is required."),
    pincode: z.string().trim().regex(/^\d{6}$/, "Valid 6-digit pincode is required.")
  }),
  paymentMethod: z.enum(["cod", "upi", "card", "netbanking"]).optional(),
  couponCode: z.string().trim().optional(),
  specialInstructions: z.string().trim().optional(),
  deliverySlot: z.string().trim().optional()
});

import { z } from "zod";

export const registerValidator = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().email("Valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["user", "seller"]).optional(),
  referredByCode: z.string().trim().optional(),
  referralCode: z.string().trim().optional(),
});

export const loginValidator = z.object({
  email: z.string().trim().email("Valid email is required."),
  password: z.string().min(1, "Password is required."),
});

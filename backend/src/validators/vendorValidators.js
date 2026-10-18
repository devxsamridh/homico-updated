import { z } from "zod";

export const createVendorSchema = z.object({
  user: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ObjectId"),
  business_name: z.string().trim().min(1, "Business name is required").max(150),
  description: z.string().trim().optional().default(""),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email("Invalid email format").toLowerCase(),
  service_categories: z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ObjectId")).optional().default([]),
  city: z.string().trim().min(1, "City is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  is_verified: z.boolean().optional().default(false),
  is_available: z.boolean().optional().default(true),
});

export const updateVendorSchema = z.object({
  business_name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  service_categories: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
  city: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  is_verified: z.boolean().optional(),
  is_available: z.boolean().optional(),
});


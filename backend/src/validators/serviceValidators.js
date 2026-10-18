import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().optional().default(""),
  is_active: z.boolean().optional().default(true),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().optional(),
  is_active: z.boolean().optional(),
});

export const serviceItemSchema = z.object({
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ObjectId"),
  title: z.string().trim().min(1, "Title is required").max(150),
  description: z.string().trim().optional().default(""),
  is_hourly: z.boolean().optional().default(false),
  hourly_rate: z.number().min(0).optional().default(0),
  inspection_fee: z.number().min(0).optional().default(89),
  is_active: z.boolean().optional().default(true),
});

export const updateServiceItemSchema = z.object({
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ObjectId").optional(),
  title: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().optional(),
  is_hourly: z.boolean().optional(),
  hourly_rate: z.number().min(0).optional(),
  inspection_fee: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});


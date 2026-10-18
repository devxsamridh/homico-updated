import { z } from "zod";

export const createQuotationSchema = z.object({
  labor_cost: z.number().min(0, "Labor cost must be >= 0"),
  material_cost: z.number().min(0, "Material cost must be >= 0"),
  description: z.string().trim().optional().default(""),
  valid_days: z.number().int().min(1).max(30).optional().default(7),
});

export const updateQuotationSchema = z.object({
  labor_cost: z.number().min(0).optional(),
  material_cost: z.number().min(0).optional(),
  description: z.string().trim().optional(),
  valid_days: z.number().int().min(1).max(30).optional(),
  status: z.enum(["sent", "accepted", "rejected"]).optional(),
});


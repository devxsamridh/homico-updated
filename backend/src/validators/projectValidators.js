import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  description: z.string().trim().optional().default(""),
  site_address: z.string().trim().min(1, "Site address is required"),
  city: z.string().trim().min(1, "City is required"),
  pincode: z.string().trim().min(1, "Pincode is required"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  estimated_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Estimated end date must be YYYY-MM-DD"),
  budget: z.number().min(0, "Budget must be >= 0"),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  description: z.string().trim().optional(),
  site_address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(["planning", "quotation", "approved", "in_progress", "completed", "cancelled"]).optional(),
});


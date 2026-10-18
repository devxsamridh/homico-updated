import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  category: z.string().trim().min(1, "Category is required"),
  description: z.string().trim().optional().default(""),
  price: z.number().min(0, "Price must be >= 0"),
  unit: z.string().trim().min(1, "Unit is required"),
  stock: z.number().int().min(0, "Stock must be >= 0"),
  vendor: z.string().regex(/^[a-f\d]{24}$/i, "Invalid vendor ObjectId").nullable().optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateMaterialSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  category: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  price: z.number().min(0).optional(),
  unit: z.string().trim().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        material: z.string().regex(/^[a-f\d]{24}$/i, "Invalid material ObjectId"),
        quantity: z.number().int().min(1, "Quantity must be at least 1").max(100000),
      })
    )
    .min(1, "Order must have at least 1 item")
    .max(50, "Order cannot exceed 50 items"),
  delivery_address: z.string().trim().min(1, "Delivery address is required"),
  city: z.string().trim().optional().default(""),
  pincode: z.string().trim().optional().default(""),
  project: z.string().regex(/^[a-f\d]{24}$/i, "Invalid project ObjectId").optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["confirmed", "processing", "out_for_delivery", "delivered", "cancelled"]),
});


import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("Invalid email address format").toLowerCase(),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,30}$/, "Username must be 3-30 characters of lowercase letters, numbers, and underscores"),
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().optional().default(""),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number"),
  // Note: any role field provided is ignored/stripped by Zod
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address format").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refresh: z.string().min(1, "Refresh token is required"),
});

export const adminCreateUserSchema = z.object({
  email: z.string().trim().email("Invalid email address format").toLowerCase(),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,30}$/, "Username must be 3-30 characters of lowercase letters, numbers, and underscores"),
  full_name: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().optional().default(""),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number"),
  role: z.enum(["customer", "vendor", "admin"]),
  is_active: z.boolean().optional().default(true),
});

export const adminUpdateUserSchema = z.object({
  full_name: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().optional(),
  role: z.enum(["customer", "vendor", "admin"]).optional(),
  is_active: z.boolean().optional(),
});


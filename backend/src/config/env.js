import dotenv from "dotenv";
import { z } from "zod";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env"),
});

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(8000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").regex(/^mongodb(?:\+srv)?:\/\//, "MONGODB_URI must be a MongoDB connection URI"),
  CLIENT_ORIGIN: z.string().trim().min(1).optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .refine((value) => !/^replace_with_/i.test(value), "JWT_ACCESS_SECRET must not use a placeholder"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .refine((value) => !/^replace_with_/i.test(value), "JWT_REFRESH_SECRET must not use a placeholder"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().regex(/^[1-9]\d*(?:ms|s|m|h|d|w|y)$/, "ACCESS_TOKEN_EXPIRES_IN must be a positive JWT duration"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().regex(/^[1-9]\d*(?:ms|s|m|h|d|w|y)$/, "REFRESH_TOKEN_EXPIRES_IN must be a positive JWT duration"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const fields = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
  throw new Error(`Invalid environment configuration${fields ? `: ${fields}` : ""}`);
}

if (parsed.data.NODE_ENV === "production" && !parsed.data.CLIENT_ORIGIN) {
  throw new Error("Invalid environment configuration: CLIENT_ORIGIN is required in production");
}

if (parsed.data.JWT_ACCESS_SECRET === parsed.data.JWT_REFRESH_SECRET) {
  throw new Error("Invalid environment configuration: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different");
}

export const env = {
  ...parsed.data,
  CLIENT_ORIGIN: parsed.data.CLIENT_ORIGIN ?? "http://localhost:5173",
};

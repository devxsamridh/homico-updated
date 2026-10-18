import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

const createLimiter = (options) => {
  const limiter = rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        detail: "Too many requests. Please try again later.",
        message: "Too many requests. Please try again later.",
      });
    },
    ...options,
  });

  // Read the environment when handling a request so test setup can configure
  // the shared app before it is created, even though route modules are ESM imports.
  return (req, res, next) => (env.NODE_ENV === "test" ? next() : limiter(req, res, next));
};

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const refreshLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
});


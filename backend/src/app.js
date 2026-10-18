import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import { errorMiddleware, notFoundHandler } from "./middleware/errorMiddleware.js";

export function createApp() {
  const app = express();

  // Express strict routing off (Rule C5: trailing slashes tolerated)
  app.set("strict routing", false);

  // Security headers
  app.use(helmet());

  // CORS configuration (Rule C6)
  const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, Postman) or matching origin
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type"],
      credentials: true,
    })
  );

  // Request compression
  app.use(compression());

  // JSON parser with size limit
  app.use(express.json({ limit: "100kb" }));

  // HTTP logging
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Rate limiter
  app.use(globalLimiter);

  // Cache-Control default for authenticated requests
  app.use((req, res, next) => {
    if (req.headers.authorization) {
      res.set("Cache-Control", "no-store");
    }
    next();
  });

  // API router mount
  app.use("/api", routes);

  // 404 Handler for undefined routes
  app.use(notFoundHandler);

  // Central Error Handler (Rule C2)
  app.use(errorMiddleware);

  return app;
}


import { createApp } from "./app.js";
import { connectDB, closeDB } from "./config/db.js";
import { env } from "./config/env.js";

async function startServer() {
  await connectDB();
  console.log(" Connected to MongoDB");

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(` Homico Backend running on http://localhost:${env.PORT}`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log("HTTP server closed.");
      await closeDB();
      console.log("MongoDB connection closed.");
      process.exit(0);
    });

    // Force exit after 10s timeout
    setTimeout(() => {
      console.error("Forceful shutdown after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});


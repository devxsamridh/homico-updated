import { pathToFileURL } from "node:url";
import { createApp } from "./app.js";
import { connectDB, closeDB } from "./config/db.js";
import { env } from "./config/env.js";

// Vercel recognizes this default export and invokes it as one Express Function.
// The listener below only runs for `npm start`, preserving local development.
const app = createApp();
export default app;

async function startServer() {
  await connectDB();
  console.log(" Connected to MongoDB");

  const server = app.listen(env.PORT, () => {
    console.log(` Homico Backend listening on port ${env.PORT}`);
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);

    const timeout = setTimeout(() => {
      console.error("Graceful shutdown timed out.");
      process.exit(1);
    }, 10000);
    timeout.unref();

    server.close(async (error) => {
      clearTimeout(timeout);
      if (error) {
        console.error("HTTP server shutdown failed.");
        process.exit(1);
        return;
      }

      try {
        await closeDB();
        console.log("HTTP server and MongoDB connection closed.");
        process.exit(0);
      } catch {
        console.error("MongoDB shutdown failed.");
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  server.on("error", (error) => {
    const name = typeof error?.name === "string" ? error.name : "Error";
    const code = typeof error?.code === "string" ? `, code: ${error.code}` : "";
    console.error(`HTTP server failed (${name}${code})`);
    process.exit(1);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    const name = typeof error?.name === "string" ? error.name : "Error";
    console.error(`Failed to start server (${name})`);
    process.exit(1);
  });
}

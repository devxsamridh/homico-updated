import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");

  if (mode === "production" && !environment.VITE_API_URL) {
    throw new Error("VITE_API_URL must be set for a production build");
  }

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "src") },
    },
    server: { port: 5173 },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            motion: ["framer-motion"],
            icons: ["@phosphor-icons/react"],
          },
        },
      },
    },
  };
});

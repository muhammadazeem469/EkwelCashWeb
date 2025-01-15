import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": {
        target: "https://login-sandbox.venly.io",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "https://token-api-sandbox.venly.io",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

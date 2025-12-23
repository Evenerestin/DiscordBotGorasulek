import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "frontend",
  base: "/",

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsDir: "assets",
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: false,
    allowedHosts: ["localhost", "gorasul.pl"],
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

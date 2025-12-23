import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: ".",
  base: "./",
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
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

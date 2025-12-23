import react from "@vitejs/plugin-react";
import path from "path/win32";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "./frontend",
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
    outDir: "../frontend/dist",
    emptyOutDir: true,
    // Optional: Optimize for your React Router setup
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "frontend/index.html"),
      },
    },
  },
});

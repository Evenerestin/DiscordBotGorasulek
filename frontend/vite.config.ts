import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "./frontend",
  server: {
    port: 5173,
    strictPort: false,
    allowedHosts: ["gorasul.pl", "localhost"],
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["gorasul.pl", "localhost"],
  },
});

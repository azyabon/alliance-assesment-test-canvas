import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/alliance-assesment-test-canvas/',
  plugins: [react()],
  optimizeDeps: {
    include: ["konva"],
  },
});
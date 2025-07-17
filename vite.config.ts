import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: '/alliance-assesment-test-canva/',
  plugins: [react()],
  optimizeDeps: {
    include: ["konva"],
  },
});
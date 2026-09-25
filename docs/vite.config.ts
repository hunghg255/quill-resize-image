import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// The docs use the library straight from ../src so the playground always runs the current code
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "quill-resize-image": fileURLToPath(new URL("../src/main.ts", import.meta.url)),
    },
  },
  server: {
    fs: { allow: [".."] },
  },
});

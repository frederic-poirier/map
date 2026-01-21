import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [solidPlugin(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:8788",
      "/tiles": "http://localhost:8788",
      "/auth": "http://localhost:8788",
    }
  },
  build: {
    target: "esnext",
  },
});

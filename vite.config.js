import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isProd = process.env.NODE_ENV === "production";

export default defineConfig({
  plugins: [react()],
  server: isProd
    ? {}
    : {
        proxy: {
          "/api/elasticsearch": {
            target: "https://scicrunch.org",
            changeOrigin: true,
            secure: true,
            rewrite: (path) =>
              path.replace(/^\/api/elasticsearch/, "/api/1/elastic/Interlex_pr/_search"),
          },
        },
      },
});

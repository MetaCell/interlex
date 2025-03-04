import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/elasticsearch": {
        target: "https://scicrunch.org",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/api\/elasticsearch/, "/api/1/elastic/Interlex_pr/_search"),
        headers: {
          "Content-Type": "application/json",
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.method = "POST";  // Force requests to POST
          });
        }
      }
    },
  },
});


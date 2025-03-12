import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiKey = process.env.ELASTICSEARCH_API_KEY || "your-default-key";
console.log("🛠️ API Key being used:", apiKey);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/elasticsearch": {
        target: "https://scicrunch.org",
        changeOrigin: true,
        secure: true, // Ensure HTTPS requests work
        rewrite: (path) => path.replace(/^\/api\/elasticsearch/, `/api/1/elastic/Interlex_pr/_search?key=${apiKey}`),
        headers: {
          // Forward headers correctly
          "Content-Type": "application/json",
        },
      }
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/elasticsearch": {
        target: "https://scicrunch.org",
        changeOrigin: true,
        secure: true, // Ensure HTTPS requests work
        rewrite: (path) =>
          path.replace(/^\/api\/elasticsearch/, "/api/1/elastic/Interlex_pr/_search"),
        headers: {
          // Forward headers correctly
          "Content-Type": "application/json",
        },
      },
      "^/u/ops/.*": {
        target: "https://uri.olympiangods.org",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          console.log(_options);
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
            console.log('proxy request', _req);
            console.log('proxy response', _res);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Response:', _res);
            console.log('Request:', proxyReq);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response', _res);
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});

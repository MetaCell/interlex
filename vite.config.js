import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/elasticsearch": {
        target: "https://api.scicrunch.io",
        changeOrigin: true,
        secure: true, // Ensure HTTPS requests work
        rewrite: (path) =>
          path.replace(/^\/api\/elasticsearch/, "/elastic/v1/Interlex_pr/_search"),
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
      '^/([^/]+)/priv/(.*)': {
        target: "https://uri.olympiangods.org",
        secure: false,
        changeOrigin: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        configure: (proxy, _options) => {
          console.log(_options);
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
            console.log('proxy request', _req);
            console.log('proxy response', _res);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Headers sent to backend:', proxyReq.getHeaders());
            console.log('Response:', _res);
            console.log('Request:', proxyReq);
            // Forward cookies manually if needed
            if (req.headers.cookie) {
              proxyReq.setHeader('cookie', req.headers.cookie);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const location = proxyRes.headers['location'];
            console.log('Received location', location);
          
            if (proxyRes.statusCode === 303 && location) {
              res.setHeader('X-Redirect-Location', location);
              res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
            }
          });
                
        },
      }
    },
  },
});

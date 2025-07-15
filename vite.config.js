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
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response', res);
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            const location = proxyRes.headers['location'];
            console.log('Received location', location);
            if (proxyRes.statusCode === 303 && location) {
              // Prevent browser from seeing the actual Location
              delete proxyRes.headers['location'];
              // Inject the location into a custom header we can use in Axios
              res.setHeader('X-Redirect-Location', location);
            }

            // Required for credentialed CORS
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/[^/]+/(tmp|ilx)_.*\\.(html|ttl|jsonld|n3|owl|csv)$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // Keep full path intact
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      },
      '^/[^/]+/ontologies/uris/.*\\.(html|jsonld)$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // Keep the full path
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      },
      '^/[^/]+/ontologies/uris/.*/spec': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // Keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.authorization) {
              proxyReq.setHeader('Authorization', req.headers.authorization);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const location = proxyRes.headers['location'];
          
            if (proxyRes.statusCode === 303 && location) {
              delete proxyRes.headers['location'];
              res.setHeader('X-Redirect-Location', location);
              res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
              res.setHeader('Access-Control-Allow-Credentials', 'true');
              res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
              // Send a JSON body (for fetch, etc.)
              res.end(JSON.stringify({ location }));
              return;
            }

            // Required for credentialed CORS
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/[^/]+/[^/]+/versions$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // Keep full path
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      }
    },
  },
});

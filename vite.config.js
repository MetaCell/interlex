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
      '^/([^/]+)/priv/password_change$': {
        target: "https://uri.olympiangods.org",
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('error', (err, req) => {
            console.log('Password change proxy error:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying password change request:', req.method, req.url);
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
            // Set appropriate content type for password change (likely form data)
            if (req.method === 'POST') {
              proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Password change response:', proxyRes.statusCode, req.url);
            // handle redirects
            const location = proxyRes.headers['location'];
            if (proxyRes.statusCode === 303 && location) {
              delete proxyRes.headers['location'];
              res.setHeader('X-Redirect-Location', location);
            }
            
            // CORS headers
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/([^/]+)/priv/entity(.*)': {
        target: "https://uri.olympiangods.org",
        secure: false,
        changeOrigin: true,
        headers: {
          "Content-Type": "application/json",
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
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            const location = proxyRes.headers['location'];
            const origin = req.headers.origin;
            if (proxyRes.statusCode === 303 && location) {
              // Convert 303 → 200 + JSON body so fetch() can read the location.
              // (redirect: 'manual' returns opaque status-0 response; headers inaccessible.)
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('X-Redirect-Location', location);
              if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
              res.setHeader('Access-Control-Allow-Credentials', 'true');
              res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
              res.writeHead(200);
              res.end(JSON.stringify({ location }));
              return;
            }

            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
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
      // "Is this external id mapped to an InterLex record?" — 404 while unmapped, the record
      // otherwise. Without this rule the request falls through to the SPA and every probe reads
      // 200 + index.html, i.e. "mapped", which is exactly backwards.
      '^/[^/]+/uris/.+': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies so mappings in a non-base group resolve
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      },
      // Any `{prefix}_{id}` term, not just ilx_/tmp_: once an npokb id is mapped to a record its
      // tabs light up, and they read this endpoint. The extension allow-list keeps the rule off
      // asset paths, and `(?!data/)` off the local ontology copy — proxying that would send the
      // Cell Card's ~16MB source upstream, where it 404s (nginx guards it with `location ^~`).
      '^/(?!data/)[^/]+/[A-Za-z][A-Za-z0-9.-]*_[^/]*\\.(html|ttl|jsonld|n3|owl|csv)$': {
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
            if (req.headers.cookie) {
              proxyReq.setHeader('Cookie', req.headers.cookie);
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
      '^/[^/]+/[^/]+/versions(/[^/]+)?$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: path => path, // Keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies so non-base group versions resolve
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const origin = req.headers.origin;
            if (origin) {
              res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Credentials', 'true');
          });
        },
      },
      '^/[^/]+/query/transitive/.*': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // helpful CORS for credentialed requests in dev
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/[^/]+/ontologies$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // helpful CORS for credentialed requests in dev
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/[^/]+/curies$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // helpful CORS for credentialed requests in dev
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      '^/[^/]+/contributions$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // helpful CORS for credentialed requests in dev
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
          });
        },
      },
      // Pattern for ilx_/tmp_ endpoints (bulk term editing + newly created terms)
      '^/[^/]+/(ilx|tmp)_[^/]+$': {
        target: 'https://uri.olympiangods.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep full path
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error for ilx endpoint:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxying request to ilx endpoint:', req.method, req.url);
            // pass through auth/cookies if present
            if (req.headers.authorization) proxyReq.setHeader('Authorization', req.headers.authorization);
            if (req.headers.cookie) proxyReq.setHeader('Cookie', req.headers.cookie);
            // Ensure proper content type for PATCH requests
            if (req.method === 'PATCH') {
              proxyReq.setHeader('Content-Type', 'application/json');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received response from ilx endpoint:', proxyRes.statusCode, req.url);
            // helpful CORS for credentialed requests in dev
            const origin = req.headers.origin;
            if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            res.setHeader('Access-Control-Expose-Headers', 'X-Redirect-Location');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
          });
        },
      },
    },
  },
});

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Handle JSON requests

// Proxy setup (similar to Vite's proxy)
app.use(
  "/api/elasticsearch",
  createProxyMiddleware({
    target: "https://scicrunch.org",
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      "^/api/elasticsearch": "/api/1/elastic/Interlex_pr/_search",
    },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("Content-Type", "application/json");
    },
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("Proxy Server is Running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

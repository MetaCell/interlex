const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy setup
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

// 🔹 Prevent crash if server is already running
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// Handle EADDRINUSE error
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`⚠️ Port ${PORT} is already in use. Server not restarted.`);
    process.exit(1);
  } else {
    throw err;
  }
});

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://scicrunch.org/api/1/elastic/Interlex_pr/_search";
const API_KEY = process.env.ELASTICSEARCH_API_KEY || "your-default-key";

app.use("/api/elasticsearch", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}?key=${API_KEY}`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Error forwarding request:", error);
    res.status(500).json({ error: "Failed to reach ElasticSearch API" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
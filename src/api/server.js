const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/scicrunch', async (req, res) => {
  const apiUrl = 'https://scicrunch.org/api/1/term/elastic/search';
  const apiKey = 'tvVqyYwrQqolqVfMo45cu31t5uEGx6RZ';

  try {
    // Extract the query from the request body
    const query = req.body.query;

    if (!query) {
      return res.status(400).json({ message: "Missing 'query' in request body." });
    }

    // Make the GET request to the external API
    const response = await axios.get(apiUrl, {
      params: {
        api_key: apiKey,
        query: JSON.stringify({ match: { label: query } }),
      },
    });

    console.log("Response from ElasticSearch:", response.data);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error in proxy:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.message,
      error: error.response?.data,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
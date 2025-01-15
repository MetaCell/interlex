const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Proxy endpoint
app.post('/api/scicrunch', async (req, res) => {
  const apiUrl = 'https://scicrunch.org/api/1/term/elastic/search';
  const apiKey = 'tvVqyYwrQqolqVfMo45cu31t5uEGx6RZ';

  try {
    console.log("Request body received:", req.body);

    const response = await axios.get(apiUrl, {
      headers: {
        'api_key' : apiKey
      },
      params: {
        api_key: apiKey, // Correct query parameter name
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
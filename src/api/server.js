const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/scicrunch', async (req, res) => {
  const apiUrl = process.env.SCICRUNCH_API_URL;
  const apiKey = process.env.SCICRUNCH_API_KEY;

  try {
    const query = req.body.query;
    if (!query) {
      return res.status(400).json({ message: "Missing 'query' in request body." });
    }

    const response = await axios.get(apiUrl, {
      params: {
        api_key: apiKey,
        query: JSON.stringify({ match: { label: query } }),
      },
    });

    console.log("Response from SciCrunch:", response.data);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error in proxy:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.message,
      error: error.response?.data,
    });
  }
});

app.post('/olympianGods', async (req, res) => {
  try {
    const baseUrl = process.env.OLYMPIAN_GODS_URL;
    const url = `${baseUrl}${req.body?.group}/${req?.body?.term}.${req?.body?.type}`;

    const response = await axios.get(url);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error in proxy:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.message,
      error: error.response?.data,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
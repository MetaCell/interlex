import axios from 'axios';

const sciCrunchInstance = axios.create({
  baseURL: 'https://scicrunch.org/api/1', // ElasticSearch API base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add API key to each request
sciCrunchInstance.interceptors.request.use((config) => {
  config.params = {
    ...(config.params || {}),
    api_key: 'tvVqyYwrQqolqVfMo45cu31t5uEGx6RZ', // Add your API key here
  };
  return config;
});

export default sciCrunchInstance;

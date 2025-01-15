import axios from 'axios';

export const customAxiosInstance = axios.create({
  baseURL: 'https://scicrunch.org/api/1', // Base URL for the API
  headers: {
    'Content-Type': 'application/json',
  },
});

customAxiosInstance.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: 'tvVqyYwrQqolqVfMo45cu31t5uEGx6RZ', // Add the API key to all requests
  };
  return config;
});

import axios from "axios";
import { API_CONFIG } from "../../config/config.js";

export const customAxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_SCICRUNCH_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

customAxiosInstance.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    api_key: process.env.API_KEY, // Load API key from .env
  };
  return config;
});
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
    api_key: "tvVqyYwrQqolqVfMo45cu31t5uEGx6RZ",
  return config;
});
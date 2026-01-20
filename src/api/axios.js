import axios from "axios";
import { tokenManager } from "../utils/tokenManager";

const api = axios.create({
  baseURL: 'https://billing-backend-sjt0.onrender.com',
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true
});

// Add request logging in development
api.interceptors.request.use(
  (config) => {
    console.log('🔵 API Request:', config.method.toUpperCase(), config.url);

    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token added to request');
    } else {
      console.warn('⚠️ No auth token found');
    }
    return config;
  },
  (error) => {
    console.error('🔴 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log('🟢 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🔴 API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      tokenManager.removeToken();
      // Uncomment if you want auto-redirect: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// API Configuration matching Django backend endpoints
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to handle Django's nested response format: {data: {products: [...]}}
const handleDjangoResponse = (response) => {
  // Django returns: {data: {products: [...]}, success: true}
  // or {data: [...], success: true}
  if (response.data) {
    return response.data;
  }
  return response;
};

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;

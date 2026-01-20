// API Configuration matching Django backend endpoints
export const REACT_APP_API_BASE_URL = 'https://billing-backend-sjt0.onrender.com/api';

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
  baseURL: REACT_APP_API_BASE_URL,
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

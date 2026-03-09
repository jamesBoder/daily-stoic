import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';



const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
const TOKEN_KEY = 'auth_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Safety net: do NOT redirect guests — they have no token to clear
      const isGuestSession = sessionStorage.getItem('is_guest') === 'true';
      if (!isGuestSession) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

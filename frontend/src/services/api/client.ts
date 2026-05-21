import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../../utils/constants';

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
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

const SESSION_EXTEND_HOURS = 24;

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Auto-extend session expiry on any successful authenticated request.
    // If less than 24 h remain, push the expiry to now + 24 h so active
    // users are never logged out mid-session.
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expiry = localStorage.getItem(STORAGE_KEYS.EXPIRY);
    if (token && expiry) {
      const expiryMs = new Date(expiry).getTime();
      const minExpiryMs = Date.now() + SESSION_EXTEND_HOURS * 60 * 60 * 1000;
      if (expiryMs < minExpiryMs) {
        localStorage.setItem(STORAGE_KEYS.EXPIRY, new Date(minExpiryMs).toISOString());
      }
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Safety net: do NOT redirect guests — they have no token to clear
      const isGuestSession = sessionStorage.getItem('is_guest') === 'true';
      if (!isGuestSession) {
        // Unauthorized - clear all auth storage and redirect to login
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.EXPIRY);
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
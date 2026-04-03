import apiClient from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from '../../utils/constants';
import { AuthResponse, LoginCredentials, SignupCredentials, User } from '../../types/user';
import { showToast } from '../../utils/toast';

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials
      );
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      
      showToast.success('Welcome back!');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        showToast.error('Invalid email or password');
      } else if (error.response?.status === 429) {
        showToast.error('Too many login attempts. Please try again later.');
      } else {
        showToast.error('Login failed. Please try again.');
      }
      throw error;
    }
  },

  // Signup
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.SIGNUP,
        credentials
      );
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
      }
      
      showToast.success('Account created successfully! Welcome!');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        showToast.error('Email already exists. Please use a different email.');
      } else if (error.response?.status === 400) {
        showToast.error('Invalid signup data. Please check your information.');
      } else {
        showToast.error('Signup failed. Please try again.');
      }
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
      showToast.success('Logged out successfully');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<{ user: User }>(API_ENDPOINTS.ME);
      return response.data.user;
    } catch (error: any) {
      showToast.error('Failed to load user data');
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  },
};
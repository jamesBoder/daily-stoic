import apiClient from './api';
import { User } from '../../types/user';
import { showToast } from '../../utils/toast';
import { STORAGE_KEYS } from '../../utils/constants';

const TOKEN_KEY = STORAGE_KEYS.TOKEN;
const USER_KEY = STORAGE_KEYS.USER;
const TOKEN_EXPIRY_KEY = STORAGE_KEYS.EXPIRY;
const REMEMBER_ME_DAYS = 30;
const DEFAULT_SESSION_HOURS = 24;

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
  name?: string;
}

export const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/login',
        credentials
      );
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        // Set token expiry based on rememberMe
        const expiryDate = new Date();
        if (credentials.rememberMe) {
          expiryDate.setDate(expiryDate.getDate() + REMEMBER_ME_DAYS);
        } else {
          expiryDate.setHours(expiryDate.getHours() + DEFAULT_SESSION_HOURS);
        }
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
      }
      
      showToast.success('Welcome back!', 'welcome-back');
      return response.data;
    } catch (error: any) {
      // throw error
      throw error;
    }
  },

  // Signup — returns message only; user must verify email before logging in
  signup: async (credentials: SignupCredentials): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post<{ message: string }>(
        '/api/auth/register',
        credentials
      );
      // DO NOT store token — user is not verified yet
      // DO NOT show success toast — Signup.tsx navigates to /verify-email-pending
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/auth/logout');
      showToast.success('Logged out successfully', 'logged-out');
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
    }
  },

  // Get current user. Pass silent=true during auth init to suppress the toast.
  getCurrentUser: async (silent = false): Promise<User> => {
    try {
      const response = await apiClient.get<{"user": User}>('/api/auth/me');
      return response.data.user;
    } catch (error: any) {
      if (!silent) showToast.error('Failed to load user data');
      throw error;
    }
  },

  // Check if user is authenticated and token is not expired
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    
    if (!token) {
      return false;
    }
    
    // Check if token has expired
    if (expiry) {
      const expiryDate = new Date(expiry);
      const now = new Date();
      
      if (now > expiryDate) {
        // Token expired, clear storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        return false;
      }
    }
    
    return true;
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    try {
      return JSON.parse(userData);
    } catch {
      // Corrupted data — clear it so the app doesn't stay broken
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  // Login with token (for OAuth)
  loginWithToken: async (token: string): Promise<AuthResponse> => {
    // Store the token first
    localStorage.setItem(TOKEN_KEY, token);
    
    // Fetch user data using the token
    const user = await authService.getCurrentUser();
    
    // Store user data
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Set default session expiry (24 hours) for OAuth logins
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + DEFAULT_SESSION_HOURS);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    
    return {
      token,
      user
    };
  },


  // Set auth token manually
  setAuthToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
};

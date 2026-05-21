import React, { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { User, LoginCredentials, SignupCredentials } from "../types/user";
import { authService } from "../services/api/authService";
import { queryClient } from "../lib/queryClient";
import { showToast } from "../utils/toast";

const GUEST_SESSION_KEY = "is_guest";

const GUEST_USER: User = {
  id: 0,
  email: "",
  username: "Guest",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_guest: true,
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  setAuthToken: (token: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  loginAsGuest: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<User | null>(null);
  userRef.current = user;

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Restore guest session from sessionStorage (survives page refresh)
        const isGuestSession = sessionStorage.getItem(GUEST_SESSION_KEY) === "true";
        if (isGuestSession) {
          setUser(GUEST_USER);
          setIsLoading(false);
          return;
        }

        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            const currentUser = await authService.getCurrentUser(true); // silent — no toast on init
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // Clear invalid token
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Revalidate session when the user returns to the tab after being away
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      const currentUser = userRef.current;
      if (!currentUser || currentUser.is_guest) return;

      if (!authService.isAuthenticated()) {
        // Token expired while away — log out and notify
        await authService.logout();
        setUser(null);
        queryClient.clear();
        showToast.error("Your session has expired. Please sign in again.", "session-expired");
        return;
      }

      // Token still valid — silently refresh user data in background
      try {
        const refreshed = await authService.getCurrentUser(true);
        setUser(refreshed);
      } catch {
        // 401 will be caught by the axios interceptor which handles logout
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const loginAsGuest = () => {
    sessionStorage.setItem(GUEST_SESSION_KEY, "true");
    setUser(GUEST_USER);
  };

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    // Clear any guest session before setting real user
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    queryClient.clear();
    setUser(response.user);
  };

  const signup = async (credentials: SignupCredentials) => {
    await authService.signup(credentials);
    // DO NOT call setUser() — user is not verified yet
    // DO NOT clear guest session — user isn't logged in
    // DO NOT clear queryClient — nothing to clear
    // Signup.tsx handles navigation to /verify-email-pending
  };

  const logout = async () => {
    // Guest logout: skip API call, just clear session state
    if (user?.is_guest) {
      sessionStorage.removeItem(GUEST_SESSION_KEY);
      setUser(null);
      return;
    }
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear user anyway
      setUser(null);
    }
  };

  const loginWithToken = async (token: string) => {
    const response = await authService.loginWithToken(token);
    // Clear any guest session before setting real user (OAuth flow)
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    queryClient.clear();
    setUser(response.user);
  };

  const refreshUser = async () => {
    // Guests have no real user to refresh — skip silently
    if (user?.is_guest) return;
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isGuest: user?.is_guest === true,
    isLoading,
    login,
    signup,
    logout,
    setAuthToken: authService.setAuthToken,
    loginWithToken,
    refreshUser,
    loginAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

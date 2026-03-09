// OAuth Callback Handler

import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (!token) {
        console.error("No token found in URL");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Store token in localStorage with correct key
        localStorage.setItem("auth_token", token);

        // Update auth context
        await loginWithToken(token);

        // Redirect to daily quote
        navigate("/", { replace: true });
      } catch (error) {
        console.error("Google OAuth callback error:", error);
        navigate("/login", { replace: true });
      }
    };

    handleGoogleCallback();
  }, [location.search, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-700 dark:text-gray-300">
        Processing Google login...
      </p>
    </div>
  );
};

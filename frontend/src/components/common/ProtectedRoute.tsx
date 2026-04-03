import React, { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { showToast } from "../../utils/toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the location they were trying to access
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * PublicOnlyRoute — wraps routes that authenticated (non-guest) users should NOT access.
 * Redirects logged-in users to "/" (home). Guests and unauthenticated users pass through.
 * Used for /login and /signup.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  // Authenticated non-guest users should not see login/signup
  if (isAuthenticated && !isGuest) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * GuestBlockedRoute — wraps routes that guests cannot access.
 * Redirects guests to /daily with a one-time toast notification.
 * Non-guests pass through normally.
 */
export const GuestBlockedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const location = useLocation();
  // useRef guard ensures toast fires exactly once per mount (Pitfall 7)
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (!isLoading && isGuest && !toastShownRef.current) {
      toastShownRef.current = true;
      showToast.info("Sign up to access this feature!");
    }
  }, [isLoading, isGuest]);

  if (isLoading) {
    return <VerseCardSkeleton />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (isGuest) {
    return <Navigate to="/daily" replace />;
  }

  return <>{children}</>;
};

import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, GuestBlockedRoute, PublicOnlyRoute } from "./components/common/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "react-hot-toast";
import { VerseCardSkeleton } from "./components/common/Skeleton";
import "./App.css";


// Lazy-load auth pages — authenticated users never visit these
const Login = lazy(() =>
  import("./features/auth/Login").then((m) => ({ default: m.Login }))
);
const Signup = lazy(() =>
  import("./features/auth/Signup").then((m) => ({ default: m.Signup }))
);
const VerifyEmailPending = lazy(() =>
  import("./features/auth/VerifyEmailPending").then((m) => ({ default: m.VerifyEmailPending }))
);
const VerifyEmail = lazy(() =>
  import("./features/auth/VerifyEmail").then((m) => ({ default: m.VerifyEmail }))
);
const ForgotPassword = lazy(() =>
  import("./features/auth/ForgotPassword").then((m) => ({ default: m.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import("./features/auth/ResetPassword").then((m) => ({ default: m.ResetPassword }))
);

// Lazy load non-critical components (with named export handling)
const DailyVerse = lazy(() =>
  import("./features/verse/DailyVerse").then((module) => ({
    default: module.DailyVerse,
  }))
);

const FavoritesList = lazy(() =>
  import("./features/favorites/FavoritesList").then((module) => ({
    default: module.FavoritesList,
  }))
);

const Profile = lazy(() =>
  import("./features/profile/Profile").then((module) => ({
    default: module.Profile,
  }))
);

const Settings = lazy(() =>
  import("./features/profile/Settings").then((module) => ({
    default: module.Settings,
  }))
);

const GoogleCallback = lazy(() =>
  import("./features/auth/GoogleCallback").then((module) => ({
    default: module.GoogleCallback,
  }))
);

// lazy load About page for non-authenticated users
const About = lazy(() =>
  import("./features/about/About").then((module) => ({
    default: module.About,
  }))
);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
            <Routes>
              {/* Public-only routes — redirect authenticated users to home */}
              <Route path="/login" element={<PublicOnlyRoute><Suspense fallback={<VerseCardSkeleton />}><Login /></Suspense></PublicOnlyRoute>} />
              <Route path="/signup" element={<PublicOnlyRoute><Suspense fallback={<VerseCardSkeleton />}><Signup /></Suspense></PublicOnlyRoute>} />

              {/* Email verification & password reset — public routes */}
              <Route path="/verify-email-pending" element={<Suspense fallback={<VerseCardSkeleton />}><VerifyEmailPending /></Suspense>} />
              <Route path="/verify-email" element={<Suspense fallback={<VerseCardSkeleton />}><VerifyEmail /></Suspense>} />
              <Route path="/forgot-password" element={<Suspense fallback={<VerseCardSkeleton />}><ForgotPassword /></Suspense>} />
              <Route path="/reset-password" element={<Suspense fallback={<VerseCardSkeleton />}><ResetPassword /></Suspense>} />
              <Route
                path="/about"
                element={
                  <Suspense fallback={<VerseCardSkeleton />}>
                    <About />
                  </Suspense>
                }
              />
              {/* Lazy-loaded public route */}
              <Route
                path="/auth/google/callback"
                element={
                  <Suspense fallback={<VerseCardSkeleton />}>
                    <GoogleCallback />
                  </Suspense>
                }
              />

              {/* Protected routes with layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout  />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <DailyVerse />
                    </Suspense>
                  }
                />
                <Route
                  path="daily"
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <DailyVerse />
                    </Suspense>
                  }
                />
                <Route
                  path="favorites"
                  element={
                    <GuestBlockedRoute>
                      <Suspense fallback={<VerseCardSkeleton />}>
                        <FavoritesList />
                      </Suspense>
                    </GuestBlockedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <GuestBlockedRoute>
                      <Suspense fallback={<VerseCardSkeleton />}>
                        <Profile />
                      </Suspense>
                    </GuestBlockedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<VerseCardSkeleton />}>
                      <Settings />
                    </Suspense>
                  }
                />
                
              </Route>

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;

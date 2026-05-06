// src/App.tsx — updated route structure

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PageLoader } from './components/common/Loading'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/common/ProtectedRoute'
// Home page loaded eagerly — it's the LCP element
import { DailyQuote } from './features/quote/DailyQuote'

// All other routes lazy-loaded to keep the initial bundle small
const FavoritesList = lazy(() => import('./features/favorites/FavoritesList').then(m => ({ default: m.FavoritesList })))
const HistoryList = lazy(() => import('./features/history/HistoryList').then(m => ({ default: m.HistoryList })))
const Profile = lazy(() => import('./features/profile/Profile').then(m => ({ default: m.Profile })))
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })))
const Signup = lazy(() => import('./features/auth/Signup').then(m => ({ default: m.Signup })))
const VerifyEmail = lazy(() => import('./features/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })))
const VerifyEmailPending = lazy(() => import('./features/auth/VerifyEmailPending').then(m => ({ default: m.VerifyEmailPending })))
const ForgotPassword = lazy(() => import('./features/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./features/auth/ResetPassword').then(m => ({ default: m.ResetPassword })))
const GoogleCallback = lazy(() => import('./features/auth/GoogleCallback').then(m => ({ default: m.GoogleCallback })))
const About = lazy(() => import('./features/about/About').then(m => ({ default: m.About })))
const Settings = lazy(() => import('./features/profile/Settings').then(m => ({ default: m.Settings })))
const TraditionBrowser = lazy(() => import('./features/traditions/TraditionBrowser').then(m => ({ default: m.TraditionBrowser })))
const TraditionPage = lazy(() => import('./features/traditions/TraditionPage').then(m => ({ default: m.TraditionPage })))
const AuthorPage = lazy(() => import('./features/traditions/AuthorPage').then(m => ({ default: m.AuthorPage })))
const PhilosopherTimeline = lazy(() => import('./features/traditions/PhilosopherTimeline').then(m => ({ default: m.PhilosopherTimeline })))
const ReadingPlanList = lazy(() => import('./features/reading-plans/ReadingPlanList').then(m => ({ default: m.ReadingPlanList })))
const ConversePage = lazy(() => import('./features/ai/ConversePage').then(m => ({ default: m.ConversePage })))
const ReadingPlanDetail = lazy(() => import('./features/reading-plans/ReadingPlanDetail').then(m => ({ default: m.ReadingPlanDetail })))
const PricingPage = lazy(() => import('./features/subscription/PricingPage').then(m => ({ default: m.PricingPage })))
const SubscriptionSuccess = lazy(() => import('./features/subscription/SubscriptionSuccess').then(m => ({ default: m.SubscriptionSuccess })))
const OnboardingFlow = lazy(() => import('./features/onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })))
const ConfluencePage = lazy(() => import('./features/games/confluence/ConfluencePage').then(m => ({ default: m.ConfluencePage })))

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
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
            <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Onboarding — full-screen, no nav */}
              <Route path="onboarding" element={<OnboardingFlow />} />

              <Route element={<Layout />}>
                {/* Public */}
                <Route index element={<DailyQuote />} />
                <Route path="about" element={<About />} />
                <Route path="traditions" element={<TraditionBrowser />} />
                <Route path="traditions/timeline" element={<PhilosopherTimeline />} />
                <Route path="traditions/:slug" element={<TraditionPage />} />
                <Route path="authors/:slug" element={<AuthorPage />} />
                <Route path="reading-plans" element={<ReadingPlanList />} />
                <Route path="reading-plans/:slug" element={<ReadingPlanDetail />} />
                <Route path="converse" element={<ConversePage />} />
                <Route path="games" element={<Navigate to="/games/confluence" replace />} />
                <Route path="games/confluence" element={<ConfluencePage />} />

                {/* Auth */}
                <Route path="auth">
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Signup />} />
                  <Route path="verify-email" element={<VerifyEmail />} />
                  <Route path="verify-email-pending" element={<VerifyEmailPending />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route path="reset-password" element={<ResetPassword />} />
                  <Route path="google/callback" element={<GoogleCallback />} />
                </Route>

                {/* Protected */}
                <Route path="saved" element={<ProtectedRoute><FavoritesList /></ProtectedRoute>} />
                <Route path="history" element={<ProtectedRoute><HistoryList /></ProtectedRoute>} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* Subscription */}
                <Route path="upgrade" element={<PricingPage />} />
                <Route path="subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
              </Route>
            </Routes>
            </Suspense>
          </LanguageProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
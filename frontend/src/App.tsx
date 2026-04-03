// src/App.tsx — updated route structure

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { DailyQuote } from './features/quote/DailyQuote'
import { FavoritesList } from './features/favorites/FavoritesList'
import { HistoryList } from './features/history/HistoryList'
import { Profile } from './features/profile/Profile'
import { Login } from './features/auth/Login'
import { Signup } from './features/auth/Signup'
import { VerifyEmail } from './features/auth/VerifyEmail'
import { VerifyEmailPending } from './features/auth/VerifyEmailPending'
import { ForgotPassword } from './features/auth/ForgotPassword'
import { ResetPassword } from './features/auth/ResetPassword'
import { GoogleCallback } from './features/auth/GoogleCallback'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { About } from './features/about/About'
import { Settings } from './features/profile/Settings'
// Stub pages for Phase 2 — full implementation in Phase 4
import { TraditionsStub } from './features/traditions/TraditionsStub'
import { ReadingPlansStub } from './features/reading-plans/ReadingPlansStub'
import { PricingPage } from './features/subscription/PricingPage'
import { SubscriptionSuccess } from './features/subscription/SubscriptionSuccess'

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
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route index element={<DailyQuote />} />
                <Route path="about" element={<About />} />
                <Route path="traditions" element={<TraditionsStub />} />
                <Route path="reading-plans" element={<ReadingPlansStub />} />

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
          </LanguageProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
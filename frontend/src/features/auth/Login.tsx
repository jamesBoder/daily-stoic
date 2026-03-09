import React, { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import GoogleLoginButton from '../../components/common/GoogleLoginButton'
import apiClient from '../../services/api/api'
import { showToast } from '../../utils/toast'
import { API_ENDPOINTS } from '../../utils/constants'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginAsGuest } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResendLink, setShowResendLink] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password, rememberMe })
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error ||
                           err.response?.data?.message ||
                           'Login failed. Please try again.'
      const errorCode = err.response?.data?.code

      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        setShowResendLink(true)
      } else {
        setShowResendLink(false)
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await apiClient.post(API_ENDPOINTS.RESEND_VERIFICATION, { email })
      showToast.success('Verification email sent! Check your inbox.')
      setShowResendLink(false)
    } catch {
      showToast.error('Failed to resend. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="text-center mb-10">
          <p className="font-display text-xs tracking-widest uppercase text-primary-400 mb-3">
            Daily Stoic
          </p>
          <h1 className="font-serif text-3xl text-primary-800 leading-snug">
            Return to practice
          </h1>
          <p className="font-sans text-sm text-primary-400 mt-2">
            Your daily reading awaits.
          </p>
        </div>

        {/* Form container */}
        <div className="bg-surface-card rounded-card shadow-card border border-primary-200 px-8 py-8">

          {error && (
            <div className="mb-5 px-4 py-3 rounded-stone border border-danger/30 bg-danger/5 text-danger font-sans text-sm">
              {error}
              {showResendLink && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="block mt-1 underline hover:no-underline disabled:opacity-50"
                >
                  {isResending ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-primary-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="input-field"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-xs tracking-widest uppercase text-primary-500">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="font-sans text-xs text-primary-400 hover:text-accent transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary-400 hover:text-primary-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded-stone border-primary-300 text-accent focus:ring-accent/40"
              />
              <span className="font-sans text-xs text-primary-500">Remember me for 30 days</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 border-t border-primary-200" />
            <span className="font-sans text-xs text-primary-400 tracking-wider">or</span>
            <div className="flex-1 border-t border-primary-200" />
          </div>

          <GoogleLoginButton mode="login" onError={err => setError(err.message)} />

          <button
            type="button"
            onClick={() => { loginAsGuest(); navigate('/') }}
            className="mt-3 w-full font-sans text-sm text-primary-400 hover:text-primary-600 transition-colors py-2 text-center"
          >
            Browse as guest
          </button>
        </div>

        <p className="text-center font-sans text-sm text-primary-400 mt-6">
          New here?{' '}
          <Link to="/auth/register" className="text-accent hover:text-accent-dark transition-colors">
            Begin your practice
          </Link>
        </p>
      </div>
    </div>
  )
}

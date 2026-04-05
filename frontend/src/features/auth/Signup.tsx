import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/api/authService'
import { PasswordInput } from '../../components/common/PasswordInput'
import GoogleLoginButton from '../../components/common/GoogleLoginButton'

export const Signup: React.FC = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      await authService.signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        name: formData.name,
      })
      navigate('/auth/verify-email-pending', { state: { email: formData.email } })
    } catch (err: any) {
      const errorMessage = err.response?.data?.details ||
                           err.response?.data?.error ||
                           'Signup failed. Please try again.'
      const errorField = err.response?.data?.field
      const suggestion = err.response?.data?.suggestion

      if (errorField) {
        setErrors({ [errorField]: errorMessage })
        if (suggestion) {
          setSuggestions({ [errorField]: suggestion })
        }
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' })
    if (suggestions[e.target.name]) setSuggestions({ ...suggestions, [e.target.name]: '' })
  }

  const applySuggestion = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setSuggestions({ ...suggestions, [field]: '' })
    setErrors({ ...errors, [field]: '' })
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="text-center mb-10">
          <p className="font-display text-xs tracking-widest uppercase text-primary-400 mb-3">
            DailyXam
          </p>
          <h1 className="font-serif text-3xl text-primary-800 leading-snug title-glow-hover">
            Begin your practice
          </h1>
          <p className="font-sans text-sm text-primary-400 mt-2">
            One quote. Every morning. A better mind.
          </p>
        </div>

        {/* Google — easiest path first */}
        <div className="mb-6">
          <GoogleLoginButton
            mode="signup"
            onError={err => setErrors({ general: err.message })}
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-t border-primary-200" />
          <span className="font-sans text-xs text-primary-400 tracking-wider">or sign up with email</span>
          <div className="flex-1 border-t border-primary-200" />
        </div>

        {/* Form container */}
        <div className="bg-surface-card rounded-card shadow-card border border-primary-200 px-8 py-8">

          {errors.general && (
            <div className="mb-5 px-4 py-3 rounded-stone border border-danger/30 bg-danger/5 text-danger font-sans text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-primary-500 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className={`input-field ${errors.email ? 'border-danger' : ''}`}
              />
              {errors.email && <p className="mt-1 font-sans text-xs text-danger">{errors.email}</p>}
              {suggestions.email && (
                <p className="mt-1 font-sans text-xs text-primary-500">
                  Did you mean{' '}
                  <button
                    type="button"
                    onClick={() => applySuggestion('email', suggestions.email)}
                    className="underline hover:no-underline text-accent"
                  >
                    {suggestions.email}
                  </button>
                  ?
                </p>
              )}
            </div>

            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-primary-500 mb-1.5">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="marcus_aurelius"
                required
                autoComplete="username"
                className={`input-field ${errors.username ? 'border-danger' : ''}`}
              />
              {errors.username && <p className="mt-1 font-sans text-xs text-danger">{errors.username}</p>}
            </div>

            <div>
              <label className="block font-sans text-xs tracking-widest uppercase text-primary-500 mb-1.5">
                Name <span className="normal-case tracking-normal text-primary-400">(optional)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Marcus Aurelius"
                autoComplete="name"
                className="input-field"
              />
            </div>

            <PasswordInput
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              showRequirements={true}
              required
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2 disabled:opacity-50"
            >
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center font-sans text-sm text-primary-400 mt-6">
          Already practicing?{' '}
          <Link to="/auth/login" className="text-accent hover:text-accent-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

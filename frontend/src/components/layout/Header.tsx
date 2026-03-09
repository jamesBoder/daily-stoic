// src/components/layout/Header.tsx

import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useStreak } from '../../hooks/useStreak'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const { isAuthenticated } = useAuth()
  const { data: streak } = useStreak()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`sticky top-0 z-40 bg-surface-base/90 backdrop-blur-sm border-b border-primary-200 transition-shadow duration-400 ${scrolled ? 'shadow-header-scroll' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-lg text-primary-800 tracking-wide transition-colors duration-300 hover:text-accent"
          onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 10px rgba(139,115,85,0.55), 0 0 28px rgba(139,115,85,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.textShadow = '')}
        >
          Daily Stoic
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/traditions"
            className={({ isActive }) =>
              `font-sans text-sm transition-colors ${
                isActive ? 'text-accent' : 'text-primary-500 hover:text-primary-800'
              }`
            }
          >
            Traditions
          </NavLink>
          <NavLink
            to="/reading-plans"
            className={({ isActive }) =>
              `font-sans text-sm transition-colors ${
                isActive ? 'text-accent' : 'text-primary-500 hover:text-primary-800'
              }`
            }
          >
            Reading Plans
          </NavLink>
        </nav>

        {/* Right side: streak + auth */}
        <div className="flex items-center gap-4">
          {isAuthenticated && streak && streak.current_streak > 0 && (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 font-display text-sm text-accent"
              title={`${streak.current_streak}-day streak`}
            >
              <span className="animate-flame-pulse inline-block">🔥</span>
              <span>{streak.current_streak}</span>
            </Link>
          )}

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth/login"
              className="font-sans text-sm text-primary-500 hover:text-primary-800 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
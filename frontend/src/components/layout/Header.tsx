// src/components/layout/Header.tsx

import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useStreak } from '../../hooks/useStreak'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { UserMenu } from './UserMenu'

export const Header = () => {
  const { isAuthenticated, isGuest } = useAuth()
  const { data: streak } = useStreak()
  const { isPremium } = useSubscription()
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
          DailyXam
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

          {/* Upgrade CTA — free authenticated users only */}
          {isAuthenticated && !isGuest && !isPremium && (
            <Link
              to="/upgrade"
              className="font-display text-xs tracking-wider uppercase text-accent border border-accent/30 rounded-full px-3 py-1 hover:bg-accent hover:text-white transition-colors"
            >
              Upgrade
            </Link>
          )}

          {/* Practitioner badge — premium users */}
          {isPremium && (
            <span className="font-display text-xs tracking-widest uppercase text-primary-400 select-none">
              ✦ Practitioner
            </span>
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
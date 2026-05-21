// src/components/layout/Header.tsx

import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useStreak } from '../../hooks/useStreak'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useTheme } from '../../contexts/ThemeContext'
import { UserMenu } from './UserMenu'
import { WordMark } from '../common/WordMark'

export const Header = () => {
  const { isAuthenticated, isGuest } = useAuth()
  const { data: streak } = useStreak()
  const { isPremium, isLoading: subLoading } = useSubscription()
  const { isDarkMode, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 6)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-sans text-sm transition-colors duration-200 ${
      isActive
        ? 'text-accent'
        : 'text-primary-600 hover:text-primary-900 hover:underline dark:text-fg-muted dark:hover:text-fg'
    }`

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-header-scroll' : ''}`}
      style={{
        background: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: scrolled ? undefined : 'var(--shadow-header)',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-lg tracking-wide logo-glow-hover text-accent hover:text-accent-dark"
        >
          <WordMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/traditions"    className={navLinkClass}>Traditions</NavLink>
          <NavLink to="/reading-plans" className={navLinkClass}>Reading Plans</NavLink>
          <NavLink to="/converse"      className={navLinkClass}>Converse</NavLink>
          <NavLink to="/games"         className={navLinkClass}>Agora</NavLink>
          {isAuthenticated && !isGuest && (
            <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Streak */}
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

          {/* Upgrade CTA — hidden on mobile, hidden while subscription is loading or already premium */}
          {isAuthenticated && !isGuest && !subLoading && !isPremium && (
            <Link
              to="/upgrade"
              className="hidden sm:inline-flex font-display text-xs tracking-wider uppercase rounded-full px-3 py-1 transition-colors
                         text-accent border border-accent/30 hover:bg-accent hover:text-accent-text"
            >
              Upgrade
            </Link>
          )}

          {/* Practitioner badge */}
          {isPremium && (
            <span className="font-display text-xs tracking-widest uppercase select-none text-accent">
              ✦ Practitioner
            </span>
          )}

          {/* Theme toggle — available to everyone */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors
                       hover:bg-primary-100 dark:hover:bg-[var(--color-surface-hi)]
                       focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1
                       text-accent hover:text-accent-hi"
          >
            {isDarkMode ? (
              /* Sun — click to go light */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon — click to go dark */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth/login"
              className="font-sans text-sm transition-colors
                         text-primary-500 hover:text-primary-800
                         dark:text-fg-muted dark:hover:text-fg"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

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
  const { isPremium } = useSubscription()
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
        ? 'text-accent dark:text-[#d4a853]'
        : 'text-primary-600 hover:text-primary-900 hover:underline dark:text-[#8892b8] dark:hover:text-[#e0ddd4]'
    }`

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'shadow-header-scroll dark:shadow-[0_4px_32px_rgba(0,0,0,0.7)]' : ''}`}
      style={{
        /* Light mode */
        background: 'var(--header-bg, rgba(234,230,219,0.92))',
        borderBottom: '1px solid var(--header-border, rgba(212,208,196,0.7))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Dark mode styles via a data attribute driven by the .dark class on <html>.
          We inject a small style tag rather than fighting Tailwind specificity. */}
      <style>{`
        .dark header {
          background: rgba(3, 6, 18, 0.82) !important;
          border-bottom: 1px solid rgba(212, 168, 83, 0.14) !important;
          box-shadow: 0 1px 0 rgba(212,168,83,0.08), 0 4px 24px rgba(0,0,0,0.5);
        }
        .dark header.scrolled {
          box-shadow: 0 1px 0 rgba(212,168,83,0.10), 0 4px 32px rgba(0,0,0,0.70);
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-lg tracking-wide logo-glow-hover
                     text-accent hover:text-accent-dark
                     dark:text-[#d4a853] dark:hover:text-[#e8c96a]"
        >
          <WordMark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/traditions"    className={navLinkClass}>Traditions</NavLink>
          <NavLink to="/reading-plans" className={navLinkClass}>Reading Plans</NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Streak */}
          {isAuthenticated && streak && streak.current_streak > 0 && (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 font-display text-sm text-accent dark:text-[#d4a853]"
              title={`${streak.current_streak}-day streak`}
            >
              <span className="animate-flame-pulse inline-block">🔥</span>
              <span>{streak.current_streak}</span>
            </Link>
          )}

          {/* Upgrade CTA — hidden on mobile to avoid crowding the logo */}
          {isAuthenticated && !isGuest && !isPremium && (
            <Link
              to="/upgrade"
              className="hidden sm:inline-flex font-display text-xs tracking-wider uppercase rounded-full px-3 py-1 transition-colors
                         text-accent border border-accent/30 hover:bg-accent hover:text-white
                         dark:text-[#d4a853] dark:border-[rgba(212,168,83,0.30)] dark:hover:bg-[#d4a853] dark:hover:text-[#040810]"
            >
              Upgrade
            </Link>
          )}

          {/* Practitioner badge */}
          {isPremium && (
            <span className="font-display text-xs tracking-widest uppercase select-none
                             text-primary-600 dark:text-[#d4a853]">
              ✦ Practitioner
            </span>
          )}

          {/* Theme toggle — available to everyone */}
          <button
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors
                       hover:bg-primary-100 dark:hover:bg-[rgba(255,255,255,0.08)]
                       focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1
                       ${isDarkMode
                         ? 'text-[#d4a853] hover:text-[#e8c96a]'
                         : 'text-primary-500 hover:text-primary-800'}`}
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
                         dark:text-[#8892b8] dark:hover:text-[#e0ddd4]"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

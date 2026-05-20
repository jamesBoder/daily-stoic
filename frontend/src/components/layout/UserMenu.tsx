// src/components/layout/UserMenu.tsx

import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const itemClass =
    'block px-4 py-2 font-sans text-sm transition-colors ' +
    'text-primary-600 hover:text-primary-800 hover:bg-surface-card ' +
    'dark:text-fg-muted dark:hover:text-fg dark:hover:bg-[var(--color-surface-hi)]'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 font-sans text-sm transition-colors
                   text-primary-600 hover:text-primary-800
                   dark:text-fg-muted dark:hover:text-fg"
      >
        <span className="max-w-[96px] truncate">{user?.username || user?.email}</span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-card border py-1 z-50"
          style={{
            background: 'var(--dropdown-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'var(--dropdown-shadow)',
            borderColor: 'var(--dropdown-border)',
          }}
        >
          <Link to="/profile"   className={itemClass} onClick={() => setIsOpen(false)}>Profile</Link>
          <Link to="/saved"     className={itemClass} onClick={() => setIsOpen(false)}>Saved Quotes</Link>
          <Link to="/history"   className={itemClass} onClick={() => setIsOpen(false)}>Reading History</Link>
          <Link to="/converse"  className={itemClass} onClick={() => setIsOpen(false)}>Converse</Link>
          <Link to="/settings"  className={itemClass} onClick={() => setIsOpen(false)}>Settings</Link>
          <hr className="my-1 border-primary-200 dark:border-[var(--color-border)]" />
          <button
            onClick={() => { logout(); setIsOpen(false); navigate('/') }}
            className={`w-full text-left ${itemClass} text-danger hover:text-danger`}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

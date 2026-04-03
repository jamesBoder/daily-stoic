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
    'dark:text-[#b0b8d0] dark:hover:text-[#e0ddd4] dark:hover:bg-[rgba(255,255,255,0.05)]'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 font-sans text-sm transition-colors
                   text-primary-600 hover:text-primary-800
                   dark:text-[#b0b8d0] dark:hover:text-[#e0ddd4]"
      >
        <span className="max-w-[96px] truncate">{user?.username || user?.email}</span>
        <span className={`text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-card border py-1 z-50
                     bg-surface-elevated shadow-elevated border-primary-200
                     dark:border-[rgba(255,255,255,0.08)]"
          style={{
            /* Dark: deep glass dropdown */
          }}
        >
          <style>{`
            .dark .user-menu-dropdown {
              background: rgba(4, 8, 22, 0.90) !important;
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              box-shadow: 0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.10);
              border-color: rgba(212,168,83,0.12) !important;
            }
          `}</style>
          <div className="user-menu-dropdown">
            <Link to="/profile"  className={itemClass} onClick={() => setIsOpen(false)}>Profile</Link>
            <Link to="/saved"    className={itemClass} onClick={() => setIsOpen(false)}>Saved Quotes</Link>
            <Link to="/history"  className={itemClass} onClick={() => setIsOpen(false)}>Reading History</Link>
            <hr className="my-1 border-primary-200 dark:border-[rgba(255,255,255,0.07)]" />
            <button
              onClick={() => { logout(); setIsOpen(false); navigate('/') }}
              className={`w-full text-left ${itemClass} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300`}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

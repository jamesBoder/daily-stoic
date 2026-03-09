// src/components/layout/UserMenu.tsx

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 font-sans text-sm text-primary-600 hover:text-primary-800 transition-colors"
      >
        <span>{user?.username || user?.email}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface-elevated rounded-card shadow-elevated border border-primary-200 py-2">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-primary-600 hover:bg-surface-card transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/saved"
            className="block px-4 py-2 text-sm text-primary-600 hover:bg-surface-card transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Saved Quotes
          </Link>
          <Link
            to="/history"
            className="block px-4 py-2 text-sm text-primary-600 hover:bg-surface-card transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Reading History
          </Link>
          <hr className="my-2 border-primary-200" />
          <button
            onClick={() => {
              logout()
              setIsOpen(false)
            }}
            className="block w-full text-left px-4 py-2 text-sm text-primary-600 hover:bg-surface-card transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
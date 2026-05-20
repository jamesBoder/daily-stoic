// src/components/common/LoginPromptModal.tsx
// Shown when guest clicks a gated action

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

export const LoginPromptModal = ({ action, onClose }: { action: string; onClose: () => void }) => {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="animate-modal-rise w-full max-w-xs rounded-modal shadow-modal text-center p-8"
        style={{
          background: 'var(--color-surface-modal)',
          border: '1px solid var(--color-border)',
        }}
      >
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent mb-3">
          Track your practice
        </p>
        <p className="font-sans text-sm text-primary-600 dark:text-fg-muted mb-6 leading-relaxed">
          Create a free account to {action} and build your daily streak.
        </p>
        <div className="flex flex-col gap-2">
          <Link
            to="/auth/register"
            className="font-sans text-sm font-semibold text-accent-text rounded-stone px-6 py-3 transition-colors
                       bg-accent hover:bg-accent-dark"
            onClick={onClose}
          >
            Create account
          </Link>
          <Link
            to="/auth/login"
            className="font-sans text-sm py-2 transition-colors
                       text-primary-500 hover:text-primary-700
                       dark:text-fg-muted dark:hover:text-fg"
            onClick={onClose}
          >
            Sign in
          </Link>
        </div>
        <button
          onClick={onClose}
          className="mt-3 font-sans text-xs transition-colors
                     text-primary-400 hover:text-primary-600
                     dark:text-fg-subtle dark:hover:text-fg-muted"
        >
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  )
}

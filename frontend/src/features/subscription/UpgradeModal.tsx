import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createCheckoutSession } from '../../services/api/subscription'

interface Props {
  onClose: () => void
}

export const UpgradeModal = ({ onClose }: Props) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleUpgrade = async () => {
    setLoading(true)
    setError('')
    try {
      const { url } = await createCheckoutSession()
      if (!url) throw new Error('No checkout URL returned')
      window.location.href = url
    } catch {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="animate-modal-rise w-full max-w-sm sm:max-w-md rounded-modal shadow-modal text-center p-6 sm:p-8"
        style={{
          background: 'var(--color-surface-modal)',
          border: '1px solid var(--color-border)',
        }}
      >

        {/* Header */}
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
          Practitioner
        </p>
        <h2 className="font-display text-2xl text-fg mb-2">
          Deepen Your Practice
        </h2>
        <p className="font-sans text-sm text-fg-muted mb-5 leading-relaxed">
          Unlock all traditions, remove ads, and access premium wisdom — forever.
        </p>

        {/* Ornament */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-px bg-border dark:bg-[var(--color-accent-15)]" />
          <span className="text-fg-subtle dark:text-[var(--color-accent-40)] text-xs select-none">❖</span>
          <div className="flex-1 h-px bg-border dark:bg-[var(--color-accent-15)]" />
        </div>

        {/* Pricing card */}
        <div className="border border-accent/50 dark:border-[var(--color-accent-35)] rounded-card
                        bg-[var(--color-surface-card)]
                        p-4 sm:p-5 mb-5">
          <p className="font-display text-3xl text-fg mb-1">$14.99</p>
          <p className="font-sans text-xs text-fg-subtle uppercase tracking-widest mb-4">
            One-time · Lifetime access
          </p>
          <ul className="font-sans text-sm text-fg-muted space-y-2 text-left">
            <li className="flex items-center gap-2"><span className="text-accent">✦</span> All philosophical traditions</li>
            <li className="flex items-center gap-2"><span className="text-accent">✦</span> Premium quotes &amp; commentary</li>
            <li className="flex items-center gap-2"><span className="text-accent">✦</span> Ad-free experience</li>
            <li className="flex items-center gap-2"><span className="text-accent">✦</span> All future content included</li>
          </ul>
        </div>

        {error && (
          <p className="font-sans text-xs text-danger mb-3">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-display text-sm tracking-wider uppercase rounded-stone px-6 py-3 transition-colors disabled:opacity-60
                     bg-accent hover:bg-accent-dark text-accent-text"
        >
          {loading ? 'Redirecting…' : 'Unlock Wisdom — $14.99'}
        </button>

        <p className="font-sans text-xs text-fg-subtle mt-3">
          Billed once via Stripe. No subscription.
        </p>

        <button
          onClick={onClose}
          className="mt-4 font-sans text-xs text-fg-muted hover:text-fg hover:underline transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  )
}

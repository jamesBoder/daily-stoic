import { useState, useEffect, useRef } from 'react'
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
      window.location.href = url
    } catch {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm px-4"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="animate-modal-rise bg-surface-card rounded-modal shadow-modal w-full max-w-sm p-8 text-center">

        {/* Header */}
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
          Practitioner
        </p>
        <h2 className="font-display text-2xl text-primary-900 mb-2">
          Deepen Your Practice
        </h2>
        <p className="font-sans text-sm text-primary-500 mb-6 leading-relaxed">
          Unlock all traditions, remove ads, and access premium wisdom — forever.
        </p>

        {/* Ornament */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 h-px bg-primary-200" />
          <span className="text-primary-300 text-xs select-none">❖</span>
          <div className="flex-1 h-px bg-primary-200" />
        </div>

        {/* Pricing card */}
        <div className="border border-accent/30 rounded-card bg-surface-elevated p-5 mb-6">
          <p className="font-display text-3xl text-primary-900 mb-1">$14.99</p>
          <p className="font-sans text-xs text-primary-400 uppercase tracking-widest mb-4">
            One-time · Lifetime access
          </p>
          <ul className="font-sans text-sm text-primary-600 space-y-2 text-left">
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
          className="w-full font-display text-sm tracking-wider uppercase bg-accent text-white rounded-stone px-6 py-3 hover:bg-accent-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Redirecting…' : 'Unlock Wisdom — $14.99'}
        </button>

        <p className="font-sans text-xs text-primary-400 mt-3">
          Billed once via Stripe. No subscription.
        </p>

        <button
          onClick={onClose}
          className="mt-4 font-sans text-xs text-primary-400 hover:text-primary-600 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

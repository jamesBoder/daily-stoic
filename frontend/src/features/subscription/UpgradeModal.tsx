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
      window.location.href = url
    } catch {
      setError('Could not start checkout. Please try again.')
      setLoading(false)
    }
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="animate-modal-rise w-full max-w-sm sm:max-w-md rounded-modal shadow-modal text-center p-6 sm:p-8"
        style={{
          background: 'var(--modal-bg, #f5f0e6)',
          border: '1px solid var(--modal-border, rgba(200,192,172,0.6))',
        }}
      >

        {/* Header */}
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent dark:text-[#d4a853] mb-1">
          Practitioner
        </p>
        <h2 className="font-display text-2xl text-primary-900 dark:text-[#e8e0cc] mb-2">
          Deepen Your Practice
        </h2>
        <p className="font-sans text-sm text-primary-600 dark:text-[#8892b8] mb-5 leading-relaxed">
          Unlock all traditions, remove ads, and access premium wisdom — forever.
        </p>

        {/* Ornament */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-px bg-primary-200 dark:bg-[rgba(212,168,83,0.15)]" />
          <span className="text-primary-300 dark:text-[rgba(212,168,83,0.4)] text-xs select-none">❖</span>
          <div className="flex-1 h-px bg-primary-200 dark:bg-[rgba(212,168,83,0.15)]" />
        </div>

        {/* Pricing card */}
        <div className="border border-accent/50 dark:border-[rgba(212,168,83,0.35)] rounded-card
                        bg-white/80 dark:bg-[rgba(255,255,255,0.04)]
                        p-4 sm:p-5 mb-5">
          <p className="font-display text-3xl text-primary-900 dark:text-[#e8e0cc] mb-1">$14.99</p>
          <p className="font-sans text-xs text-primary-500 dark:text-[#6a74a0] uppercase tracking-widest mb-4">
            One-time · Lifetime access
          </p>
          <ul className="font-sans text-sm text-primary-700 dark:text-[#b0bcd4] space-y-2 text-left">
            <li className="flex items-center gap-2"><span className="text-accent dark:text-[#d4a853]">✦</span> All philosophical traditions</li>
            <li className="flex items-center gap-2"><span className="text-accent dark:text-[#d4a853]">✦</span> Premium quotes &amp; commentary</li>
            <li className="flex items-center gap-2"><span className="text-accent dark:text-[#d4a853]">✦</span> Ad-free experience</li>
            <li className="flex items-center gap-2"><span className="text-accent dark:text-[#d4a853]">✦</span> All future content included</li>
          </ul>
        </div>

        {error && (
          <p className="font-sans text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full font-display text-sm tracking-wider uppercase rounded-stone px-6 py-3 transition-colors disabled:opacity-60
                     bg-accent hover:bg-accent-dark text-white
                     dark:bg-[#d4a853] dark:hover:bg-[#c49840] dark:text-[#040810]"
        >
          {loading ? 'Redirecting…' : 'Unlock Wisdom — $14.99'}
        </button>

        <p className="font-sans text-xs text-primary-500 dark:text-[#6a74a0] mt-3">
          Billed once via Stripe. No subscription.
        </p>

        <button
          onClick={onClose}
          className="mt-4 font-sans text-xs text-primary-600 dark:text-[#6a74a0] hover:text-primary-800 hover:underline dark:hover:text-[#8892b8] transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  )
}

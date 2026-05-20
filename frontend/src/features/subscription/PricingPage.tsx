import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createCheckoutSession } from '../../services/api/subscription'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../hooks/useAuth'

export const PricingPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { isPremium } = useSubscription()
  const { isAuthenticated, isGuest } = useAuth()

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
    <div className="max-w-lg mx-auto px-4 py-10 text-center">

      <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
        Practitioner
      </p>
      <h1 className="font-display text-3xl text-primary-900 mb-3 title-glow-hover">
        Ancient Wisdom, Unlocked
      </h1>
      <p className="font-sans text-sm text-primary-500 leading-relaxed mb-8">
        The free tier gives you one daily Stoic quote. Practitioner opens every
        tradition — Stoicism, Buddhism, Hermeticism, Neoplatonism — with premium
        commentary and no ads.
      </p>

      {/* Divider */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-px bg-primary-200" />
        <span className="text-primary-300 text-xs select-none">❖</span>
        <div className="flex-1 h-px bg-primary-200" />
      </div>

      {isPremium ? (
        // Already subscribed state
        <div className="border border-accent/30 rounded-card bg-surface-elevated p-8">
          <p className="font-display text-xl text-primary-900 mb-2">You're a Practitioner</p>
          <p className="font-sans text-sm text-primary-500 mb-4">
            Full access is active on your account.
          </p>
          <Link
            to="/"
            className="font-sans text-sm text-accent hover:text-accent-dark transition-colors"
          >
            Return to today's quote →
          </Link>
        </div>
      ) : (
        <>
          {/* Comparison table */}
          <div className="text-left mb-8 border border-primary-200 rounded-card overflow-hidden">
            <div className="grid grid-cols-3 bg-primary-100 px-4 py-2">
              <span className="font-display text-xs uppercase tracking-widest text-primary-500">Feature</span>
              <span className="font-display text-xs uppercase tracking-widest text-primary-500 text-center">Free</span>
              <span className="font-display text-xs uppercase tracking-widest text-accent text-center">Practitioner</span>
            </div>
            {[
              ['Daily Stoic quote', true, true],
              ['Streak & milestones', true, true],
              ['Save favorites', true, true],
              ['Ad-free', false, true],
              ['All traditions', false, true],
              ['Premium commentary', false, true],
              ['Future content', false, true],
            ].map(([label, free, premium]) => (
              <div key={label as string} className="grid grid-cols-3 px-4 py-2.5 border-t border-primary-200">
                <span className="font-sans text-xs text-primary-600">{label as string}</span>
                <span className="text-center text-sm">{free ? '✓' : '–'}</span>
                <span className="text-center text-sm text-accent">{premium ? '✓' : '–'}</span>
              </div>
            ))}
          </div>

          {/* Pricing card */}
          <div className="border border-accent/30 rounded-card bg-surface-elevated p-6 mb-6">
            <p className="font-display text-4xl text-primary-900 mb-1">$14.99</p>
            <p className="font-sans text-xs text-primary-400 uppercase tracking-widest mb-5">
              One-time · Lifetime access
            </p>

            {error && <p className="font-sans text-xs text-danger mb-3">{error}</p>}

            {!isAuthenticated || isGuest ? (
              <div className="space-y-2">
                <Link
                  to="/auth/register"
                  className="block w-full font-display text-sm tracking-wider uppercase bg-accent text-accent-text rounded-stone px-6 py-3 hover:bg-accent-dark transition-colors"
                >
                  Create account to unlock
                </Link>
                <p className="font-sans text-xs text-primary-400">Already have an account?{' '}
                  <Link to="/auth/login" className="text-accent hover:text-accent-dark">Sign in</Link>
                </p>
              </div>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full font-display text-sm tracking-wider uppercase bg-accent text-accent-text rounded-stone px-6 py-3 hover:bg-accent-dark transition-colors disabled:opacity-60"
              >
                {loading ? 'Redirecting…' : 'Unlock Wisdom — $14.99'}
              </button>
            )}

            <p className="font-sans text-xs text-primary-400 mt-3">
              Billed once via Stripe. No subscription, no renewal.
            </p>
          </div>

          {/* FAQ */}
          <div className="text-left space-y-4">
            {[
              ['What traditions are included?', 'Stoicism, Buddhism, Hermeticism, Neoplatonism, and more as content is added. All future traditions are included at no extra cost.'],
              ['Is there really no subscription?', 'Correct — $14.99 once, access forever. No renewals, no cancellations needed.'],
              ['Can I still use the app for free?', 'Yes. The daily Stoic quote, streak tracking, and favorites are always free.'],
              ['What payment methods are accepted?', 'All major credit and debit cards via Stripe. Apple Pay and Google Pay where available.'],
            ].map(([q, a]) => (
              <div key={q as string} className="border-t border-primary-200 pt-4">
                <p className="font-display text-sm text-primary-800 mb-1">{q as string}</p>
                <p className="font-sans text-sm text-primary-500 leading-relaxed">{a as string}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

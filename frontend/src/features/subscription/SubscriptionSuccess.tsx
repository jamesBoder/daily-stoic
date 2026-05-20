import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { getSubscription } from '../../services/api/subscription'

export const SubscriptionSuccess = () => {
  const { refetch } = useSubscription()
  const [confirmed, setConfirmed] = useState(false)
  const [attempts, setAttempts] = useState(0)

  // Poll until the webhook has processed and tier is confirmed.
  // Stripe redirects here before the webhook fires — give it up to 10s.
  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      if (attempts >= 5 || confirmed) return
      try {
        const sub = await getSubscription()
        if (sub.tier === 'lifetime') {
          if (!cancelled) {
            setConfirmed(true)
            refetch() // update context
          }
          return
        }
      } catch {
        // ignore, keep polling
      }
      if (!cancelled) {
        setAttempts(a => a + 1)
        setTimeout(poll, 2000)
      }
    }

    poll()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-sm mx-auto px-4 py-16 text-center">
      {confirmed ? (
        <>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
            Welcome, Practitioner
          </p>
          <h1 className="font-display text-2xl text-primary-900 mb-4 title-glow-hover">
            Your practice has deepened
          </h1>
          <p className="font-sans text-sm text-primary-500 leading-relaxed mb-8">
            Full access to all traditions and premium wisdom is now active on your account.
          </p>
          <div className="flex items-center gap-2 mb-8">
            <div className="flex-1 h-px bg-primary-200" />
            <span className="text-primary-300 text-xs select-none">❖</span>
            <div className="flex-1 h-px bg-primary-200" />
          </div>
          <Link
            to="/"
            className="font-display text-sm tracking-wider uppercase bg-accent text-accent-text rounded-stone px-6 py-3 hover:bg-accent-dark transition-colors"
          >
            Return to today's quote
          </Link>
        </>
      ) : attempts >= 5 ? (
        <>
          <h1 className="font-display text-xl text-primary-900 mb-3 title-glow-hover">
            Subscription processing
          </h1>
          <p className="font-sans text-sm text-primary-500 leading-relaxed mb-6">
            Your payment was received. Access will activate within a few minutes — check back shortly.
          </p>
          <Link to="/" className="font-sans text-sm text-accent hover:text-accent-dark transition-colors">
            Return home →
          </Link>
        </>
      ) : (
        <>
          <p className="font-display text-sm text-primary-600 mb-4">Confirming your access…</p>
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </>
      )}
    </div>
  )
}

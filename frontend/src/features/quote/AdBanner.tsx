import { useEffect, useRef } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

// AdBanner renders the AdSense unit for free users only.
// Script is injected dynamically — NOT in index.html — so it never loads
// for premium users and stays out of the dev bundle.
export const AdBanner = () => {
  const { isPremium } = useSubscription()
  const pushed = useRef(false)

  useEffect(() => {
    if (isPremium) return

    const client = import.meta.env.VITE_ADSENSE_CLIENT
    if (!client) return // no-op in dev until env var is set

    // Inject AdSense script once per page load
    if (!document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script')
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
      script.async = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }

    // Push the ad unit after the script is present
    if (!pushed.current) {
      pushed.current = true
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      } catch {
        // AdSense throws if called before script loads — safe to ignore
      }
    }
  }, [isPremium])

  // Premium users see nothing
  if (isPremium) return null

  // Fixed-height wrapper prevents CLS while the ad loads
  return (
    <div
      className="w-full max-w-sm mx-auto mt-6"
      style={{ minHeight: '100px' }}
      aria-hidden="true"
    >
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT}
        data-ad-slot={import.meta.env.VITE_ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

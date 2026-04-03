import { useEffect, useRef } from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined
const SLOT   = import.meta.env.VITE_ADSENSE_SLOT   as string | undefined

// Inject the AdSense script once per page load — shared across all ad units.
// No-op if the script is already present or env vars are missing.
function ensureAdSenseScript() {
  if (!CLIENT) return
  if (document.querySelector('script[src*="adsbygoogle"]')) return
  const script = document.createElement('script')
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`
  script.async = true
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}

interface AdUnitProps {
  format?: 'auto' | 'vertical' | 'horizontal'
  className?: string
  style?: React.CSSProperties
}

// Single ad unit — push once on mount.
const AdUnit = ({ format = 'auto', className = '', style }: AdUnitProps) => {
  const pushed = useRef(false)

  useEffect(() => {
    ensureAdSenseScript()
    if (!pushed.current) {
      pushed.current = true
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      } catch {
        // Safe to ignore — fires before script loads, AdSense handles it
      }
    }
  }, [])

  if (!CLIENT || !SLOT) return null

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={style}
      data-ad-client={CLIENT}
      data-ad-slot={SLOT}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}

// ─── Mobile top banner ────────────────────────────────────────────────────────
// Shown above the card on mobile only (hidden md+).
export const AdBannerTop = () => {
  const { isPremium } = useSubscription()
  if (isPremium) return null
  return (
    <div className="block md:hidden w-full mb-4" style={{ minHeight: 60 }} aria-hidden="true">
      <AdUnit format="horizontal" style={{ display: 'block', width: '100%', height: 60 }} />
    </div>
  )
}

// ─── Mobile bottom banner ─────────────────────────────────────────────────────
// Shown below the card on mobile only (hidden md+).
export const AdBannerBottom = () => {
  const { isPremium } = useSubscription()
  if (isPremium) return null
  return (
    <div className="block md:hidden w-full mt-6" style={{ minHeight: 60 }} aria-hidden="true">
      <AdUnit format="horizontal" style={{ display: 'block', width: '100%', height: 60 }} />
    </div>
  )
}

// ─── Desktop side rail ────────────────────────────────────────────────────────
// Sticky vertical unit — hidden on mobile, shown as side columns on md+.
export const AdRail = ({ side }: { side: 'left' | 'right' }) => {
  const { isPremium } = useSubscription()
  if (isPremium) return null
  return (
    <div
      className="hidden md:flex flex-col items-center pt-4 sticky top-20 self-start"
      style={{ width: 160, minHeight: 600 }}
      aria-hidden="true"
    >
      <AdUnit
        format="vertical"
        style={{ display: 'inline-block', width: 160, height: 600 }}
      />
    </div>
  )
}

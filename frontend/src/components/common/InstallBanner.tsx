import { useState } from 'react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

const DISMISSED_KEY = 'install-banner-dismissed'

export const InstallBanner = () => {
  const { canInstall, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(DISMISSED_KEY))

  if (!canInstall || dismissed) return null

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm animate-modal-rise
                 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-4"
    >
      <div
        className="flex items-center gap-3 rounded-card border px-4 py-3"
        style={{
          background: 'var(--color-surface-modal)',
          borderColor: 'var(--color-border-hi)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <img src="/logo192.png" alt="" className="w-8 h-8 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-display text-xs font-semibold tracking-wide text-fg">Add to Home Screen</p>
          <p className="font-sans text-xs text-fg-muted">Install DailyXam for quick access</p>
        </div>
        <button
          onClick={() => { install().catch(() => {}) }}
          className="shrink-0 min-h-[44px] px-4 rounded font-sans text-xs font-semibold
                     bg-accent text-accent-text hover:bg-accent-dark transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => { localStorage.setItem(DISMISSED_KEY, '1'); setDismissed(true) }}
          aria-label="Dismiss"
          className="shrink-0 w-11 h-11 flex items-center justify-center text-fg-muted hover:text-fg text-lg leading-none transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}

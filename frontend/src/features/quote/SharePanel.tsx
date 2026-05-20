// src/features/quote/SharePanel.tsx

import { useEffect, useRef } from 'react'
import type { Quote } from '../../types/quote'
import { showToast } from '../../utils/toast'

interface Props {
  quote: Quote
  onClose: () => void
}

const buildShareText = (quote: Quote) =>
  `"${quote.text}" — ${quote.author.name}, ${quote.source}\n\nvia DailyXam`

export const SharePanel = ({ quote, onClose }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const shareText = buildShareText(quote)
  const shareUrl = window.location.href

  // Close on outside click or touch (touchstart covers mobile tap-outside)
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
    showToast.success('Link copied to clipboard!')
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText, url: shareUrl })
    }
  }

  const encodedText = encodeURIComponent(shareText)
  const encodedUrl  = encodeURIComponent(shareUrl)

  const channels: Array<{ label: string; icon: string; action?: () => void; href?: string }> = [
    { label: 'Copy link',   icon: '📋', action: handleCopy },
    ...('share' in navigator ? [{ label: 'Share',   icon: '↗', action: handleNativeShare }] : []),
    { label: 'Twitter / X', icon: '𝕏',  href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { label: 'WhatsApp',    icon: '💬', href: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { label: 'Telegram',    icon: '✈',  href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { label: 'LinkedIn',    icon: 'in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: 'Facebook',    icon: 'f',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ]

  return (
    <div
      ref={panelRef}
      className="animate-modal-rise mt-6 bg-surface-elevated rounded-card border border-primary-200 p-4"
    >
      <p className="font-display text-xs tracking-widest uppercase text-primary-600 mb-3">
        Share this quote
      </p>
      <div className="flex flex-wrap gap-2">
        {channels.map(ch => (
          ch.href ? (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-sm text-primary-700 bg-surface-card border border-primary-200 rounded-stone px-3 py-2 hover:border-accent hover:text-accent hover:bg-primary-100 dark:hover:bg-[var(--color-surface-hi)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </a>
          ) : (
            <button
              key={ch.label}
              onClick={ch.action}
              className="flex items-center gap-2 font-sans text-sm text-primary-700 bg-surface-card border border-primary-200 rounded-stone px-3 py-2 hover:border-accent hover:text-accent hover:bg-primary-100 dark:hover:bg-[var(--color-surface-hi)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1"
            >
              <span>{ch.icon}</span>
              <span>{ch.label}</span>
            </button>
          )
        ))}
      </div>
    </div>
  )
}
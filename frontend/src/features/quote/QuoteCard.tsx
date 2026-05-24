// src/features/quote/QuoteCard.tsx

import { useState } from 'react'
import type { Quote } from '../../types/quote'
import { TraditionBadge } from './TraditionBadge'
import { SharePanel } from './SharePanel'
import { CommentSection } from './CommentSection'
import { LazyImage } from '../../components/common/LazyImage'
import { quoteCardImageUrl } from '../../utils/themeImage'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import { useSwipe } from '../../hooks/useSwipe'
import { LoginPromptModal } from '../../components/common/LoginPromptModal'
import { AskPhilosopherModal } from '../ai/AskPhilosopherModal'

interface Props {
  quote: Quote
  showStreak?: boolean
  streakCount?: number
  compact?: boolean
}

const OrnamentDivider = () => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-px bg-primary-300/60" />
    <span className="text-primary-400 text-xs select-none">❖</span>
    <div className="flex-1 h-px bg-primary-300/60" />
  </div>
)

export const QuoteCard = ({ quote, showStreak, streakCount, compact }: Props) => {
  const [shareOpen, setShareOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const [loginPromptAction, setLoginPromptAction] = useState('')
  const [localFav, setLocalFav] = useState(false)
  const { isFavorited, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const isFav = isAuthenticated ? isFavorited(quote.id) : localFav

  // Font bump — each threshold shifted up one step for more presence
  const quoteFontClass =
    quote.text.length < 120 ? 'text-quote-xl' :
    quote.text.length < 220 ? 'text-quote-lg' :
    quote.text.length < 340 ? 'text-quote-md' :
                               'text-quote-sm'

  const cardImage = quoteCardImageUrl(quote.image_url, quote.themes?.[0])

  const promptLogin = (action: string) => {
    setLoginPromptAction(action)
    setShowLoginPrompt(true)
  }

  const handleSave = () => {
    navigator.vibrate?.(10)
    if (isAuthenticated) {
      toggleFavorite(quote.id)
    } else {
      setLocalFav(v => !v)
    }
  }

  const swipe = useSwipe({
    onSwipeLeft: handleSave,
    threshold: 60,
  })

  return (
    <div
      className="max-w-xs sm:max-w-sm mx-auto animate-float"
      style={{ animationDelay: '0.65s', willChange: 'transform' }}
    >
      {/* Card face */}
      <article
        className="animate-quote-enter rounded-card border transition-all duration-500
                   bg-surface-card shadow-card border-primary-200/60
                   hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-2
                   dark:bg-surface dark:backdrop-blur-glass dark:border-[var(--color-border)]
                   dark:shadow-[var(--shadow-card-dark)]
                   dark:hover:shadow-[var(--shadow-card-hover-dark)] dark:hover:-translate-y-2"
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
        {...swipe}
      >
        <div className="p-4 sm:p-5">

          {/* Inner frame */}
          <div className="border border-primary-300/50 dark:border-[var(--color-border)] rounded-[3px] p-4 relative">

            {/* Corner ornaments */}
            <span className="absolute top-1.5 left-2 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute top-1.5 right-2 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 left-2 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 right-2 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>

            {/* Header — tradition badge + streak centered */}
            <div className="flex items-center justify-center gap-3 mb-1">
              <TraditionBadge tradition={quote.tradition} />
              {showStreak && streakCount && streakCount > 0 && (
                <span className="font-display text-xs text-accent flex items-center gap-1">
                  <span className="animate-flame-pulse inline-block">🔥</span>
                  Day {streakCount}
                </span>
              )}
            </div>

            {/* Medallion image + theme label */}
            {!compact && (
              <div className="flex flex-col items-center mb-4">
                <div
                  className="w-2/5 overflow-hidden rounded-[2px] border border-primary-200/80"
                  style={{
                    willChange: 'transform',
                    transform: 'translateZ(0)',
                    boxShadow: 'var(--shadow-medallion)',
                  }}
                >
                  <LazyImage
                    src={cardImage}
                    alt={`${quote.themes?.[0] || 'wisdom'} — ${quote.author.name}`}
                    className="w-full aspect-square object-cover"
                    eager
                  />
                </div>
                {quote.themes[0] && (
                  <span className="font-display text-[9px] tracking-[0.2em] uppercase text-primary-400 mt-1.5 select-none">
                    {quote.themes[0]}
                  </span>
                )}
              </div>
            )}

            <OrnamentDivider />

            {/* Quote text */}
            <blockquote className={`font-serif ${quoteFontClass} text-primary-900 dark:text-fg leading-relaxed text-center my-5`}>
              &ldquo;{quote.text}&rdquo;
            </blockquote>

            <OrnamentDivider />

            {/* Attribution */}
            <footer className="text-center mt-4">
              <p
                className="font-display text-xs tracking-widest uppercase text-primary-600 dark:text-fg-muted cursor-default transition-colors duration-300 hover:text-accent hover:drop-shadow-[0_0_8px_var(--color-accent-glow)]"
              >
                {quote.author.name}
              </p>
              <p className="font-sans text-xs italic text-primary-400 dark:text-fg-muted mt-0.5">
                {quote.source}
              </p>
            </footer>

          </div>

          {/* Context note — below inner frame, inside outer padding */}
          {!compact && quote.context_note && (
            <p className="font-sans text-xs text-primary-500 dark:text-fg-muted leading-relaxed text-center mt-4 px-1">
              {quote.context_note}
            </p>
          )}

        </div>
      </article>

      {/* Action row — sits below the card, outside the frame.
          On xs screens: icon-only pills (4 fit comfortably at px-3).
          On sm+: icons + text labels. */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 sm:gap-1.5 text-sm font-sans rounded-full px-3 sm:px-4 py-2 transition-colors ${
              isFav
                ? 'bg-accent text-accent-text'
                : 'bg-surface text-fg hover:bg-surface-hi border border-border'
            }`}
            aria-label={isFav ? 'Remove from saved' : 'Save quote'}
          >
            <span>{isFav ? '♥' : '♡'}</span>
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1 sm:gap-1.5 text-sm font-sans rounded-full px-3 sm:px-4 py-2 transition-colors
                       bg-surface text-fg hover:bg-surface-hi border border-border"
            aria-label="Write reflection"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Reflect</span>
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 text-sm font-sans rounded-full px-3 sm:px-4 py-2 transition-colors
                       bg-surface text-fg hover:bg-surface-hi border border-border"
            aria-label="Share quote"
          >
            <span>↗</span>
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => setAskOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 text-sm font-sans rounded-full px-3 sm:px-4 py-2 transition-colors
                       bg-surface text-fg hover:bg-surface-hi border border-border"
            aria-label={`Ask ${quote.author.name}`}
          >
            <span>✦</span>
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>
      )}

      {localFav && !isAuthenticated && (
        <p className="font-sans text-xs text-primary-500 text-center mt-2">
          <button
            onClick={() => promptLogin('save quotes')}
            className="underline hover:text-primary-700 transition-colors"
          >
            Sign in
          </button>{' '}
          to keep this saved across devices
        </p>
      )}

      {commentsOpen && !compact && (
        <CommentSection
          quoteId={quote.id}
          onAuthRequired={() => promptLogin('write meditations')}
        />
      )}

      {shareOpen && (
        <SharePanel quote={quote} onClose={() => setShareOpen(false)} />
      )}

      {askOpen && (
        <AskPhilosopherModal quote={quote} onClose={() => setAskOpen(false)} />
      )}

      {showLoginPrompt && (
        <LoginPromptModal
          action={loginPromptAction}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  )
}

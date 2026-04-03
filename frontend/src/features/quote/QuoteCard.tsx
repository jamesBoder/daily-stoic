// src/features/quote/QuoteCard.tsx

import { useState } from 'react'
import type { Quote } from '../../types/quote'
import { TraditionBadge } from './TraditionBadge'
import { SharePanel } from './SharePanel'
import { CommentSection } from './CommentSection'
import { LazyImage } from '../../components/common/LazyImage'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import { useSwipe } from '../../hooks/useSwipe'
import { LoginPromptModal } from '../../components/common/LoginPromptModal'

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
  const [loginPromptAction, setLoginPromptAction] = useState('')
  const { isFavorited, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const isFav = isFavorited(quote.id)

  // Font bump — each threshold shifted up one step for more presence
  const quoteFontClass =
    quote.text.length < 120 ? 'text-quote-xl' :
    quote.text.length < 220 ? 'text-quote-lg' :
    quote.text.length < 340 ? 'text-quote-md' :
                               'text-quote-sm'

  const cardImage =
    quote.image_url ||
    (quote.themes[0] ? `/images/themes/${quote.themes[0]}.webp` : null) ||
    '/images/themes/wisdom.webp'

  const promptLogin = (action: string) => {
    setLoginPromptAction(action)
    setShowLoginPrompt(true)
  }

  const swipe = useSwipe({
    onSwipeLeft: () => {
      navigator.vibrate?.(10)
      isAuthenticated ? toggleFavorite(quote.id) : promptLogin('save quotes')
    },
    threshold: 60,
  })

  return (
    <div
      className="max-w-xs sm:max-w-sm mx-auto animate-float"
      style={{ animationDelay: '0.65s', willChange: 'transform' }}
    >
      {/* Card face */}
      <article
        className="animate-quote-enter bg-surface-card rounded-card shadow-card border border-primary-200/60 hover:shadow-[0_8px_32px_rgba(38,35,28,0.22),0_24px_64px_rgba(38,35,28,0.16)] hover:-translate-y-2 transition-all duration-500"
        {...swipe}
      >
        <div className="p-4 sm:p-5">

          {/* Inner frame */}
          <div className="border border-primary-300/50 rounded-[3px] p-4 relative">

            {/* Corner ornaments */}
            <span className="absolute top-1.5 left-2 text-primary-300 text-[10px] select-none leading-none">✦</span>
            <span className="absolute top-1.5 right-2 text-primary-300 text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 left-2 text-primary-300 text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 right-2 text-primary-300 text-[10px] select-none leading-none">✦</span>

            {/* Header — tradition badge + streak centered */}
            <div className="flex items-center justify-center gap-3 mb-4">
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
                    boxShadow: 'inset 0 2px 6px rgba(38,35,28,0.18), inset 0 0 0 1px rgba(38,35,28,0.06)',
                  }}
                >
                  <LazyImage
                    src={cardImage}
                    alt={`${quote.themes[0] || 'wisdom'} — ${quote.author.name}`}
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
            <blockquote className={`font-serif ${quoteFontClass} text-primary-900 leading-relaxed text-center my-5`}>
              &ldquo;{quote.text}&rdquo;
            </blockquote>

            <OrnamentDivider />

            {/* Attribution */}
            <footer className="text-center mt-4">
              <p
                className="font-display text-xs tracking-widest uppercase text-primary-600 cursor-default transition-colors duration-300 hover:text-primary-800"
                onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 8px rgba(139,115,85,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.textShadow = '')}
              >
                {quote.author.name}
              </p>
              <p className="font-sans text-xs italic text-primary-400 mt-0.5">
                {quote.source}
              </p>
            </footer>

          </div>

          {/* Context note — below inner frame, inside outer padding */}
          {!compact && quote.context_note && (
            <p className="font-sans text-xs text-primary-500 leading-relaxed text-center mt-4 px-1">
              {quote.context_note}
            </p>
          )}

        </div>
      </article>

      {/* Action row — sits below the card, outside the frame */}
      {!compact && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => { navigator.vibrate?.(10); isAuthenticated ? toggleFavorite(quote.id) : promptLogin('save quotes') }}
            className={`flex items-center gap-1.5 text-sm font-sans rounded-full px-4 py-2 transition-colors ${
              isFav
                ? 'bg-accent text-white'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
            aria-label={isFav ? 'Remove from saved' : 'Save quote'}
          >
            <span>{isFav ? '♥' : '♡'}</span>
            <span>Save</span>
          </button>

          <button
            onClick={() => isAuthenticated ? setCommentsOpen(!commentsOpen) : promptLogin('write meditations')}
            className="flex items-center gap-1.5 text-sm font-sans bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-full px-4 py-2 transition-colors"
          >
            <span>💬</span>
            <span>Reflect</span>
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 text-sm font-sans bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-full px-4 py-2 transition-colors"
          >
            <span>↗</span>
            <span>Share</span>
          </button>
        </div>
      )}

      {commentsOpen && !compact && <CommentSection quoteId={quote.id} />}

      {shareOpen && (
        <SharePanel quote={quote} onClose={() => setShareOpen(false)} />
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

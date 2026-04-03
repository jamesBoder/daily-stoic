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

  // Maps themes that don't yet have a dedicated image to the closest existing one.
  // Replace each entry here once the real image is generated and dropped in /images/themes/.
  const THEME_IMAGE_MAP: Record<string, string> = {
    // premium hermetic themes → closest stoic equivalent (temporary)
    mind:           'reason',
    knowledge:      'reason',
    intellect:      'reason',
    correspondence: 'reason',
    law:            'justice',
    causation:      'justice',
    polarity:       'justice',
    truth:          'wisdom',
    silence:        'wisdom',
    divine:         'wisdom',
    unity:          'wisdom',
    'the One':      'wisdom',
    being:          'wisdom',
    goodness:       'virtue',
    soul:           'virtue',
    beauty:         'virtue',
    perfection:     'virtue',
    mastery:        'discipline',
    readiness:      'discipline',
    teaching:       'discipline',
    vibration:      'nature',
    rhythm:         'nature',
    creation:       'nature',
    gender:         'nature',
    life:           'nature',
    transformation: 'impermanence',
    eternity:       'impermanence',
    return:         'impermanence',
    time:           'impermanence',
    ascent:         'courage',
    potential:      'courage',
    freedom:        'courage',
    light:          'courage',
    equanimity:     'temperance',
    humility:       'temperance',
    love:           'relationships',
    perseverance:   'resilience',
  }

  const resolveThemeImage = (theme: string) => {
    if (!theme) return 'wisdom'
    return THEME_IMAGE_MAP[theme] ?? theme
  }

  const cardImage =
    quote.image_url ||
    `/images/themes/${resolveThemeImage(quote.themes[0])}.webp`

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
                   hover:shadow-[0_8px_32px_rgba(38,35,28,0.22),0_24px_64px_rgba(38,35,28,0.16)] hover:-translate-y-2
                   dark:bg-[rgba(10,20,44,0.62)] dark:backdrop-blur-glass dark:border-[rgba(255,255,255,0.07)]
                   dark:shadow-[0_4px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)]
                   dark:hover:shadow-[0_8px_48px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(212,168,83,0.10)] dark:hover:-translate-y-2"
        style={{ WebkitBackdropFilter: 'blur(20px)' }}
        {...swipe}
      >
        <div className="p-4 sm:p-5">

          {/* Inner frame */}
          <div className="border border-primary-300/50 dark:border-[rgba(255,255,255,0.07)] rounded-[3px] p-4 relative">

            {/* Corner ornaments */}
            <span className="absolute top-1.5 left-2 text-primary-300 dark:text-star-gold/50 text-[10px] select-none leading-none">✦</span>
            <span className="absolute top-1.5 right-2 text-primary-300 dark:text-star-gold/50 text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 left-2 text-primary-300 dark:text-star-gold/50 text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 right-2 text-primary-300 dark:text-star-gold/50 text-[10px] select-none leading-none">✦</span>

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
            <blockquote className={`font-serif ${quoteFontClass} text-primary-900 dark:text-[#ede8dc] leading-relaxed text-center my-5`}>
              &ldquo;{quote.text}&rdquo;
            </blockquote>

            <OrnamentDivider />

            {/* Attribution */}
            <footer className="text-center mt-4">
              <p
                className="font-display text-xs tracking-widest uppercase text-primary-600 dark:text-[#c8b89a] cursor-default transition-colors duration-300 hover:text-primary-800 dark:hover:text-star-gold"
                onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 8px rgba(139,115,85,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.textShadow = '')}
              >
                {quote.author.name}
              </p>
              <p className="font-sans text-xs italic text-primary-400 dark:text-night-400 mt-0.5">
                {quote.source}
              </p>
            </footer>

          </div>

          {/* Context note — below inner frame, inside outer padding */}
          {!compact && quote.context_note && (
            <p className="font-sans text-xs text-primary-500 dark:text-night-400 leading-relaxed text-center mt-4 px-1">
              {quote.context_note}
            </p>
          )}

        </div>
      </article>

      {/* Action row — sits below the card, outside the frame */}
      {!compact && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 text-sm font-sans rounded-full px-4 py-2 transition-colors ${
              isFav
                ? 'bg-accent text-white dark:bg-star-gold dark:text-night-950'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-night-800/60 dark:text-night-200 dark:hover:bg-night-700/60 dark:border dark:border-white/[0.06]'
            }`}
            aria-label={isFav ? 'Remove from saved' : 'Save quote'}
          >
            <span>{isFav ? '♥' : '♡'}</span>
            <span>Save</span>
          </button>

          <button
            onClick={() => setCommentsOpen(!commentsOpen)}
            className="flex items-center gap-1.5 text-sm font-sans rounded-full px-4 py-2 transition-colors
                       bg-primary-100 text-primary-700 hover:bg-primary-200
                       dark:bg-night-800/60 dark:text-night-200 dark:hover:bg-night-700/60 dark:border dark:border-white/[0.06]"
          >
            <span>💬</span>
            <span>Reflect</span>
          </button>

          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 text-sm font-sans rounded-full px-4 py-2 transition-colors
                       bg-primary-100 text-primary-700 hover:bg-primary-200
                       dark:bg-night-800/60 dark:text-night-200 dark:hover:bg-night-700/60 dark:border dark:border-white/[0.06]"
          >
            <span>↗</span>
            <span>Share</span>
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

      {showLoginPrompt && (
        <LoginPromptModal
          action={loginPromptAction}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}
    </div>
  )
}

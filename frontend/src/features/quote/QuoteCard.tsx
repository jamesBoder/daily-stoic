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

  // Maps themes to existing image files in /images/themes/.
  // Available images: control, courage, discipline, gratitude, impermanence,
  //   justice, mortality, nature, reason, relationships, resilience, temperance, virtue, wisdom
  const THEME_IMAGE_MAP: Record<string, string> = {
    // reason
    mind: 'reason', knowledge: 'reason', intellect: 'reason',
    correspondence: 'reason', clarity: 'reason', discernment: 'reason',
    logic: 'reason', thought: 'reason', understanding: 'reason',
    perspective: 'reason', reflection: 'reason', awareness: 'reason',
    philosophy: 'reason', knowing: 'reason', language: 'reason',
    labels: 'reason', paradox: 'reason', mystery: 'reason',
    // wisdom
    truth: 'wisdom', silence: 'wisdom', divine: 'wisdom', unity: 'wisdom',
    'the One': 'wisdom', being: 'wisdom', wisdom: 'wisdom',
    identity: 'wisdom', self: 'wisdom', solitude: 'wisdom',
    meaning: 'wisdom', purpose: 'wisdom', reality: 'wisdom',
    transcendence: 'wisdom', enlightenment: 'wisdom', learning: 'wisdom',
    education: 'wisdom', teaching: 'wisdom', speech: 'wisdom',
    listening: 'wisdom', presence: 'wisdom', present: 'wisdom',
    'present-moment': 'wisdom', path: 'wisdom', journey: 'wisdom',
    prayer: 'wisdom', meditation: 'wisdom', mindfulness: 'wisdom',
    mirror: 'wisdom', tao: 'wisdom', transmission: 'wisdom',
    outcome: 'wisdom', response: 'wisdom', counsel: 'wisdom',
    'self-knowledge': 'wisdom', tomorrow: 'wisdom', future: 'wisdom',
    // virtue
    goodness: 'virtue', soul: 'virtue', beauty: 'virtue',
    perfection: 'virtue', virtue: 'virtue', character: 'virtue',
    integrity: 'virtue', authenticity: 'virtue', honor: 'virtue',
    dignity: 'virtue', deeds: 'virtue', ethics: 'virtue',
    morality: 'virtue', living: 'virtue', flourishing: 'virtue',
    service: 'virtue', generosity: 'virtue', leadership: 'virtue',
    trust: 'virtue', respect: 'virtue', responsibility: 'virtue',
    worth: 'virtue', happiness: 'virtue',
    // discipline
    mastery: 'discipline', readiness: 'discipline', self_discipline: 'discipline',
    'self-mastery': 'discipline', discipline: 'discipline', practice: 'discipline',
    effort: 'discipline', action: 'discipline', skill: 'discipline',
    will: 'discipline', urgency: 'discipline', 'inner-work': 'discipline',
    'intrinsic-motivation': 'discipline', 'self-reliance': 'discipline',
    success: 'discipline', effectiveness: 'discipline', conduct: 'discipline',
    // control
    control: 'control', choice: 'control', autonomy: 'control',
    // nature
    vibration: 'nature', rhythm: 'nature', creation: 'nature',
    gender: 'nature', life: 'nature', nature: 'nature',
    'cosmic-order': 'nature', flow: 'nature', spontaneity: 'nature',
    walking: 'nature', wandering: 'nature', water: 'nature',
    world: 'nature', winter: 'nature', body: 'nature', breath: 'nature',
    interconnection: 'nature', 'wu-wei': 'nature',
    // impermanence
    transformation: 'impermanence', eternity: 'impermanence',
    return: 'impermanence', time: 'impermanence', impermanence: 'impermanence',
    change: 'impermanence', 'letting-go': 'impermanence', loss: 'impermanence',
    'non-attachment': 'impermanence', surrender: 'impermanence',
    finitude: 'impermanence', limitation: 'impermanence', age: 'impermanence',
    // mortality
    mortality: 'mortality', death: 'mortality',
    // courage
    ascent: 'courage', potential: 'courage', freedom: 'courage',
    light: 'courage', courage: 'courage', fearlessness: 'courage',
    rebellion: 'courage', revolt: 'courage', risk: 'courage',
    hope: 'courage', possibility: 'courage', liberation: 'courage',
    dream: 'courage', victory: 'courage',
    // resilience
    perseverance: 'resilience', resilience: 'resilience',
    'inner-strength': 'resilience', inner_strength: 'resilience',
    struggle: 'resilience', challenge: 'resilience', defeat: 'resilience',
    suffering: 'resilience', grief: 'resilience', despair: 'resilience',
    growth: 'resilience', refuge: 'resilience',
    // temperance
    equanimity: 'temperance', humility: 'temperance', temperance: 'temperance',
    moderation: 'temperance', patience: 'temperance', serenity: 'temperance',
    peace: 'temperance', stillness: 'temperance', tranquility: 'temperance',
    acceptance: 'temperance', contentment: 'temperance', restraint: 'temperance',
    simplicity: 'temperance', sufficiency: 'temperance', slowness: 'temperance',
    'non-striving': 'temperance', 'non-competition': 'temperance',
    'self-acceptance': 'temperance', desire: 'temperance', anger: 'temperance',
    anxiety: 'temperance', feelings: 'temperance', praise: 'temperance',
    approval: 'temperance', fame: 'temperance', greed: 'temperance',
    wealth: 'temperance', longing: 'temperance', attitude: 'temperance',
    // relationships
    love: 'relationships', relationships: 'relationships', relationship: 'relationships',
    friendship: 'relationships', community: 'relationships', companionship: 'relationships',
    compassion: 'relationships', humanity: 'relationships', solidarity: 'relationships',
    society: 'relationships', others: 'relationships', forgiveness: 'relationships',
    'self-compassion': 'relationships', metta: 'relationships',
    // gratitude
    gratitude: 'gratitude', joy: 'gratitude', abundance: 'gratitude',
    // justice
    law: 'justice', causation: 'justice', polarity: 'justice',
    justice: 'justice', equality: 'justice', 'social-order': 'justice',
    maat: 'justice', blame: 'justice', duty: 'justice',
  }

  const VALID_IMAGES = new Set([
    'control','courage','discipline','gratitude','impermanence',
    'justice','mortality','nature','reason','relationships',
    'resilience','temperance','virtue','wisdom',
  ])

  const resolveThemeImage = (theme: string) => {
    if (!theme) return 'wisdom'
    const mapped = THEME_IMAGE_MAP[theme] ?? theme
    return VALID_IMAGES.has(mapped) ? mapped : 'wisdom'
  }

  const cardImage =
    quote.image_url ||
    `/images/themes/${resolveThemeImage(quote.themes?.[0] ?? '')}.webp`

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
            <span className="absolute top-1.5 left-2 text-primary-300 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute top-1.5 right-2 text-primary-300 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 left-2 text-primary-300 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>
            <span className="absolute bottom-1.5 right-2 text-primary-300 text-[var(--color-accent-50)] text-[10px] select-none leading-none">✦</span>

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

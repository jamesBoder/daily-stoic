// src/features/quote/QuoteCard.tsx

import { useState } from 'react'
import type { Quote } from '../../types/quote'
import { TraditionBadge } from './TraditionBadge'
import { SharePanel } from './SharePanel'
import { CommentSection } from './CommentSection'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import { LoginPromptModal } from '../../components/common/LoginPromptModal'

interface Props {
  quote: Quote
  showStreak?: boolean
  streakCount?: number
  compact?: boolean
}

export const QuoteCard = ({ quote, showStreak, streakCount, compact }: Props) => {
  const [shareOpen, setShareOpen] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [loginPromptAction, setLoginPromptAction] = useState('')
  const { isFavorited, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const isFav = isFavorited(quote.id)

  // Scale quote font with text length — short quotes get bigger
  const quoteFontClass =
    quote.text.length < 80  ? 'text-quote-xl' :
    quote.text.length < 160 ? 'text-quote-lg' :
    quote.text.length < 280 ? 'text-quote-md' :
                               'text-quote-sm'

  const promptLogin = (action: string) => {
    setLoginPromptAction(action)
    setShowLoginPrompt(true)
  }

  return (
    <div className="max-w-2xl mx-auto animate-float" style={{ animationDelay: '0.65s' }}>
      <article className="animate-quote-enter bg-surface-card rounded-card shadow-card px-4 py-6 sm:px-8 sm:py-10 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-500">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <TraditionBadge tradition={quote.tradition} />
          {showStreak && streakCount && streakCount > 0 && (
            <span className="font-display text-sm text-accent flex items-center gap-1.5">
              <span className="animate-flame-pulse inline-block">🔥</span>
              Day {streakCount}
            </span>
          )}
        </div>

        {/* Quote text — the hero element */}
        <blockquote className={`font-serif ${quoteFontClass} text-primary-900 leading-relaxed mb-8`}>
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        {/* Attribution */}
        <footer className="mb-6">
          <p className="font-display text-sm tracking-widest uppercase text-primary-600 cursor-default transition-all duration-300 hover:text-primary-800" style={{ transition: 'color 0.3s, text-shadow 0.3s' }} onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 8px rgba(139,115,85,0.55), 0 0 20px rgba(139,115,85,0.25)')} onMouseLeave={e => (e.currentTarget.style.textShadow = '')}>
            {quote.author.name}
          </p>
          <p className="font-sans text-xs italic text-primary-400 mt-0.5 cursor-default transition-all duration-300 hover:text-primary-600" style={{ transition: 'color 0.3s, text-shadow 0.3s' }} onMouseEnter={e => (e.currentTarget.style.textShadow = '0 0 6px rgba(139,115,85,0.4), 0 0 14px rgba(139,115,85,0.18)')} onMouseLeave={e => (e.currentTarget.style.textShadow = '')}>
            {quote.source}
          </p>
        </footer>

        {!compact && (
          <>
            {/* Divider */}
            <div className="border-t border-primary-200 mb-6" />

            {/* Context note */}
            {quote.context_note && (
              <p className="font-sans text-sm text-primary-500 leading-relaxed mb-5">
                {quote.context_note}
              </p>
            )}

            {/* Action row */}
            <div className="flex items-center gap-2 pt-2">
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
                className="flex items-center gap-1.5 text-sm font-sans bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-full px-4 py-2 transition-colors ml-auto"
              >
                <span>↗</span>
                <span>Share</span>
              </button>
            </div>

            {commentsOpen && <CommentSection quoteId={quote.id} />}
          </>
        )}

        {shareOpen && (
          <SharePanel
            quote={quote}
            onClose={() => setShareOpen(false)}
          />
        )}

        {showLoginPrompt && (
          <LoginPromptModal
            action={loginPromptAction}
            onClose={() => setShowLoginPrompt(false)}
          />
        )}
      </article>
    </div>
  )
}
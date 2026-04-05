// src/features/traditions/PassageCard.tsx
// A rich, reading-focused passage card for the TraditionBrowser.
// Replaces the compact QuoteCard — shows commentary and practice prompt when present.

import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Quote } from '../../types/quote'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  quote: Quote
  accentColor?: string
}

export function PassageCard({ quote, accentColor = '#8b7355' }: Props) {
  const [showPractice, setShowPractice] = useState(false)
  const { isFavorited, toggleFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const isFav = isAuthenticated && isFavorited(quote.id)

  const hasCommentary = Boolean(quote.context_full)
  const hasPractice   = Boolean(quote.reflection_prompt)

  return (
    <article className="group relative">
      {/* Thin accent bar on the left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-60"
        style={{ background: accentColor }}
      />

      <div className="pl-4">
        {/* Passage text */}
        <blockquote className="font-serif text-base md:text-lg leading-relaxed text-primary-900 dark:text-[#ede8dc] mb-3">
          &ldquo;{quote.text}&rdquo;
        </blockquote>

        {/* Attribution row */}
        <footer className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <Link
              to={`/authors/${quote.author.slug}`}
              className="font-display text-[10px] tracking-[0.18em] uppercase transition-colors"
              style={{ color: accentColor }}
              onClick={e => e.stopPropagation()}
            >
              {quote.author.name}
            </Link>
            {quote.source && (
              <>
                <span className="text-primary-400 dark:text-night-500 text-xs select-none">·</span>
                <span className="font-sans text-[10px] italic text-primary-500 dark:text-night-400 break-words">
                  {quote.source}
                </span>
              </>
            )}
          </div>

          {/* Save button — enlarged tap target */}
          <button
            onClick={() => isAuthenticated && toggleFavorite(quote.id)}
            className={`shrink-0 text-sm transition-all active:scale-90 py-1 px-1 -mr-1 min-h-[36px] min-w-[36px] flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 ${
              isFav
                ? 'text-accent dark:text-[#d4a853]'
                : 'text-primary-400 dark:text-night-500 hover:text-primary-600 dark:hover:text-night-300'
            }`}
            aria-label={isFav ? 'Remove from saved' : 'Save passage'}
          >
            {isFav ? '♥' : '♡'}
          </button>
        </footer>

        {/* Commentary block */}
        {hasCommentary && (
          <div className="mt-3 pt-3 border-t border-primary-100/80 dark:border-[rgba(255,255,255,0.05)]">
            <p
              className="font-display text-[9px] tracking-[0.2em] uppercase mb-1.5"
              style={{ color: accentColor }}
            >
              Commentary
            </p>
            <p className="font-sans text-xs md:text-sm leading-relaxed text-primary-700 dark:text-night-400">
              {quote.context_full}
            </p>
          </div>
        )}

        {/* Practice block — toggled */}
        {hasPractice && (
          <div className="mt-3">
            <button
              onClick={() => setShowPractice(v => !v)}
              className="flex items-center gap-1.5 font-display text-[9px] tracking-[0.2em] uppercase transition-colors py-2 -my-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 rounded"
              style={{ color: accentColor }}
            >
              <span
                className="inline-block text-[10px] transition-transform duration-200"
                style={{ transform: showPractice ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                ▶
              </span>
              Practice
            </button>

            {showPractice && (
              <div
                className="mt-2 rounded-[6px] px-3 py-2.5"
                style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}45` }}
              >
                <p className="font-sans text-xs md:text-sm leading-relaxed text-primary-700 dark:text-night-300 italic">
                  {quote.reflection_prompt}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

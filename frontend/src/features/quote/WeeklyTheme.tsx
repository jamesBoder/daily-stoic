// src/features/quote/WeeklyTheme.tsx
// A weekly-theme section on the home page.
// First quote is always visible; tap "See all" to expand the rest.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { quotesApi } from '../../services/api/quotes'
import type { Week } from '../../types/week'
import type { Quote } from '../../types/quote'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { formatDateShort } from '../../utils/date'

// ── Single quote row ──────────────────────────────────────────────────────────

function QuoteRow({ quote, isPremium }: { quote: Quote; isPremium: boolean }) {
  const isGated = quote.tier === 'premium' && !isPremium && !quote.text

  if (isGated) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-primary-100 dark:border-[rgba(255,255,255,0.06)] last:border-0">
        <span className="flex-shrink-0 text-[10px] text-accent/30 mt-0.5 select-none">✦</span>
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <p className="font-sans text-xs text-primary-400 dark:text-primary-400 italic">
            {quote.author?.name ?? 'Practitioner content'}
          </p>
          <Link to="/upgrade" className="flex-shrink-0 font-sans text-[10px] text-accent hover:underline">
            Unlock
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-3 border-b border-primary-100 dark:border-[rgba(255,255,255,0.06)] last:border-0">
      <p className="font-serif text-sm leading-relaxed text-primary-800 dark:text-[#e0ddd4] italic mb-1.5">
        "{quote.text}"
      </p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {quote.author && (
          <Link
            to={`/authors/${quote.author.slug}`}
            className="font-display text-[9px] tracking-[0.15em] uppercase text-accent hover:underline"
          >
            {quote.author.name}
          </Link>
        )}
        {quote.source && (
          <span className="font-sans text-[10px] text-primary-300 dark:text-primary-300 italic">
            · {quote.source}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function WeeklyTheme() {
  const [week, setWeek] = useState<Week | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const { isPremium } = useSubscription()

  useEffect(() => {
    quotesApi.getWeek()
      .then(r => setWeek(r.week))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (fetchError || !week || (week.quotes ?? []).length === 0) return null

  const quotes   = week.quotes ?? []
  const first    = quotes[0]
  const rest     = quotes.slice(1)
  const hasMore  = rest.length > 0

  const dateRange = `${formatDateShort(week.start_date)} – ${formatDateShort(week.end_date)}`

  return (
    <section className="max-w-2xl mx-auto mt-12 px-4">
      {/* ── Section divider ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-primary-200 dark:bg-[rgba(255,255,255,0.08)]" />
        <div className="flex items-center gap-2">
          <span className="text-accent text-[10px] select-none">✦</span>
          <span className="font-display text-[9px] tracking-[0.25em] uppercase text-primary-500 dark:text-night-400">
            {week.title}
          </span>
          <span className="text-accent text-[10px] select-none">✦</span>
        </div>
        <div className="h-px flex-1 bg-primary-200 dark:bg-[rgba(255,255,255,0.08)]" />
      </div>

      {/* ── Card ── */}
      <div className="rounded-2xl border border-primary-200 dark:border-[rgba(255,255,255,0.07)] bg-surface-card overflow-hidden">
        {/* Description header */}
        {week.description && (
          <div className="px-5 pt-5 pb-4 border-b border-primary-100 dark:border-[rgba(255,255,255,0.06)]">
            <p className="font-sans text-sm text-primary-500 dark:text-night-400 leading-relaxed">
              {week.description}
            </p>
            <p className="font-sans text-[10px] text-primary-300 dark:text-primary-300 mt-2">
              {dateRange}
            </p>
          </div>
        )}

        {/* Always-visible first quote */}
        {first && (
          <div className="px-5">
            <QuoteRow quote={first} isPremium={isPremium} />
          </div>
        )}

        {/* Remaining quotes — revealed on expand */}
        {expanded && rest.length > 0 && (
          <div className="px-5">
            {rest.map(q => (
              <QuoteRow key={q.id} quote={q} isPremium={isPremium} />
            ))}
          </div>
        )}

        {/* Expand / collapse toggle */}
        {hasMore && (
          <button
            onClick={() => setExpanded(o => !o)}
            className="w-full flex items-center justify-center gap-2 py-3.5 border-t border-primary-100 dark:border-[rgba(255,255,255,0.06)] font-sans text-xs text-primary-400 dark:text-primary-400 hover:text-accent dark:hover:text-accent transition-colors active:bg-primary-100 touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {expanded ? (
              <>Show less <span className="text-[10px]">↑</span></>
            ) : (
              <>See all {quotes.length} meditations <span className="text-[10px]">↓</span></>
            )}
          </button>
        )}
      </div>
    </section>
  )
}

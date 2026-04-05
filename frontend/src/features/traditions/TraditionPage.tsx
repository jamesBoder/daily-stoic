// src/features/traditions/TraditionPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import apiClient from '../../services/api/api'
import type { Tradition, Quote, Author } from '../../types/quote'
import { useIsDark } from '../../hooks/useIsDark'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PremiumGate } from '../../components/common/PremiumGate'
import { PassageCard } from './PassageCard'
import {
  META,
  ICON_COLOR,
  ICON_COLOR_DARK,
  CORE_CONCEPTS,
} from './constants'

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({
  tradition,
  color,
  isDark,
}: {
  tradition: Tradition
  color: string
  isDark: boolean
}) {
  const meta = META[tradition.slug]

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '68vh' }}>

      {/* Atmospheric radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 80% 60% at 50% 40%, ${color}22 0%, transparent 70%)`
            : `radial-gradient(ellipse 80% 60% at 50% 40%, ${color}18 0%, transparent 70%)`,
        }}
      />

      {/* Outer ring glow in dark mode */}
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 40% 30% at 50% 38%, ${color}14 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20">

        {/* Back link */}
        <Link
          to="/traditions"
          className="absolute top-6 left-4 sm:left-8 inline-flex items-center gap-1.5 font-display text-[10px] md:text-xs tracking-widest uppercase transition-all hover:underline py-2 -my-2"
          style={{ color }}
        >
          <span>←</span> All Traditions
        </Link>

        {/* Tier badge */}
        {tradition.tier === 'premium' && (
          <span
            className="font-display text-[8px] md:text-[9px] tracking-[0.3em] uppercase rounded-full px-3 py-1 mb-6"
            style={{
              color,
              background: isDark ? `${color}18` : `${color}14`,
              border: `1px solid ${color}35`,
            }}
          >
            Practitioner
          </span>
        )}

        {/* Icon */}
        <div
          className="text-6xl md:text-8xl mb-5 md:mb-7 select-none"
          style={{
            color,
            filter: isDark ? `drop-shadow(0 0 32px ${color}55)` : 'none',
          }}
        >
          {meta?.icon ?? '✦'}
        </div>

        {/* Era */}
        {meta?.era && (
          <p
            className="font-display text-[9px] md:text-[11px] tracking-[0.3em] uppercase mb-3"
            style={{ color }}
          >
            {meta.era}
          </p>
        )}

        {/* Tradition name */}
        <h1
          className="font-display text-5xl sm:text-6xl md:text-7xl text-primary-800 dark:text-[#ede8dc] mb-5 leading-tight"
          style={{ textShadow: isDark ? `0 0 40px ${color}25` : 'none' }}
        >
          {tradition.name}
        </h1>

        {/* Tagline */}
        <p className="font-sans text-sm md:text-base text-primary-600 dark:text-night-400 max-w-md md:max-w-lg leading-relaxed mb-8">
          {meta?.tagline ?? meta?.description}
        </p>

        {/* Accent rule */}
        <div
          className="w-16 md:w-24 h-px rounded-full"
          style={{ background: color, opacity: 0.45 }}
        />
      </div>
    </div>
  )
}

// ── Core Concepts ─────────────────────────────────────────────────────────────

function CoreConceptsSection({
  slug,
  color,
  isDark,
}: {
  slug: string
  color: string
  isDark: boolean
}) {
  const concepts = CORE_CONCEPTS[slug]
  if (!concepts?.length) return null

  return (
    <section className="max-w-2xl lg:max-w-4xl mx-auto px-4 mb-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
        <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-primary-500 dark:text-night-400 px-1">
          Core Concepts
        </h2>
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {concepts.map((concept, i) => (
          <div
            key={concept.name}
            className="relative rounded-card overflow-hidden
                       bg-surface-card border border-primary-200/60
                       dark:bg-[rgba(10,20,44,0.5)] dark:border-[rgba(255,255,255,0.06)]
                       dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
          >
            {/* Accent top border */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${color}cc, ${color}55)` }}
            />

            <div className="p-5 md:p-6 pt-6 md:pt-7">
              {/* Number */}
              <span
                className="font-display text-3xl md:text-5xl font-bold leading-none mb-3 block select-none"
                style={{ color, opacity: isDark ? 0.35 : 0.28 }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Name */}
              <h3 className="font-display text-sm md:text-base tracking-wide mb-2 text-primary-800 dark:text-[#e0ddd4]">
                {concept.name}
              </h3>

              {/* Description */}
              <p className="font-sans text-xs md:text-sm leading-relaxed text-primary-600 dark:text-night-400">
                {concept.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Key Figures ───────────────────────────────────────────────────────────────

function KeyFiguresSection({
  authors,
  color,
  isDark,
  traditionSlug,
}: {
  authors: Author[]
  color: string
  isDark: boolean
  traditionSlug: string
}) {
  if (!authors.length) return null

  const bgColor = isDark
    ? META[traditionSlug]?.accentDark ?? 'rgba(212,168,83,0.15)'
    : META[traditionSlug]?.accent ?? 'rgba(139,115,85,0.15)'

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="max-w-2xl lg:max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
          <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-primary-600 dark:text-night-400 px-1">
            Philosophers
          </h2>
          <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
        </div>
      </div>

      {/* Scrollable row */}
      <div className="px-4 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-4 md:gap-6 max-w-2xl lg:max-w-4xl mx-auto w-max sm:w-auto sm:flex-wrap sm:justify-start">
          {authors.map(author => (
            <Link
              key={author.id}
              to={`/authors/${author.slug}`}
              className="flex flex-col items-center gap-2 shrink-0 group w-20 md:w-24"
            >
              {/* Avatar */}
              <div className="relative">
                {author.image_url ? (
                  <img
                    src={author.image_url}
                    alt={author.name}
                    className="w-14 h-14 md:w-18 md:h-18 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
                    style={{ border: `2px solid ${color}60` }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center text-xl md:text-2xl transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: bgColor,
                      border: `2px solid ${color}60`,
                      color,
                    }}
                  >
                    {META[traditionSlug]?.icon ?? '✦'}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="text-center">
                <p
                  className="font-display text-[9px] md:text-[11px] tracking-wide text-primary-700 dark:text-night-300 leading-snug text-center group-hover:text-accent dark:group-hover:text-[#d4a853] transition-colors"
                >
                  {author.name}
                </p>
                {(author.born || author.died) && (
                  <p className="font-sans text-[8px] md:text-[10px] text-primary-500 dark:text-night-500 mt-0.5">
                    {author.born && author.died
                      ? `${author.born}–${author.died}`
                      : author.born ?? author.died}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Passages ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

function PassagesSection({
  slug,
  color,
  isPremium,
  tier,
}: {
  slug: string
  color: string
  isPremium: boolean
  tier: string
}) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    setLoading(true)
    apiClient.get('/api/quotes/search', {
      params: { tradition: slug, limit: PAGE_SIZE, offset: 0 },
    }).then(r => {
      setQuotes(r.data.quotes ?? [])
      setTotal(r.data.total ?? 0)
      setOffset(PAGE_SIZE)
    }).finally(() => setLoading(false))
  }, [slug])

  const loadMore = () => {
    setLoadingMore(true)
    apiClient.get('/api/quotes/search', {
      params: { tradition: slug, limit: PAGE_SIZE, offset },
    }).then(r => {
      setQuotes(prev => [...prev, ...(r.data.quotes ?? [])])
      setOffset(prev => prev + PAGE_SIZE)
    }).finally(() => setLoadingMore(false))
  }

  const hasMore = quotes.length < total

  return (
    <section className="max-w-2xl lg:max-w-3xl mx-auto px-4 mb-20">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
        <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-primary-500 dark:text-night-400 px-1">
          Passages
        </h2>
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
      </div>

      {!loading && (
        <p className="font-sans text-[10px] md:text-xs text-primary-500 dark:text-night-500 text-center mb-8">
          {total} passage{total !== 1 ? 's' : ''} in this tradition
        </p>
      )}

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-card bg-primary-100/60 dark:bg-night-800/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-10">
            {quotes.map(q => {
              const isLocked = q.tier === 'premium' && !isPremium
              if (isLocked) {
                return (
                  <PremiumGate key={q.id}>
                    <PassageCard quote={q} accentColor={color} />
                  </PremiumGate>
                )
              }
              return <PassageCard key={q.id} quote={q} accentColor={color} />
            })}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="font-display text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 rounded-stone transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  color,
                  border: `1px solid ${color}60`,
                  background: `${color}15`,
                }}
              >
                {loadingMore ? 'Loading…' : `Load more · ${total - quotes.length} remaining`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

// ── Main TraditionPage ────────────────────────────────────────────────────────

export function TraditionPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const isDark = useIsDark()
  const { isPremium } = useSubscription()

  const [tradition, setTradition] = useState<(Tradition & { authors: Author[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    traditionsApi.getBySlug(slug)
      .then(setTradition)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base page-utility">
        <div className="max-w-2xl mx-auto px-4 pt-32 space-y-6">
          <div className="h-8 w-48 mx-auto rounded bg-primary-100/60 dark:bg-night-800/40 animate-pulse" />
          <div className="h-16 w-72 mx-auto rounded bg-primary-100/60 dark:bg-night-800/40 animate-pulse" />
          <div className="h-4 w-64 mx-auto rounded bg-primary-100/60 dark:bg-night-800/40 animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !tradition || !slug) {
    return (
      <main className="min-h-screen bg-surface-base page-utility flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-sans text-sm text-primary-400 dark:text-night-500 mb-4">
            Tradition not found.
          </p>
          <button
            onClick={() => navigate('/traditions')}
            className="font-display text-[10px] tracking-widest uppercase text-accent dark:text-star-gold underline"
          >
            Browse traditions
          </button>
        </div>
      </main>
    )
  }

  const color = isDark
    ? ICON_COLOR_DARK[tradition.slug] ?? '#d4a853'
    : ICON_COLOR[tradition.slug] ?? '#8b7355'

  return (
    <main className="min-h-screen bg-surface-base page-utility">

      {/* Hero */}
      <Hero tradition={tradition} color={color} isDark={isDark} />

      {/* Core Concepts */}
      <CoreConceptsSection slug={tradition.slug} color={color} isDark={isDark} />

      {/* Key Figures */}
      <KeyFiguresSection
        authors={tradition.authors ?? []}
        color={color}
        isDark={isDark}
        traditionSlug={tradition.slug}
      />

      {/* Passages */}
      <PassagesSection
        slug={tradition.slug}
        color={color}
        isPremium={isPremium}
        tier={tradition.tier}
      />

    </main>
  )
}

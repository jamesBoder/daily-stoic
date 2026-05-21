// src/features/traditions/TraditionPage.tsx

import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import apiClient from '../../services/api/api'
import type { Tradition, Quote, Author } from '../../types/quote'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PremiumGate } from '../../components/common/PremiumGate'
import { PassageCard } from './PassageCard'
import {
  META,
  TRADITION_COLORS,
  TRADITION_DEFAULT_COLORS,
  CORE_CONCEPTS,
  GLOSSARY,
} from './constants'

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ tradition }: { tradition: Tradition }) {
  const meta = META[tradition.slug]
  const [iconHovered, setIconHovered] = useState(false)

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: '68vh' }}>

      {/* Atmospheric radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 40%, color-mix(in srgb, var(--trad-color-active) 13%, transparent) 0%, transparent 70%)',
        }}
      />

      {/* Outer ring glow — dark mode only */}
      <div
        className="tradition-outer-ring pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 40% 30% at 50% 38%, color-mix(in srgb, var(--trad-color-active) 8%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20">

        {/* Back link */}
        <Link
          to="/traditions"
          className="absolute top-6 left-4 sm:left-8 inline-flex items-center gap-1.5 font-display text-[10px] md:text-xs tracking-widest uppercase transition-all hover:underline py-2 -my-2"
          style={{ color: 'var(--trad-color-active)' }}
        >
          <span>←</span> All Traditions
        </Link>

        {/* Tier badge */}
        {tradition.tier === 'premium' && (
          <span
            className="font-display text-[8px] md:text-[9px] tracking-[0.3em] uppercase rounded-full px-3 py-1 mb-6"
            style={{
              color: 'var(--trad-color-active)',
              background: 'color-mix(in srgb, var(--trad-color-active) 9%, transparent)',
              border: '1px solid color-mix(in srgb, var(--trad-color-active) 21%, transparent)',
            }}
          >
            Practitioner
          </span>
        )}

        {/* Icon */}
        <div
          className="text-6xl md:text-8xl mb-5 md:mb-7 select-none cursor-default"
          onMouseEnter={() => setIconHovered(true)}
          onMouseLeave={() => setIconHovered(false)}
          style={{
            color: 'var(--trad-color-active)',
            filter: iconHovered
              ? 'drop-shadow(0 0 20px color-mix(in srgb, var(--trad-color-active) 80%, transparent)) drop-shadow(0 0 48px color-mix(in srgb, var(--trad-color-active) 40%, transparent))'
              : undefined,
            transition: 'filter 350ms ease',
          }}
        >
          {meta?.icon ?? '✦'}
        </div>

        {/* Era */}
        {meta?.era && (
          <p
            className="font-display text-[9px] md:text-[11px] tracking-[0.3em] uppercase mb-3"
            style={{ color: 'var(--trad-color-active)' }}
          >
            {meta.era}
          </p>
        )}

        {/* Tradition name */}
        <h1
          className="font-display text-4xl sm:text-6xl md:text-7xl text-fg mb-5 leading-tight break-words w-full tradition-title-shadow"
          style={{ hyphens: 'auto', wordBreak: 'break-word' }}
          lang="en"
        >
          {tradition.name}
        </h1>

        {/* Tagline */}
        <p className="font-sans text-sm md:text-base text-fg-muted max-w-md md:max-w-lg leading-relaxed mb-8">
          {meta?.tagline ?? meta?.description}
        </p>

        {/* Accent rule */}
        <div
          className="w-16 md:w-24 h-px rounded-full opacity-45"
          style={{ background: 'var(--trad-color-active)' }}
        />
      </div>
    </div>
  )
}

// ── Core Concepts ─────────────────────────────────────────────────────────────

function CoreConceptsSection({ slug }: { slug: string }) {
  const concepts = CORE_CONCEPTS[slug]
  if (!concepts?.length) return null

  return (
    <section className="max-w-2xl lg:max-w-4xl mx-auto px-4 mb-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-border-hi" />
        <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-fg-muted px-1">
          Core Concepts
        </h2>
        <div className="h-px flex-1 bg-border-hi" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        {concepts.map((concept, i) => (
          <div
            key={concept.name}
            className="relative rounded-card overflow-hidden
                       bg-surface border border-border-subtle
                       dark:shadow-[var(--shadow-card-dark)]"
            style={{ WebkitBackdropFilter: 'blur(12px)' }}
          >
            {/* Accent top border */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, color-mix(in srgb, var(--trad-color-active) 80%, transparent), color-mix(in srgb, var(--trad-color-active) 33%, transparent))',
              }}
            />

            <div className="p-5 md:p-6 pt-6 md:pt-7">
              {/* Number */}
              <span
                className="font-display text-3xl md:text-5xl font-bold leading-none mb-3 block select-none opacity-[0.28] dark:opacity-[0.35]"
                style={{ color: 'var(--trad-color-active)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Name */}
              <h3 className="font-display text-sm md:text-base tracking-wide mb-2 text-fg">
                {concept.name}
              </h3>

              {/* Description */}
              <p className="font-sans text-xs md:text-sm leading-relaxed text-fg-muted">
                {concept.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Glossary ──────────────────────────────────────────────────────────────────

function GlossarySection({ slug }: { slug: string }) {
  const [query, setQuery]       = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const terms = GLOSSARY[slug] ?? []

  const filtered = useMemo(() =>
    query.trim()
      ? terms.filter(t =>
          t.term.toLowerCase().includes(query.toLowerCase()) ||
          t.definition.toLowerCase().includes(query.toLowerCase()),
        )
      : terms,
    [terms, query],
  )

  if (!terms.length) return null

  return (
    <section className="max-w-2xl lg:max-w-4xl mx-auto px-4 mb-16">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-border-hi" />
        <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-fg-muted px-1">
          Glossary
        </h2>
        <div className="h-px flex-1 bg-border-hi" />
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] pointer-events-none select-none opacity-60"
          style={{ color: 'var(--trad-color-active)' }}
        >
          ⌕
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search terms…"
          className="w-full pl-7 pr-3 py-2 rounded-stone font-sans text-xs
                     bg-transparent border
                     text-fg
                     placeholder:text-fg-subtle
                     focus:outline-none"
          style={{ borderColor: isFocused
            ? 'color-mix(in srgb, var(--trad-color-active) 50%, transparent)'
            : 'color-mix(in srgb, var(--trad-color-active) 25%, transparent)'
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg-muted text-xs leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="font-sans text-xs text-fg-subtle text-center py-6">
          No terms match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(item => {
            const isOpen = expanded === item.term
            const defId = `glossary-def-${slug}-${item.term.replace(/\s+/g, '-').toLowerCase()}`
            return (
              <div
                key={item.term}
                className="rounded-card overflow-hidden"
                style={{
                  background: 'color-mix(in srgb, var(--color-surface) 100%, transparent)',
                  border: `1px solid ${isOpen
                    ? 'color-mix(in srgb, var(--trad-color-active) 33%, transparent)'
                    : 'color-mix(in srgb, var(--trad-color-active) 13%, transparent)'}`,
                  boxShadow: isOpen
                    ? '0 0 0 1px color-mix(in srgb, var(--trad-color-active) 15%, transparent), var(--shadow-elevated)'
                    : undefined,
                }}
              >
                {/* Top accent strip */}
                {isOpen && (
                  <div
                    className="h-[2px]"
                    style={{
                      background: 'linear-gradient(90deg, color-mix(in srgb, var(--trad-color-active) 80%, transparent), color-mix(in srgb, var(--trad-color-active) 27%, transparent))',
                    }}
                  />
                )}

                {/* Trigger */}
                <button
                  aria-expanded={isOpen}
                  aria-controls={defId}
                  onClick={() => setExpanded(isOpen ? null : item.term)}
                  className="w-full text-left px-4 pt-3.5 pb-2 flex items-center justify-between gap-2
                             focus:outline-none focus:ring-1 active:scale-[0.995] transition-transform duration-100"
                  style={{ ['--tw-ring-color' as string]: 'color-mix(in srgb, var(--trad-color-active) 38%, transparent)' }}
                >
                  <h3
                    className="font-display text-xs md:text-[13px] tracking-wide leading-snug"
                    style={{ color: 'var(--trad-color-active)' }}
                  >
                    {item.term}
                  </h3>
                  <span
                    className="text-[9px] shrink-0 transition-transform duration-200 select-none opacity-50"
                    style={{
                      color: 'var(--trad-color-active)',
                      transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  >
                    ▶
                  </span>
                </button>

                {/* Definition */}
                <div id={defId} hidden={!isOpen} className="px-4 pb-3.5">
                  <p className="font-sans text-xs md:text-sm leading-relaxed text-fg-muted">
                    {item.definition}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

// ── Key Figures ───────────────────────────────────────────────────────────────

function KeyFiguresSection({
  authors,
  traditionSlug,
}: {
  authors: Author[]
  traditionSlug: string
}) {
  if (!authors.length) return null

  return (
    <section className="mb-16">
      {/* Section header */}
      <div className="max-w-2xl lg:max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-border-hi" />
          <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-fg-muted px-1">
            Philosophers
          </h2>
          <div className="h-px flex-1 bg-border-hi" />
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
                    style={{ border: '2px solid color-mix(in srgb, var(--trad-color-active) 38%, transparent)' }}
                  />
                ) : (
                  <div
                    className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-full flex items-center justify-center text-xl md:text-2xl transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: 'color-mix(in srgb, var(--trad-color-active) 18%, transparent)',
                      border: '2px solid color-mix(in srgb, var(--trad-color-active) 38%, transparent)',
                      color: 'var(--trad-color-active)',
                    }}
                  >
                    {META[traditionSlug]?.icon ?? '✦'}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className="text-center">
                <p className="font-display text-[9px] md:text-[11px] tracking-wide text-fg group-hover:text-accent leading-snug text-center transition-colors">
                  {author.name}
                </p>
                {(author.born || author.died) && (
                  <p className="font-sans text-[8px] md:text-[10px] text-fg-muted mt-0.5">
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
  isPremium,
  tier,
  tradColors,
}: {
  slug:       string
  isPremium:  boolean
  tier:       string
  tradColors: { light: string; dark: string }
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
        <div className="h-px flex-1 bg-border-hi" />
        <h2 className="font-display text-[10px] md:text-xs tracking-[0.28em] uppercase text-fg-muted px-1">
          Passages
        </h2>
        <div className="h-px flex-1 bg-border-hi" />
      </div>

      {!loading && (
        <p className="font-sans text-[10px] md:text-xs text-fg-muted text-center mb-8">
          {total} passage{total !== 1 ? 's' : ''} in this tradition
        </p>
      )}

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-card bg-surface animate-pulse" />
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
                    <PassageCard quote={q} tradColors={tradColors} />
                  </PremiumGate>
                )
              }
              return <PassageCard key={q.id} quote={q} tradColors={tradColors} />
            })}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="font-display text-[10px] tracking-[0.2em] uppercase px-6 py-2.5 rounded-stone transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  color: 'var(--trad-color-active)',
                  border: '1px solid color-mix(in srgb, var(--trad-color-active) 38%, transparent)',
                  background: 'color-mix(in srgb, var(--trad-color-active) 8%, transparent)',
                }}
              >
                {loadingMore ? 'Loading…' : `Load more · ${total - quotes.length} remaining`}
              </button>
            </div>
          )}

          {tier === 'premium' && !isPremium && (
            <div className="mt-10">
              <PremiumGate />
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
          <div className="h-8 w-48 mx-auto rounded bg-surface animate-pulse" />
          <div className="h-16 w-72 mx-auto rounded bg-surface animate-pulse" />
          <div className="h-4 w-64 mx-auto rounded bg-surface animate-pulse" />
        </div>
      </main>
    )
  }

  if (error || !tradition || !slug) {
    return (
      <main className="min-h-screen bg-surface-base page-utility flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-sans text-sm text-fg-subtle mb-4">
            Tradition not found.
          </p>
          <button
            onClick={() => navigate('/traditions')}
            className="font-display text-[10px] tracking-widest uppercase text-accent underline"
          >
            Browse traditions
          </button>
        </div>
      </main>
    )
  }

  const colors = TRADITION_COLORS[tradition.slug] ?? TRADITION_DEFAULT_COLORS

  return (
    <main
      className="min-h-screen bg-surface-base page-utility"
      style={{
        '--trad-color':    colors.light,
        '--trad-color-dk': colors.dark,
      } as React.CSSProperties}
    >
      {/* Hero */}
      <Hero tradition={tradition} />

      {/* Core Concepts */}
      <CoreConceptsSection slug={tradition.slug} />

      {/* Glossary */}
      <GlossarySection slug={tradition.slug} />

      {/* Key Figures */}
      <KeyFiguresSection
        authors={tradition.authors ?? []}
        traditionSlug={tradition.slug}
      />

      {/* Passages */}
      <PassagesSection
        slug={tradition.slug}
        isPremium={isPremium}
        tier={tradition.tier}
        tradColors={colors}
      />

    </main>
  )
}

// src/features/traditions/TraditionBrowser.tsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import apiClient from '../../services/api/api'
import type { Tradition, Quote } from '../../types/quote'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PremiumGate } from '../../components/common/PremiumGate'
import { PassageCard } from './PassageCard'
import { META, TRADITION_COLORS, TRADITION_DEFAULT_COLORS } from './constants'

// How many premium traditions to show as teasers before the "more" card
const PREMIUM_TEASER = 2

// ── Section divider ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-border-hi" />
        <h2 className="font-display text-[10px] tracking-[0.25em] uppercase text-fg-muted px-1">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border-hi" />
      </div>
      <p className="font-sans text-xs text-fg-subtle text-center">{subtitle}</p>
    </div>
  )
}

// ── "N more traditions" reveal card ──────────────────────────────────────────

function MorePremiumTeaser({
  count,
  names,
  onReveal,
}: {
  count: number
  names: string[]
  onReveal: () => void
}) {
  const preview = names.slice(0, 3).join(', ')
  const extra   = names.length > 3 ? ` +${names.length - 3} more` : ''

  return (
    <div className="relative mt-3">
      {/* Stacked-card illusion — a ghost layer behind */}
      <div
        className="absolute inset-x-3 -bottom-1.5 h-10 rounded-card border
                   bg-surface border-border-subtle"
      />

      <button
        onClick={onReveal}
        className="relative w-full text-left rounded-card border p-4 transition-all duration-200 group
                   bg-surface border-border hover:border-accent/40 hover:shadow-card-hover
                   dark:hover:border-[var(--color-accent-25)] dark:hover:bg-surface-elevated"
        style={{ WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg
                       bg-[var(--color-accent-10)] text-accent"
          >
            ✦
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-sm tracking-wide text-fg mb-0.5">
              {count} more tradition{count !== 1 ? 's' : ''}
            </p>
            <p className="font-sans text-xs text-fg-subtle truncate">
              {preview}{extra}
            </p>
          </div>

          {/* CTA */}
          <span
            className="shrink-0 font-display text-[10px] tracking-[0.2em] uppercase
                       text-accent group-hover:underline transition-all"
          >
            Show all →
          </span>
        </div>
      </button>
    </div>
  )
}

// ── Individual tradition card ─────────────────────────────────────────────────

function TraditionCard({
  tradition,
  isPremium,
}: {
  tradition: Tradition
  isPremium: boolean
}) {
  const [expanded, setExpanded]   = useState(false)
  const [quotes, setQuotes]       = useState<Quote[]>([])
  const [loading, setLoading]     = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const isLocked = tradition.tier === 'premium' && !isPremium

  const meta = META[tradition.slug] ?? {
    description: '',
    tagline: '',
    icon: '✦',
    era: '',
  }

  const colors = TRADITION_COLORS[tradition.slug] ?? TRADITION_DEFAULT_COLORS

  const toggle = async () => {
    if (isLocked) return
    if (!expanded && quotes.length === 0) {
      setLoading(true)
      setFetchError(false)
      try {
        const res = await apiClient.get('/api/quotes/search', {
          params: { tradition: tradition.slug, limit: 10 },
        })
        setQuotes(res.data.quotes ?? [])
        setExpanded(true)
      } catch {
        setFetchError(true)
      } finally {
        setLoading(false)
      }
      return
    }
    setExpanded(v => !v)
  }

  return (
    <div
      className={`rounded-card border transition-all duration-300 overflow-hidden
                  bg-surface border-border shadow-card dark:shadow-[var(--shadow-card-dark)]
                  ${isLocked ? 'opacity-70' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:bg-surface-elevated dark:hover:bg-surface-elevated'}`}
      style={{
        WebkitBackdropFilter: 'blur(16px)',
        '--trad-color':    colors.light,
        '--trad-color-dk': colors.dark,
      } as React.CSSProperties}
      onClick={toggle}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{
              background: 'color-mix(in srgb, var(--trad-color-active) 18%, transparent)',
              color: 'var(--trad-color-active)',
            }}
          >
            {meta.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display text-sm tracking-wider text-fg">
                {tradition.name}
              </h3>
            </div>
            <p className="font-sans text-xs text-fg-muted leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          </div>

          {/* Right side */}
          <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
            {isLocked ? (
              <PremiumGate inline />
            ) : (
              <>
                <Link
                  to={`/traditions/${tradition.slug}`}
                  onClick={e => e.stopPropagation()}
                  className="font-display text-[8px] tracking-[0.2em] uppercase transition-all hover:scale-105 active:scale-95 py-1 px-2 rounded-stone"
                  style={{
                    color: 'var(--trad-color-active)',
                    background: 'color-mix(in srgb, var(--trad-color-active) 9%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--trad-color-active) 27%, transparent)',
                  }}
                >
                  Explore
                </Link>
                <span
                  className="text-fg-muted text-sm transition-transform duration-200"
                  style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ▾
                </span>
              </>
            )}
          </div>
        </div>

        {/* Expanded passages */}
        {expanded && (
          <div className="mt-4 border-t border-border-subtle pt-4">
            {loading ? (
              <p className="font-sans text-xs text-fg-subtle text-center py-4">
                Loading passages…
              </p>
            ) : fetchError ? (
              <div className="text-center py-4">
                <p className="font-sans text-xs text-fg-subtle mb-2">
                  Could not load passages.
                </p>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    setFetchError(false)
                    setExpanded(false)
                  }}
                  className="font-sans text-xs text-accent hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : quotes.length === 0 ? (
              <p className="font-sans text-xs text-fg-subtle text-center py-4">
                No passages found.
              </p>
            ) : (
              <div className="space-y-7">
                {quotes.map(q => (
                  <PassageCard key={q.id} quote={q} tradColors={colors} />
                ))}
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                to={`/traditions/${tradition.slug}`}
                className="font-display text-[9px] tracking-[0.2em] uppercase transition-all hover:underline"
                style={{ color: 'var(--trad-color-active)' }}
                onClick={e => e.stopPropagation()}
              >
                Explore all passages →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main TraditionBrowser ─────────────────────────────────────────────────────

export const TraditionBrowser = () => {
  const [traditions, setTraditions] = useState<Tradition[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(false)
  const { isPremium }               = useSubscription()

  // Premium users see all traditions immediately; free users see a teaser
  const [showAllPremium, setShowAllPremium] = useState(false)

  useEffect(() => {
    traditionsApi.list()
      .then(setTraditions)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const free    = traditions.filter(t => t.tier === 'free')
  const premium = traditions.filter(t => t.tier === 'premium')

  const showAll       = isPremium || showAllPremium
  const visiblePremium = showAll ? premium : premium.slice(0, PREMIUM_TEASER)
  const hiddenCount    = showAll ? 0 : Math.max(0, premium.length - PREMIUM_TEASER)
  const hiddenNames    = premium.slice(PREMIUM_TEASER).map(t => t.name)

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
      <div className="max-w-lg md:max-w-2xl mx-auto">

        {/* Page header */}
        <header className="text-center mb-12">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
            Explore
          </p>
          <h1 className="font-display text-3xl text-fg mb-3 title-glow-hover">
            Wisdom Traditions
          </h1>
          <p className="font-sans text-sm text-fg-muted max-w-sm mx-auto leading-relaxed">
            Ten schools of thought spanning three millennia.
            Tap any tradition to preview — or Explore for the full deep-dive.
          </p>
          <div className="mt-5">
            <Link
              to="/traditions/timeline"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-stone border font-display text-[10px] tracking-[0.18em] uppercase transition-all duration-150 hover:scale-105 active:scale-95"
              style={{
                color:      'var(--color-accent)',
                background: 'var(--color-accent-10)',
                border:     '1px solid var(--color-accent-30)',
              }}
            >
              <span style={{ fontSize: 13 }}>◈</span>
              Philosopher Timeline
            </Link>
          </div>
        </header>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-[72px] rounded-card bg-surface animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="font-sans text-sm text-fg-subtle text-center py-8">
            Could not load traditions. Is the backend running?
          </p>
        )}

        {/* Grouped lists */}
        {!loading && !error && (
          <div className="space-y-8">

            {/* Free traditions — always shown in full */}
            {free.length > 0 && (
              <section>
                <SectionHeader
                  title="Open Traditions"
                  subtitle="Available to all readers"
                />
                <div className="space-y-3">
                  {free.map(t => (
                    <TraditionCard key={t.id} tradition={t} isPremium={isPremium} />
                  ))}
                </div>
              </section>
            )}

            {/* Premium traditions — limited for free users */}
            {premium.length > 0 && (
              <section>
                <SectionHeader
                  title="Practitioner Traditions"
                  subtitle={isPremium
                    ? 'Hermetic, Neoplatonic, and esoteric wisdom'
                    : 'Unlock with lifetime access'}
                />
                <div className="space-y-3">
                  {visiblePremium.map(t => (
                    <TraditionCard key={t.id} tradition={t} isPremium={isPremium} />
                  ))}
                </div>

                {/* Teaser card — only for free users with hidden traditions */}
                {hiddenCount > 0 && (
                  <MorePremiumTeaser
                    count={hiddenCount}
                    names={hiddenNames}
                    onReveal={() => setShowAllPremium(true)}
                  />
                )}
              </section>
            )}

          </div>
        )}
      </div>
    </main>
  )
}

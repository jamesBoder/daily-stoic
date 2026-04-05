// src/features/traditions/TraditionBrowser.tsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import apiClient from '../../services/api/api'
import type { Tradition, Quote } from '../../types/quote'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useIsDark } from '../../hooks/useIsDark'
import { PremiumGate } from '../../components/common/PremiumGate'
import { PassageCard } from './PassageCard'
import { META, ICON_COLOR, ICON_COLOR_DARK } from './constants'

// ── Section divider ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
        <h2 className="font-display text-[10px] tracking-[0.25em] uppercase text-primary-600 dark:text-night-400 px-1">
          {title}
        </h2>
        <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
      </div>
      <p className="font-sans text-xs text-primary-500 dark:text-night-500 text-center">{subtitle}</p>
    </div>
  )
}

// ── Individual tradition card ─────────────────────────────────────────────────

function TraditionCard({
  tradition,
  isPremium,
  isDark,
}: {
  tradition: Tradition
  isPremium: boolean
  isDark: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(false)
  const isLocked = tradition.tier === 'premium' && !isPremium

  const meta = META[tradition.slug] ?? {
    description: '',
    tagline: '',
    icon: '✦',
    accent: 'rgba(139,115,85,0.15)',
    accentDark: 'rgba(212,168,83,0.15)',
    era: '',
  }

  const color   = (isDark ? ICON_COLOR_DARK : ICON_COLOR)[tradition.slug] ?? '#8b7355'
  const bgColor = isDark ? meta.accentDark : meta.accent

  const toggle = async () => {
    if (isLocked) return
    if (!expanded && quotes.length === 0) {
      setLoading(true)
      try {
        const res = await apiClient.get('/api/quotes/search', {
          params: { tradition: tradition.slug, limit: 10 },
        })
        setQuotes(res.data.quotes ?? [])
      } finally {
        setLoading(false)
      }
    }
    setExpanded(v => !v)
  }

  const cardContent = (
    <div
      className={`rounded-card border transition-all duration-300 overflow-hidden
                  bg-surface-card border-primary-200/60 shadow-card
                  dark:bg-[rgba(10,20,44,0.55)] dark:border-[rgba(255,255,255,0.07)]
                  dark:shadow-[0_2px_20px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]
                  ${isLocked ? 'opacity-70' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:bg-surface-elevated dark:hover:bg-[rgba(15,28,60,0.70)]'}`}
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{ background: bgColor, color }}
          >
            {meta.icon}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-display text-sm tracking-wider text-primary-800 dark:text-[#e0ddd4]">
                {tradition.name}
              </h3>
            </div>
            <p className="font-sans text-xs text-primary-600 dark:text-night-400 leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          </div>

          {/* Right side — Explore link + expand chevron, or unlock badge */}
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
                    color,
                    background: `${color}18`,
                    border: `1px solid ${color}45`,
                  }}
                >
                  Explore
                </Link>
                <span
                  className="text-primary-600 dark:text-night-400 text-sm transition-transform duration-200"
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
          <div className="mt-4 border-t border-primary-200/50 dark:border-[rgba(255,255,255,0.06)] pt-4">
            {loading ? (
              <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center py-4">
                Loading passages…
              </p>
            ) : quotes.length === 0 ? (
              <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center py-4">
                No passages found.
              </p>
            ) : (
              <div className="space-y-7">
                {quotes.map(q => (
                  <PassageCard
                    key={q.id}
                    quote={q}
                    accentColor={isDark ? ICON_COLOR_DARK[tradition.slug] : ICON_COLOR[tradition.slug]}
                  />
                ))}
              </div>
            )}

            {/* Link to full tradition page */}
            <div className="mt-6 text-center">
              <Link
                to={`/traditions/${tradition.slug}`}
                className="font-display text-[9px] tracking-[0.2em] uppercase transition-all hover:underline"
                style={{ color }}
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

  return cardContent
}

// ── Main TraditionBrowser ─────────────────────────────────────────────────────

export const TraditionBrowser = () => {
  const [traditions, setTraditions] = useState<Tradition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { isPremium } = useSubscription()
  const isDark = useIsDark()

  useEffect(() => {
    traditionsApi.list()
      .then(setTraditions)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const free    = traditions.filter(t => t.tier === 'free')
  const premium = traditions.filter(t => t.tier === 'premium')

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
      <div className="max-w-lg md:max-w-2xl mx-auto">

        {/* Page header */}
        <header className="text-center mb-12">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent dark:text-[#d4a853] mb-2">
            Explore
          </p>
          <h1 className="font-display text-3xl text-primary-800 dark:text-[#e8e0cc] mb-3 title-glow-hover">
            Wisdom Traditions
          </h1>
          <p className="font-sans text-sm text-primary-600 dark:text-night-400 max-w-sm mx-auto leading-relaxed">
            Ten schools of thought spanning three millennia.
            Tap any tradition to preview — or Explore for the full deep-dive.
          </p>
        </header>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="h-[72px] rounded-card bg-primary-100/60 dark:bg-night-800/40 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="font-sans text-sm text-primary-400 dark:text-night-500 text-center py-8">
            Could not load traditions. Is the backend running?
          </p>
        )}

        {/* Grouped lists */}
        {!loading && !error && (
          <div className="space-y-8">
            {free.length > 0 && (
              <section>
                <SectionHeader
                  title="Open Traditions"
                  subtitle="Available to all readers"
                />
                <div className="space-y-3">
                  {free.map(t => (
                    <TraditionCard key={t.id} tradition={t} isPremium={isPremium} isDark={isDark} />
                  ))}
                </div>
              </section>
            )}

            {premium.length > 0 && (
              <section>
                <SectionHeader
                  title="Practitioner Traditions"
                  subtitle="Hermetic, Neoplatonic, and esoteric wisdom"
                />
                <div className="space-y-3">
                  {premium.map(t => (
                    <TraditionCard key={t.id} tradition={t} isPremium={isPremium} isDark={isDark} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

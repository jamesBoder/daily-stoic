// src/features/traditions/TraditionBrowser.tsx

import { useEffect, useState } from 'react'
import { traditionsApi } from '../../services/api/traditions'
import apiClient from '../../services/api/api'
import type { Tradition, Quote } from '../../types/quote'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PremiumGate } from '../../components/common/PremiumGate'
import { QuoteCard } from '../quote/QuoteCard'

// ── Tradition metadata ────────────────────────────────────────────────────────

const META: Record<string, {
  description: string
  icon: string
  accent: string       // CSS color for the icon circle
  accentDark: string   // accent for dark mode
}> = {
  stoicism: {
    description: 'Virtue, reason, and living according to nature — the bedrock of Greco-Roman wisdom.',
    icon: '⊕',
    accent: 'rgba(139,115,85,0.18)',
    accentDark: 'rgba(212,168,83,0.18)',
  },
  hermeticism: {
    description: 'The Seven Hermetic Principles — As Above, So Below. The Emerald Tablet speaks.',
    icon: '✦',
    accent: 'rgba(110,70,160,0.18)',
    accentDark: 'rgba(180,120,255,0.18)',
  },
  neoplatonism: {
    description: 'The emanation of the One into Being, Intellect, and Soul — Plotinus, Porphyry, Proclus.',
    icon: '◎',
    accent: 'rgba(180,145,50,0.18)',
    accentDark: 'rgba(240,195,70,0.20)',
  },
  gnosticism: {
    description: 'Gnosis — direct knowledge of the divine spark within, liberation from matter.',
    icon: '✧',
    accent: 'rgba(150,50,60,0.18)',
    accentDark: 'rgba(220,80,100,0.18)',
  },
  kabbalah: {
    description: 'The Tree of Life, Sefirot, and the infinite nature of Ein Sof.',
    icon: '✡',
    accent: 'rgba(40,80,180,0.18)',
    accentDark: 'rgba(80,140,255,0.20)',
  },
  pythagoreanism: {
    description: 'Number as the principle of all things — harmony, proportion, and the music of the spheres.',
    icon: '△',
    accent: 'rgba(40,140,130,0.18)',
    accentDark: 'rgba(60,200,180,0.18)',
  },
  'pre-socratic': {
    description: 'The first seekers — Heraclitus, Parmenides, Anaximander — asking what everything is made of.',
    icon: '∞',
    accent: 'rgba(180,90,30,0.18)',
    accentDark: 'rgba(240,130,50,0.20)',
  },
  'african-philosophy': {
    description: 'Ubuntu, Maat, and the deep wisdom traditions of the African continent.',
    icon: '◇',
    accent: 'rgba(160,80,30,0.18)',
    accentDark: 'rgba(220,130,60,0.20)',
  },
  'renaissance-philosophy': {
    description: 'Montaigne, Bacon, Spinoza — reason, humanism, and the revival of ancient thought.',
    icon: '☿',
    accent: 'rgba(60,120,60,0.18)',
    accentDark: 'rgba(90,180,90,0.20)',
  },
  transcendentalism: {
    description: 'The Over-Soul, self-reliance, and the sacred in nature — Emerson and beyond.',
    icon: '☀',
    accent: 'rgba(60,130,180,0.18)',
    accentDark: 'rgba(90,170,240,0.20)',
  },
}

const iconColor: Record<string, string> = {
  stoicism:               '#8b7355',
  hermeticism:            '#9a6fd0',
  neoplatonism:           '#c8a83a',
  gnosticism:             '#c04060',
  kabbalah:               '#4080e0',
  pythagoreanism:         '#28c8b8',
  'pre-socratic':         '#e07830',
  'african-philosophy':   '#d08040',
  'renaissance-philosophy':'#48a048',
  transcendentalism:      '#4898d8',
}

const iconColorDark: Record<string, string> = {
  stoicism:               '#d4a853',
  hermeticism:            '#c090ff',
  neoplatonism:           '#f0c840',
  gnosticism:             '#f06080',
  kabbalah:               '#70b0ff',
  pythagoreanism:         '#50e8d8',
  'pre-socratic':         '#f0a060',
  'african-philosophy':   '#e8a060',
  'renaissance-philosophy':'#70c870',
  transcendentalism:      '#70c0ff',
}

// ── Section divider ───────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-px flex-1 bg-primary-200/70 dark:bg-night-700/60" />
        <h2 className="font-display text-[10px] tracking-[0.25em] uppercase text-primary-500 dark:text-night-400 px-1">
          {title}
        </h2>
        <div className="h-px flex-1 bg-primary-200/70 dark:bg-night-700/60" />
      </div>
      <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center">{subtitle}</p>
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
    icon: '✦',
    accent: 'rgba(139,115,85,0.15)',
    accentDark: 'rgba(212,168,83,0.15)',
  }

  const color    = (isDark ? iconColorDark : iconColor)[tradition.slug] ?? '#8b7355'
  const bgColor  = isDark ? meta.accentDark : meta.accent

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
                  ${isLocked ? '' : 'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover dark:hover:shadow-glass-hover'}`}
      onClick={isLocked ? undefined : toggle}
      style={{ WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon circle */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
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
              {tradition.tier === 'premium' && (
                <span
                  className="font-display text-[8px] tracking-widest uppercase rounded-full px-1.5 py-0.5 flex-shrink-0"
                  style={{
                    color,
                    background: bgColor,
                    border: `1px solid ${color}40`,
                  }}
                >
                  Practitioner
                </span>
              )}
            </div>
            <p className="font-sans text-xs text-primary-500 dark:text-night-400 leading-relaxed line-clamp-2">
              {meta.description}
            </p>
          </div>

          {/* Expand chevron */}
          {!isLocked && (
            <span
              className="flex-shrink-0 text-primary-400 dark:text-night-500 text-sm mt-1 transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              ▾
            </span>
          )}
        </div>

        {/* Expanded quotes */}
        {expanded && (
          <div className="mt-4 border-t border-primary-200/50 dark:border-[rgba(255,255,255,0.06)] pt-4">
            {loading ? (
              <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center py-4">
                Loading quotes…
              </p>
            ) : quotes.length === 0 ? (
              <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center py-4">
                No quotes found.
              </p>
            ) : (
              <div className="space-y-5">
                {quotes.map(q => (
                  <QuoteCard key={q.id} quote={q} compact />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (isLocked) {
    return <PremiumGate>{cardContent}</PremiumGate>
  }
  return cardContent
}

// ── Main TraditionBrowser ─────────────────────────────────────────────────────

export const TraditionBrowser = () => {
  const [traditions, setTraditions] = useState<Tradition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const { isPremium } = useSubscription()

  // Detect dark mode by checking document class
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    traditionsApi.list()
      .then(setTraditions)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const free    = traditions.filter(t => t.tier === 'free')
  const premium = traditions.filter(t => t.tier === 'premium')

  return (
    <main className="min-h-screen bg-surface-base dark:bg-transparent py-16 px-4">
      <div className="max-w-lg mx-auto">

        {/* Page header */}
        <header className="text-center mb-12">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent dark:text-star-gold mb-2">
            Explore
          </p>
          <h1 className="font-display text-3xl text-primary-800 dark:text-[#e8e0cc] mb-3">
            Wisdom Traditions
          </h1>
          <p className="font-sans text-sm text-primary-500 dark:text-night-400 max-w-sm mx-auto leading-relaxed">
            Ten schools of thought spanning three millennia.
            Tap any tradition to read from its canon.
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
            {/* ── Open traditions (free) ── */}
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

            {/* ── Practitioner traditions (premium) ── */}
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

// src/features/traditions/PhilosopherTimeline.tsx

import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../../services/api/api'
import type { Author } from '../../types/quote'
import {
  TRADITION_COLORS,
  TRADITION_CARD_THEMES,
  TRADITION_SLUG,
  TRADITION_NAME,
  TRADITION_ICON,
  TRADITION_NEUTRAL_COLORS,
} from './constants'

// ── Date parsing ──────────────────────────────────────────────────────────────

function parseYear(s: string | undefined): number | null {
  if (!s) return null
  const t = s.trim().toLowerCase()
  if (t === 'unknown' || t === '') return null

  const centuryMatch = t.match(/(\d+)(?:st|nd|rd|th)\s+century\s*(bce?|bc|ad|ce)?/)
  if (centuryMatch) {
    const n   = parseInt(centuryMatch[1])
    const era = centuryMatch[2] ?? 'ce'
    const mid = (n - 1) * 100 + 50
    return era.startsWith('b') ? -mid : mid
  }

  const clean = t.replace(/^c\.\s*/, '').trim()
  const m = clean.match(/^(\d+)\s*(bce?|bc|ad|ce)?$/)
  if (!m) return null

  const year = parseInt(m[1])
  const era  = m[2] ?? ''
  if (era === 'bc' || era === 'bce') return -year
  return year
}

function fmtYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`
}

function dateLabel(born: string | undefined, died: string | undefined): string {
  if (!born && !died)  return 'Dates unknown'
  if (!died || died.toLowerCase() === 'unknown') return `b. ${born}`
  if (!born || born.toLowerCase() === 'unknown') return `d. ${died}`
  return `${born} – ${died}`
}

// ── Era config — purely year-range driven, scales to any philosopher added ───

const ERAS = [
  { label: 'Ancient',     range: 'Before 500 BCE',      start: -9999, end: -500 },
  { label: 'Classical',   range: '500 BCE – 500 CE',    start: -500,  end:  500 },
  { label: 'Medieval',    range: '500 – 1400 CE',        start:  500,  end: 1400 },
  { label: 'Renaissance', range: '1400 – 1800 CE',       start: 1400,  end: 1800 },
  { label: 'Modern',      range: '1800 CE – Present',    start: 1800,  end: 9999 },
] as const

// Filter chip display order — add new tradition IDs here when new traditions
// are introduced. Cards appear automatically from API data.
const TRAD_ORDER = [15, 7, 6, 12, 11, 8, 1, 2, 3, 4, 5, 13, 9, 10, 14]

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhiloEntry {
  author:    Author
  bornY:     number | null
  diedY:     number | null
  sortY:     number
  tradId:    number
  slug:      string
  colors:    { light: string; dark: string }
  surface:   string
  surfaceDk: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PhilosopherTimeline = () => {
  const [authors,    setAuthors]    = useState<Author[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [activeTrad, setActiveTrad] = useState<number | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    apiClient.get('/api/authors')
      .then(r => setAuthors(r.data.authors ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Flat chronological list of all datable philosophers
  const allEntries = useMemo<PhiloEntry[]>(() => {
    const entries: PhiloEntry[] = []
    for (const a of authors) {
      const tid = a.tradition_id
      if (!tid) continue
      const bornY = parseYear(a.born)
      const diedY = parseYear(a.died)
      const sortY = bornY ?? diedY
      if (sortY === null) continue
      const slug  = TRADITION_SLUG[tid] ?? ''
      const theme = TRADITION_CARD_THEMES[slug]
      entries.push({
        author: a,
        bornY,
        diedY,
        sortY,
        tradId: tid,
        slug,
        colors:    TRADITION_COLORS[slug] ?? TRADITION_NEUTRAL_COLORS,
        surface:   theme?.surface   ?? 'var(--color-surface)',
        surfaceDk: theme?.surfaceDk ?? 'var(--color-surface-modal)',
      })
    }
    return entries.sort((a, b) => a.sortY - b.sortY)
  }, [authors])

  // Tradition IDs present in data, in TRAD_ORDER sequence
  const tradIds = useMemo(() => {
    const present = new Set(allEntries.map(e => e.tradId))
    return TRAD_ORDER.filter(id => present.has(id))
  }, [allEntries])

  // Era groups — empty eras are omitted automatically
  const eraGroups = useMemo(() => {
    return ERAS.map(era => ({
      ...era,
      entries: allEntries.filter(e => e.sortY >= era.start && e.sortY < era.end),
    })).filter(g => g.entries.length > 0)
  }, [allEntries])

  const isVisible = (e: PhiloEntry) =>
    activeTrad === null || e.tradId === activeTrad

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">

      {/* ── Page header ── */}
      <header className="text-center mb-10 max-w-2xl mx-auto">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
          Traditions
        </p>
        <h1 className="font-display text-3xl text-fg mb-3 title-glow-hover">
          Philosopher Timeline
        </h1>
        <p className="font-sans text-sm text-fg-muted leading-relaxed">
          2,600 years of thought — every philosopher in the age they walked.
        </p>
        <div className="mt-4">
          <Link
            to="/traditions"
            className="font-display text-[9px] tracking-[0.2em] uppercase text-accent hover:underline"
          >
            ← Back to Traditions
          </Link>
        </div>
      </header>

      {/* ── Tradition filter chips ── */}
      {!loading && tradIds.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-10 px-4">
          {tradIds.map(tid => {
            const slug   = TRADITION_SLUG[tid] ?? ''
            const colors = TRADITION_COLORS[slug] ?? TRADITION_NEUTRAL_COLORS
            const active = activeTrad === null || activeTrad === tid
            return (
              <button
                key={tid}
                onClick={() => setActiveTrad(prev => prev === tid ? null : tid)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full font-display tracking-wider transition-all duration-150"
                style={{
                  fontSize:   10,
                  '--trad-color':    colors.light,
                  '--trad-color-dk': colors.dark,
                  background: active
                    ? 'color-mix(in srgb, var(--trad-color-active) 13%, transparent)'
                    : 'transparent',
                  border: `1px solid ${active
                    ? 'color-mix(in srgb, var(--trad-color-active) 33%, transparent)'
                    : 'color-mix(in srgb, var(--color-fg) 12%, transparent)'}`,
                  color: active ? 'var(--trad-color-active)' : 'var(--color-fg-subtle)',
                } as React.CSSProperties}
              >
                <span style={{ fontSize: 11 }}>{TRADITION_ICON[tid]}</span>
                {TRADITION_NAME[tid]}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="font-sans text-sm text-fg-subtle text-center py-16">
          Could not load philosophers. Is the backend running?
        </p>
      )}

      {/* ── Empty ── */}
      {!loading && !error && allEntries.length === 0 && (
        <p className="font-sans text-sm text-fg-subtle text-center py-16">
          No philosopher date data available.
        </p>
      )}

      {/* ── Timeline ── */}
      {!loading && !error && allEntries.length > 0 && (
        <div className="max-w-xl mx-auto">
          {eraGroups.map(era => {
            const visibleCount = era.entries.filter(isVisible).length
            if (activeTrad !== null && visibleCount === 0) return null

            return (
              <section key={era.label}>
                <EraHeader
                  label={era.label}
                  range={era.range}
                  tradIds={[...new Set(era.entries.map(e => e.tradId))]}
                  count={visibleCount}
                />

                {/* Cards with vertical spine */}
                <div className="relative">
                  {/* Spine line (desktop) */}
                  <div
                    className="hidden sm:block absolute top-0 bottom-0 left-[88px]"
                    style={{
                      width: '1px',
                      borderLeft: '1px dashed color-mix(in srgb, var(--color-accent) 22%, transparent)',
                    }}
                  />

                  {era.entries.map(entry => {
                    const visible = isVisible(entry)

                    return (
                      <div
                        key={entry.author.id}
                        className={`relative mb-5 sm:mb-7 transition-opacity duration-200 trad-card-${entry.slug}`}
                        style={{
                          opacity:       visible ? 1 : 0.1,
                          pointerEvents: visible ? 'auto' : 'none',
                        }}
                      >
                        {/* Year stamp (desktop) */}
                        <div className="hidden sm:flex absolute top-[14px] left-0 w-[80px] justify-end pr-3">
                          <span className="font-display text-[9px] tracking-widest text-fg-dim whitespace-nowrap leading-none">
                            {fmtYear(entry.sortY)}
                          </span>
                        </div>

                        {/* Spine dot (desktop) */}
                        <div
                          className="hidden sm:block absolute top-[15px] left-[88px] -translate-x-1/2
                                     w-[9px] h-[9px] rounded-full border"
                          style={{
                            background:  'color-mix(in srgb, var(--trad-color-active) 40%, var(--color-surface))',
                            borderColor: 'color-mix(in srgb, var(--trad-color-active) 65%, transparent)',
                          }}
                        />

                        {/* Card */}
                        <div className="sm:ml-[108px]">
                          <PhilosopherCard entry={entry} onNavigate={() => navigate(`/authors/${entry.author.slug}`)} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </main>
  )
}

// ── Philosopher card — card-game aesthetic ────────────────────────────────────

interface PhilosopherCardProps {
  entry:      PhiloEntry
  onNavigate: () => void
}

function PhilosopherCard({ entry, onNavigate }: PhilosopherCardProps) {
  const { author, tradId } = entry
  const icon = TRADITION_ICON[tradId] ?? '◈'
  const name = TRADITION_NAME[tradId] ?? ''

  return (
    <div
      className="timeline-philosopher-card relative rounded-[10px] overflow-hidden cursor-pointer"
      style={{
        border: '2px solid color-mix(in srgb, var(--trad-color-active) 55%, transparent)',
        boxShadow: `
          4px 4px 0 color-mix(in srgb, var(--trad-color-active) 20%, transparent),
          8px 8px 0 color-mix(in srgb, var(--trad-color-active) 10%, transparent),
          0 20px 48px color-mix(in srgb, var(--color-overlay) 40%, transparent)
        `,
      }}
      onClick={onNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onNavigate() }}
      aria-label={`${author.name} — ${name}`}
    >
      {/* Inner mat border overlay */}
      <div
        className="absolute inset-[5px] rounded-[7px] pointer-events-none z-10"
        style={{ border: '1px solid color-mix(in srgb, var(--trad-color-active) 22%, transparent)' }}
      />

      {/* Corner ornaments */}
      <span className="absolute top-[9px] left-[9px] z-20 select-none text-[8px]"
            style={{ color: 'var(--trad-color-active)', opacity: 0.45 }}>✦</span>
      <span className="absolute top-[9px] right-[9px] z-20 select-none text-[8px]"
            style={{ color: 'var(--trad-color-active)', opacity: 0.45 }}>✦</span>
      <span className="absolute bottom-[9px] left-[9px] z-20 select-none text-[8px]"
            style={{ color: 'var(--trad-color-active)', opacity: 0.45 }}>✦</span>
      <span className="absolute bottom-[9px] right-[9px] z-20 select-none text-[8px]"
            style={{ color: 'var(--trad-color-active)', opacity: 0.45 }}>✦</span>

      {/* ── Banner zone — philosopher name + tradition icon ── */}
      <div
        className="px-5 pt-4 pb-3 flex items-start justify-between gap-3"
        style={{ background: 'color-mix(in srgb, var(--trad-color-active) 22%, var(--trad-surface-active))' }}
      >
        <h3 className="font-display text-xl sm:text-2xl text-fg leading-tight">
          {author.name}
        </h3>
        <span
          className="text-2xl sm:text-3xl leading-none shrink-0 mt-0.5"
          style={{ color: 'var(--trad-color-active)', opacity: 0.8 }}
        >
          {icon}
        </span>
      </div>

      {/* Zone divider */}
      <div className="h-px" style={{ background: 'color-mix(in srgb, var(--trad-color-active) 30%, transparent)' }} />

      {/* ── Art zone — large tradition sigil on radial spotlight ── */}
      <div
        className="flex items-center justify-center py-8 sm:py-10"
        style={{
          background: `radial-gradient(ellipse at center,
            color-mix(in srgb, var(--trad-color-active) 16%, var(--trad-surface-active)) 0%,
            color-mix(in srgb, var(--trad-color-active) 5%, var(--trad-surface-active)) 70%)`,
        }}
      >
        <span
          className="select-none leading-none"
          style={{
            fontSize:  '80px',
            color:     'color-mix(in srgb, var(--trad-color-active) 28%, transparent)',
          }}
        >
          {icon}
        </span>
      </div>

      {/* Zone divider */}
      <div className="h-px" style={{ background: 'color-mix(in srgb, var(--trad-color-active) 30%, transparent)' }} />

      {/* ── Type line — tradition + dates ── */}
      <div
        className="px-5 py-2 flex items-center justify-between gap-2"
        style={{ background: 'color-mix(in srgb, var(--trad-color-active) 14%, var(--trad-surface-active))' }}
      >
        <span
          className="font-display text-[9px] tracking-[0.22em] uppercase"
          style={{ color: 'var(--trad-color-active)' }}
        >
          {icon} {name}
        </span>
        <span className="font-sans text-[9px] text-fg-subtle whitespace-nowrap">
          {dateLabel(author.born, author.died)}
        </span>
      </div>

      {/* Zone divider */}
      <div className="h-px" style={{ background: 'color-mix(in srgb, var(--trad-color-active) 20%, transparent)' }} />

      {/* ── Flavor text zone — bio excerpt ── */}
      <div
        className="px-5 py-3"
        style={{ background: 'var(--trad-surface-active)' }}
      >
        {author.bio ? (
          <p className="font-serif text-[11px] sm:text-xs text-fg-muted leading-relaxed italic line-clamp-3">
            {author.bio}
          </p>
        ) : (
          <p className="font-serif text-[11px] text-fg-dim leading-relaxed italic text-center tracking-wide">
            — {name} —
          </p>
        )}
      </div>

      {/* Mobile year — shown at bottom, below flavor text */}
      <div
        className="sm:hidden px-5 py-2 flex items-center justify-end"
        style={{ background: 'color-mix(in srgb, var(--trad-color-active) 8%, var(--trad-surface-active))' }}
      >
        <span className="font-display text-[9px] tracking-widest text-fg-dim">
          {fmtYear(entry.sortY)}
        </span>
      </div>
    </div>
  )
}

// ── Era section header ────────────────────────────────────────────────────────

interface EraHeaderProps {
  label:   string
  range:   string
  tradIds: number[]
  count:   number
}

function EraHeader({ label, range, tradIds, count }: EraHeaderProps) {
  return (
    <div className="flex items-center gap-3 my-10 sm:my-14" aria-label={`${label} era — ${range}`}>
      <div
        className="flex-1 h-px"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}
      />

      <div className="flex flex-col items-center gap-1 shrink-0 px-3 text-center">
        {/* Tradition sigils present in this era */}
        <div
          className="flex gap-1.5 text-[12px]"
          style={{ color: 'var(--color-fg-subtle)', opacity: 0.55 }}
        >
          {tradIds.slice(0, 8).map(tid => (
            <span key={tid} title={TRADITION_NAME[tid]}>
              {TRADITION_ICON[tid]}
            </span>
          ))}
        </div>

        <span className="font-display text-[11px] tracking-[0.38em] uppercase text-fg-muted mt-0.5">
          {label}
        </span>
        <span className="font-sans text-[9px] text-fg-subtle">{range}</span>
        <span className="font-display text-[8px] tracking-[0.1em] text-fg-dim mt-0.5">
          {count} {count === 1 ? 'philosopher' : 'philosophers'}
        </span>
      </div>

      <div
        className="flex-1 h-px"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }}
      />
    </div>
  )
}

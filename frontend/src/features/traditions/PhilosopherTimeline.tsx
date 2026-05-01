// src/features/traditions/PhilosopherTimeline.tsx

import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../../services/api/api'
import type { Author } from '../../types/quote'
import {
  ICON_COLOR,
  ICON_COLOR_DARK,
  TRADITION_SLUG,
  TRADITION_NAME,
  TRADITION_ICON,
} from './constants'
import { useIsDark } from '../../hooks/useIsDark'

// ── Date parsing ──────────────────────────────────────────────────────────────

function parseYear(s: string | undefined): number | null {
  if (!s) return null
  const t = s.trim().toLowerCase()
  if (t === 'unknown' || t === '') return null

  // "6th century BCE" / "c. 1st century ce"
  const centuryMatch = t.match(/(\d+)(?:st|nd|rd|th)\s+century\s*(bce?|bc|ad|ce)?/)
  if (centuryMatch) {
    const n   = parseInt(centuryMatch[1])
    const era = centuryMatch[2] ?? 'ce'
    const mid = (n - 1) * 100 + 50
    return era.startsWith('b') ? -mid : mid
  }

  // Strip "c. " prefix
  const clean = t.replace(/^c\.\s*/, '').trim()

  // Match number + optional era keyword
  const m = clean.match(/^(\d+)\s*(bce?|bc|ad|ce)?$/)
  if (!m) return null

  const year = parseInt(m[1])
  const era  = m[2] ?? ''
  if (era === 'bc' || era === 'bce') return -year
  return year  // "ad", "ce", or bare modern year — all positive
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

// ── SVG layout constants ──────────────────────────────────────────────────────

const T_START = -2650   // just before oldest philosopher (~2400 BCE)
const T_END   = 2040
const SVG_W   = 2200
const L_PAD   = 160     // left column for tradition labels
const R_PAD   = 30
const PLOT_W  = SVG_W - L_PAD - R_PAD
const ROW_H   = 72
const BAR_H   = 10
const BAR_CY  = 36      // bar vertical center within row
const AXIS_H  = 44
const ERA_H   = 20      // era-label strip above rows

function toX(year: number): number {
  return L_PAD + ((year - T_START) / (T_END - T_START)) * PLOT_W
}

const ERAS = [
  { label: 'Ancient',     start: -2650, end:  -500 },
  { label: 'Classical',   start:  -500, end:   500 },
  { label: 'Medieval',    start:   500, end:  1400 },
  { label: 'Renaissance', start:  1400, end:  1800 },
  { label: 'Modern',      start:  1800, end:  2040 },
]

const ERA_FILL_LIGHT = [
  'rgba(180,140,60,0.08)',
  'rgba(80,120,200,0.08)',
  'rgba(140,80,180,0.08)',
  'rgba(60,160,80,0.08)',
  'rgba(180,90,50,0.08)',
]
const ERA_FILL_DARK = [
  'rgba(200,160,80,0.055)',
  'rgba(100,150,250,0.055)',
  'rgba(180,100,230,0.055)',
  'rgba(80,200,100,0.055)',
  'rgba(240,130,70,0.055)',
]

const AXIS_TICKS = [-2500, -2000, -1500, -1000, -500, 0, 500, 1000, 1500, 2000]

// Roughly chronological by tradition origin
const TRAD_ORDER = [15, 7, 6, 12, 11, 8, 1, 2, 3, 4, 5, 13, 9, 10, 14]

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhiloNode {
  author:   Author
  bornY:    number | null
  diedY:    number | null
  color:    string
}

interface TooltipState {
  author:   Author
  tradName: string
  x:        number
  y:        number
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PhilosopherTimeline = () => {
  const [authors,    setAuthors]    = useState<Author[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(false)
  const [tooltip,    setTooltip]    = useState<TooltipState | null>(null)
  const [activeTrad, setActiveTrad] = useState<number | null>(null)
  const navigate = useNavigate()
  const isDark   = useIsDark()

  useEffect(() => {
    apiClient.get('/api/authors')
      .then(r => setAuthors(r.data.authors ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const byTradition = useMemo(() => {
    const map = new Map<number, PhiloNode[]>()
    for (const a of authors) {
      const tid = a.tradition_id
      if (!tid) continue
      const bornY = parseYear(a.born)
      const diedY = parseYear(a.died)
      if (bornY === null && diedY === null) continue   // no usable date — skip
      const slug  = TRADITION_SLUG[tid] ?? ''
      const color = (isDark ? ICON_COLOR_DARK : ICON_COLOR)[slug] ?? '#888888'
      if (!map.has(tid)) map.set(tid, [])
      map.get(tid)!.push({ author: a, bornY, diedY, color })
    }
    for (const nodes of map.values()) {
      nodes.sort((a, b) => (a.bornY ?? a.diedY ?? 0) - (b.bornY ?? b.diedY ?? 0))
    }
    return map
  }, [authors, isDark])

  const rows     = TRAD_ORDER.filter(id => byTradition.has(id))
  const svgH     = ERA_H + rows.length * ROW_H + AXIS_H
  const eraFills = isDark ? ERA_FILL_DARK : ERA_FILL_LIGHT

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">

      {/* ── Page header ── */}
      <header className="text-center mb-10 max-w-2xl mx-auto">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent dark:text-[#d4a853] mb-2">
          Traditions
        </p>
        <h1 className="font-display text-3xl text-primary-800 dark:text-[#e8e0cc] mb-3 title-glow-hover">
          Philosopher Timeline
        </h1>
        <p className="font-sans text-sm text-primary-600 dark:text-night-400 leading-relaxed">
          2,600 years of thought — when each philosopher lived, tradition by tradition.
          <span className="hidden sm:inline"> Hover to preview. Click to visit their page.</span>
        </p>
        <div className="mt-4">
          <Link
            to="/traditions"
            className="font-display text-[9px] tracking-[0.2em] uppercase text-accent dark:text-[#d4a853] hover:underline"
          >
            ← Back to Traditions
          </Link>
        </div>
      </header>

      {/* ── Tradition filter legend ── */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
          {rows.map(tid => {
            const slug    = TRADITION_SLUG[tid] ?? ''
            const color   = (isDark ? ICON_COLOR_DARK : ICON_COLOR)[slug] ?? '#888'
            const active  = activeTrad === null || activeTrad === tid
            return (
              <button
                key={tid}
                onClick={() => setActiveTrad(prev => prev === tid ? null : tid)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full font-display tracking-wider transition-all duration-150"
                style={{
                  fontSize:   10,
                  background: active ? `${color}22` : 'transparent',
                  border:     `1px solid ${color}${active ? '55' : '1a'}`,
                  color:      active
                    ? color
                    : isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
                }}
              >
                <span style={{ fontSize: 11 }}>{TRADITION_ICON[tid]}</span>
                {TRADITION_NAME[tid]}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Loading spinner ── */}
      {loading && (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <p className="font-sans text-sm text-primary-400 dark:text-night-500 text-center py-16">
          Could not load philosophers. Is the backend running?
        </p>
      )}

      {/* ── Empty ── */}
      {!loading && !error && rows.length === 0 && (
        <p className="font-sans text-sm text-primary-400 dark:text-night-500 text-center py-16">
          No philosopher date data available.
        </p>
      )}

      {/* ── Timeline ── */}
      {!loading && !error && rows.length > 0 && (
        <div>
          <p className="text-center font-sans text-[10px] text-primary-400 dark:text-night-600 mb-3 xl:hidden">
            ← Scroll to explore →
          </p>

          <div
            className="overflow-x-auto rounded-card border
                       border-primary-200/40 dark:border-[rgba(255,255,255,0.06)]
                       bg-surface-card dark:bg-[rgba(8,16,38,0.75)]
                       shadow-card"
          >
            <svg
              width={SVG_W}
              height={svgH}
              style={{ display: 'block' }}
            >
              {/* ── Era background bands ── */}
              {ERAS.map((era, i) => (
                <rect
                  key={era.label}
                  x={toX(era.start)}
                  y={ERA_H}
                  width={toX(era.end) - toX(era.start)}
                  height={rows.length * ROW_H}
                  fill={eraFills[i]}
                />
              ))}

              {/* ── Era labels ── */}
              {ERAS.map(era => (
                <text
                  key={era.label}
                  x={(toX(era.start) + toX(era.end)) / 2}
                  y={ERA_H - 5}
                  textAnchor="middle"
                  fontSize={7.5}
                  fill={isDark ? 'rgba(255,255,255,0.17)' : 'rgba(0,0,0,0.16)'}
                  fontFamily="Cinzel, Georgia, serif"
                  letterSpacing="0.14em"
                >
                  {era.label.toUpperCase()}
                </text>
              ))}

              {/* ── Vertical grid lines at axis ticks ── */}
              {AXIS_TICKS.map(year => (
                <line
                  key={year}
                  x1={toX(year)} y1={ERA_H}
                  x2={toX(year)} y2={ERA_H + rows.length * ROW_H}
                  stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth={1}
                />
              ))}

              {/* ── BCE / CE boundary ── */}
              <line
                x1={toX(0)} y1={ERA_H}
                x2={toX(0)} y2={ERA_H + rows.length * ROW_H}
                stroke={isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)'}
                strokeWidth={1}
              />

              {/* ── Tradition rows ── */}
              {rows.map((tradId, rowIdx) => {
                const nodes    = byTradition.get(tradId)!
                const slug     = TRADITION_SLUG[tradId] ?? ''
                const rowColor = (isDark ? ICON_COLOR_DARK : ICON_COLOR)[slug] ?? '#888'
                const icon     = TRADITION_ICON[tradId] ?? ''
                const name     = TRADITION_NAME[tradId] ?? ''
                const rowY     = ERA_H + rowIdx * ROW_H
                const fade     = activeTrad !== null && activeTrad !== tradId

                return (
                  <g key={tradId} opacity={fade ? 0.15 : 1} style={{ transition: 'opacity 0.2s' }}>

                    {/* Row separator */}
                    <line
                      x1={0} y1={rowY}
                      x2={SVG_W} y2={rowY}
                      stroke={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}
                      strokeWidth={1}
                    />

                    {/* Tradition icon + name label */}
                    <text
                      x={8}
                      y={rowY + 15}
                      fontSize={12}
                      fill={rowColor}
                      fontFamily="Cinzel, Georgia, serif"
                    >
                      {icon}
                    </text>
                    <text
                      x={26}
                      y={rowY + 15}
                      fontSize={7}
                      fill={isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.38)'}
                      fontFamily="Cinzel, Georgia, serif"
                      letterSpacing="0.08em"
                    >
                      {name.toUpperCase()}
                    </text>

                    {/* Philosopher bars */}
                    {nodes.map((node, nIdx) => {
                      const born   = node.bornY
                      const died   = node.diedY
                      const hasBar = born !== null && died !== null
                      const ptX    = toX(born ?? died!)
                      const barX   = hasBar ? toX(born!) : ptX
                      const barW   = hasBar ? Math.max(toX(died!) - toX(born!), 8) : 0
                      const barCY  = rowY + BAR_CY

                      // Alternate label above / below to reduce name collisions
                      const above  = nIdx % 2 === 0
                      const labelX = hasBar ? barX + barW / 2 : ptX
                      const labelY = above
                        ? barCY - BAR_H / 2 - 6
                        : barCY + BAR_H / 2 + 12

                      return (
                        <g
                          key={node.author.id}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={e => setTooltip({
                            author: node.author,
                            tradName: name,
                            x: e.clientX,
                            y: e.clientY,
                          })}
                          onMouseMove={e => setTooltip(prev =>
                            prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                          )}
                          onMouseLeave={() => setTooltip(null)}
                          onClick={() => navigate(`/authors/${node.author.slug}`)}
                        >
                          {hasBar ? (
                            <>
                              <rect
                                x={barX}
                                y={barCY - BAR_H / 2}
                                width={barW}
                                height={BAR_H}
                                rx={BAR_H / 2}
                                fill={rowColor}
                                opacity={0.78}
                              />
                              {/* Invisible enlarged hit area */}
                              <rect
                                x={barX - 3}
                                y={barCY - 14}
                                width={barW + 6}
                                height={28}
                                fill="transparent"
                              />
                            </>
                          ) : (
                            <>
                              <circle
                                cx={ptX}
                                cy={barCY}
                                r={5}
                                fill={rowColor}
                                opacity={0.72}
                                stroke={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.9)'}
                                strokeWidth={1.5}
                              />
                              <circle cx={ptX} cy={barCY} r={14} fill="transparent" />
                            </>
                          )}

                          {/* Philosopher name */}
                          <text
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            fontSize={7.5}
                            fill={isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.52)'}
                            fontFamily="Cinzel, Georgia, serif"
                            letterSpacing="0.03em"
                          >
                            {node.author.name}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                )
              })}

              {/* ── Time axis ── */}
              <g transform={`translate(0, ${ERA_H + rows.length * ROW_H})`}>
                <line
                  x1={L_PAD}
                  y1={0}
                  x2={SVG_W - R_PAD}
                  y2={0}
                  stroke={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                  strokeWidth={1}
                />
                {AXIS_TICKS.map(year => (
                  <g key={year}>
                    <line
                      x1={toX(year)} y1={0}
                      x2={toX(year)} y2={7}
                      stroke={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)'}
                      strokeWidth={1}
                    />
                    <text
                      x={toX(year)}
                      y={22}
                      textAnchor="middle"
                      fontSize={9}
                      fill={isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'}
                      fontFamily="Cinzel, Georgia, serif"
                      letterSpacing="0.04em"
                    >
                      {fmtYear(year)}
                    </text>
                  </g>
                ))}

                {/* Label for 0 CE / 1 CE boundary */}
                <text
                  x={toX(0) + 6}
                  y={22}
                  textAnchor="start"
                  fontSize={7.5}
                  fill={isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.2)'}
                  fontFamily="Cinzel, Georgia, serif"
                  letterSpacing="0.06em"
                >
                  CE →
                </text>
              </g>
            </svg>
          </div>

          <p className="text-center font-sans text-[10px] text-primary-400 dark:text-night-600 mt-3">
            Bars show lifespan. Dots mark a single known date. Approximate dates prefixed "c." in source data.
          </p>
        </div>
      )}

      {/* ── Floating tooltip ── */}
      {tooltip && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: Math.max(8, Math.min(tooltip.x + 18, window.innerWidth - 260)),
            top:  Math.max(tooltip.y - 80, 8),
          }}
        >
          <div
            className="rounded-card border shadow-lg px-4 py-3 min-w-[160px] max-w-[240px]
                       bg-surface-card border-primary-200/70
                       dark:bg-[rgba(8,16,40,0.96)] dark:border-[rgba(255,255,255,0.13)]"
            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            <p className="font-display text-[13px] tracking-wide text-primary-800 dark:text-[#e0ddd4] leading-snug">
              {tooltip.author.name}
            </p>
            <p className="font-sans text-[10px] text-primary-500 dark:text-night-400 mt-1">
              {dateLabel(tooltip.author.born, tooltip.author.died)}
            </p>
            <p
              className="font-display text-[9px] tracking-[0.12em] uppercase mt-2"
              style={{
                color: (isDark ? ICON_COLOR_DARK : ICON_COLOR)[
                  TRADITION_SLUG[tooltip.author.tradition_id ?? 0] ?? ''
                ] ?? '#888',
              }}
            >
              {TRADITION_ICON[tooltip.author.tradition_id ?? 0]}{' '}
              {tooltip.tradName}
            </p>
            <p className="font-sans text-[9px] text-primary-400 dark:text-night-600 mt-2 italic">
              Click to visit →
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

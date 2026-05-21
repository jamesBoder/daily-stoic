// src/features/reading-plans/ReadingPlanDetail.tsx

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { readingPlansApi } from '../../services/api/readingPlans'
import type { ReadingPlan, ReadingPlanEntry, ReadingPlanProgress, GatedPlanResponse } from '../../types/readingPlan'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../hooks/useAuth'
import { TRADITION_COLORS, TRADITION_DEFAULT_COLORS } from '../traditions/constants'

// ── Plan slug → tradition slug lookup ────────────────────────────────────────

const PLAN_TRAD_SLUG: Record<string, string> = {
  'stoic-virtues-30-days':       'stoicism',
  'hermetic-principles-49-days': 'hermeticism',
}

// ── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  isCurrentDay,
  isDone,
  isLocked,
}: {
  entry: ReadingPlanEntry
  isCurrentDay: boolean
  isDone: boolean
  isLocked: boolean
}) {
  const [open, setOpen] = useState(isCurrentDay)
  const cardRef = useRef<HTMLDivElement>(null)

  // Auto-scroll current day into view before paint to avoid jank on long lists
  useLayoutEffect(() => {
    if (isCurrentDay && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isCurrentDay])

  if (isDone) {
    return (
      <div className="flex items-center gap-3 py-2.5 px-1">
        <div
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
          style={{
            background: 'color-mix(in srgb, var(--trad-color-active) 15%, transparent)',
            color:      'var(--trad-color-active)',
          }}
        >
          ✓
        </div>
        <p className="font-sans text-xs text-fg-muted line-through">
          Day {entry.day_number} · {entry.title}
        </p>
      </div>
    )
  }

  return (
    <div
      ref={isCurrentDay ? cardRef : undefined}
      className={`rounded-xl overflow-hidden transition-all duration-200 ${
        isCurrentDay
          ? 'border shadow-sm'
          : isLocked
          ? 'opacity-40 pointer-events-none'
          : 'border border-border'
      }`}
      style={isCurrentDay ? {
        borderColor: 'color-mix(in srgb, var(--trad-color-active) 38%, transparent)',
        boxShadow:   '0 0 0 1px color-mix(in srgb, var(--trad-color-active) 15%, transparent), 0 2px 12px color-mix(in srgb, var(--trad-color-active) 9%, transparent)',
      } : undefined}
    >
      {/* Header button */}
      <button
        onClick={() => !isLocked && setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left bg-surface-card active:bg-surface-hi transition-colors touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Day number bubble */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-all"
          style={isCurrentDay ? {
            background: 'var(--trad-color-active)',
            color:      'var(--color-accent-text)',
          } : {
            background: 'color-mix(in srgb, var(--trad-color-active) 8%, transparent)',
            color:      'var(--trad-color-active)',
          }}
        >
          {entry.day_number}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-display text-sm leading-snug ${
            isCurrentDay ? 'text-fg' : 'text-fg'
          }`}>
            {entry.title}
          </p>
          {entry.quote?.author && (
            <p className="font-sans text-[11px] text-fg-subtle mt-0.5 truncate">
              {entry.quote.author.name}
            </p>
          )}
        </div>

        {!isLocked && (
          <span
            className="flex-shrink-0 text-base transition-transform duration-200"
            style={{
              color:     'var(--trad-color-active)',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ›
          </span>
        )}
      </button>

      {/* Expanded content */}
      {open && !isLocked && (
        <div className="bg-surface-card border-t border-border-subtle px-4 pb-5 pt-4">
          {entry.intro_text && (
            <p className="font-sans text-sm text-fg-muted leading-relaxed mb-4">
              {entry.intro_text}
            </p>
          )}

          {entry.quote && (
            <div className="relative pl-4">
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                style={{ background: 'var(--trad-color-active)', opacity: 0.6 }}
              />

              <blockquote className="font-serif text-base leading-relaxed text-fg italic mb-3">
                "{entry.quote.text}"
              </blockquote>

              <footer className="flex items-center gap-2 flex-wrap">
                {entry.quote.author && (
                  <Link
                    to={`/authors/${entry.quote.author.slug}`}
                    className="font-display text-[10px] tracking-[0.15em] uppercase"
                    style={{ color: 'var(--trad-color-active)' }}
                  >
                    {entry.quote.author.name}
                  </Link>
                )}
                {entry.quote.source && (
                  <span className="font-sans text-[10px] italic text-fg-subtle">
                    · {entry.quote.source}
                  </span>
                )}
              </footer>

              {entry.quote.context_full && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p
                    className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                    style={{ color: 'var(--trad-color-active)' }}
                  >
                    Commentary
                  </p>
                  <p className="font-sans text-sm text-fg-muted leading-relaxed">
                    {entry.quote.context_full}
                  </p>
                </div>
              )}

              {entry.quote.reflection_prompt && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p
                    className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                    style={{ color: 'var(--trad-color-active)', opacity: 0.7 }}
                  >
                    Practice
                  </p>
                  <p
                    className="font-sans text-sm leading-relaxed italic rounded-lg px-3 py-2.5 text-fg"
                    style={{
                      background: 'color-mix(in srgb, var(--trad-color-active) 7%, transparent)',
                      border:     '1px solid color-mix(in srgb, var(--trad-color-active) 19%, transparent)',
                    }}
                  >
                    {entry.quote.reflection_prompt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ currentDay, totalDays }: { currentDay: number; totalDays: number }) {
  const pct = Math.round((currentDay / totalDays) * 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-sans text-xs text-fg-muted">
          Day {currentDay} of {totalDays}
        </span>
        <span className="font-sans text-xs font-medium" style={{ color: 'var(--trad-color-active)' }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-hi overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: 'var(--trad-color-active)' }}
        />
      </div>
    </div>
  )
}

// ── Sticky bottom CTA (mobile) ────────────────────────────────────────────────

function StickyProgressBar({
  currentDay,
  totalDays,
  tradColors,
  onAdvance,
  advancing,
  isCompleted,
}: {
  currentDay:  number
  totalDays:   number
  tradColors:  { light: string; dark: string }
  onAdvance:   () => void
  advancing:   boolean
  isCompleted: boolean
}) {
  if (isCompleted) return null
  const pct = Math.round((currentDay / totalDays) * 100)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] pt-3 bg-surface-base/90 dark:bg-[var(--color-surface-modal)] backdrop-blur-md border-t border-border"
      style={{
        '--trad-color':    tradColors.light,
        '--trad-color-dk': tradColors.dark,
      } as React.CSSProperties}
    >
      {/* Thin progress track */}
      <div className="h-0.5 rounded-full bg-surface-hi overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'var(--trad-color-active)' }}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-fg-muted shrink-0">
          Day {currentDay}/{totalDays}
        </span>
        <button
          onClick={onAdvance}
          disabled={advancing}
          className="flex-1 font-sans text-sm font-medium py-3 rounded-full transition-opacity disabled:opacity-50 active:scale-[0.98] text-accent-text"
          style={{ background: 'var(--trad-color-active)' }}
        >
          {advancing ? 'Saving…' : `Complete Day ${currentDay} →`}
        </button>
      </div>
    </div>
  )
}

// ── Day group label (e.g. "Days 1–7: Wisdom") ────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <div className="h-px flex-1 bg-border" />
      <span
        className="font-display text-[9px] tracking-[0.2em] uppercase px-1"
        style={{ color: 'var(--trad-color-active)' }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupLabelFor(planSlug: string, dayNumber: number): string | null {
  if (planSlug === 'stoic-virtues-30-days') {
    if (dayNumber === 1)  return 'Foundation'
    if (dayNumber === 8)  return 'Wisdom'
    if (dayNumber === 15) return 'Courage'
    if (dayNumber === 22) return 'Justice'
    if (dayNumber === 29) return 'Temperance'
  }
  if (planSlug === 'hermetic-principles-49-days') {
    if (dayNumber === 1)  return 'I. Mentalism'
    if (dayNumber === 8)  return 'II. Correspondence'
    if (dayNumber === 15) return 'III. Vibration'
    if (dayNumber === 22) return 'IV. Polarity'
    if (dayNumber === 29) return 'V. Rhythm'
    if (dayNumber === 36) return 'VI. Cause & Effect'
    if (dayNumber === 43) return 'VII. Gender'
  }
  return null
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReadingPlanDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { isPremium } = useSubscription()
  const { user } = useAuth()

  const tradSlug  = PLAN_TRAD_SLUG[slug ?? ''] ?? 'stoicism'
  const colors    = TRADITION_COLORS[tradSlug] ?? TRADITION_DEFAULT_COLORS
  const planStyle = {
    '--trad-color':    colors.light,
    '--trad-color-dk': colors.dark,
  } as React.CSSProperties

  const [plan, setPlan] = useState<ReadingPlan | null>(null)
  const [gated, setGated] = useState<GatedPlanResponse | null>(null)
  const [progress, setProgress] = useState<ReadingPlanProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const load = useCallback(async () => {
    if (!slug) return
    try {
      const res = await readingPlansApi.get(slug)
      if ('gated' in res) {
        setGated(res)
      } else {
        setPlan(res.reading_plan)
      }
      if (user) {
        const prog = await readingPlansApi.getProgress(slug)
        setProgress(prog.progress)
      }
    } finally {
      setLoading(false)
    }
  }, [slug, user])

  useEffect(() => { load() }, [load])

  // Persist the active plan so the home page can show a "Resume" CTA
  useEffect(() => {
    if (!slug || !plan || !progress?.is_active) return
    try {
      localStorage.setItem('rp-resume', JSON.stringify({
        slug,
        title: plan.title,
        currentDay: progress.current_day,
        totalDays: plan.duration_days,
      }))
    } catch { /* ignore quota errors */ }
  }, [slug, plan, progress])

  const handleStart = async () => {
    if (!slug) return
    setStarting(true)
    try {
      const res = await readingPlansApi.start(slug)
      setProgress(res.progress)
    } finally {
      setStarting(false)
    }
  }

  const handleAdvance = async () => {
    if (!slug) return
    setAdvancing(true)
    try {
      const res = await readingPlansApi.advance(slug)
      setProgress(res.progress)
    } finally {
      setAdvancing(false)
    }
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
        <div className="max-w-lg mx-auto space-y-3 animate-pulse">
          <div className="h-6 w-24 rounded bg-surface-hi" />
          <div className="h-8 w-3/4 rounded bg-surface-hi" />
          <div className="h-4 rounded bg-surface-hi" />
          <div className="h-4 w-2/3 rounded bg-surface-hi" />
          {[1,2,3,4].map(i => (
            <div key={i} className="h-14 rounded-xl bg-surface" />
          ))}
        </div>
      </main>
    )
  }

  // ── Gated view ──────────────────────────────────────────────────────────────
  if (gated) {
    return (
      <main className="min-h-screen bg-surface-base page-utility px-4 py-12" style={planStyle}>
        <div className="max-w-lg mx-auto">
          <Link
            to="/reading-plans"
            className="inline-flex items-center gap-1 font-sans text-xs text-fg-subtle hover:text-accent mb-10"
          >
            ← Reading Plans
          </Link>
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{
                background: 'color-mix(in srgb, var(--trad-color-active) 12%, transparent)',
                color:      'var(--trad-color-active)',
              }}
            >
              ✦
            </div>
            <p
              className="font-display text-[10px] tracking-[0.25em] uppercase mb-3"
              style={{ color: 'var(--trad-color-active)' }}
            >
              Practitioner
            </p>
            <h1 className="font-display text-2xl text-fg mb-4 px-4">
              {gated.reading_plan.title}
            </h1>
            <p className="font-sans text-sm text-fg-muted max-w-xs mx-auto leading-relaxed mb-8">
              {gated.reading_plan.description}
            </p>
            <Link
              to="/upgrade"
              className="inline-block font-sans text-sm font-medium px-8 py-3.5 rounded-full transition-opacity active:scale-[0.97] text-accent-text"
              style={{ background: 'var(--trad-color-active)' }}
            >
              Unlock · Practitioner $14.99
            </Link>
            <p className="mt-3 font-sans text-xs text-fg-subtle">
              One-time · Lifetime access
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!plan) return null

  const entries = plan.entries ?? []
  const currentDay  = progress?.current_day ?? 0
  const isStarted   = !!progress
  const isCompleted = !!progress?.completed_at

  return (
    <>
      <main className="min-h-screen bg-surface-base page-utility px-4 pt-12 pb-32" style={planStyle}>
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            to="/reading-plans"
            className="inline-flex items-center gap-1 font-sans text-xs text-fg-subtle hover:text-accent mb-6"
          >
            ← Reading Plans
          </Link>

          {/* Plan header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {plan.tier === 'premium' && (
                <span
                  className="font-display text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                  style={{
                    color:      'var(--trad-color-active)',
                    background: 'color-mix(in srgb, var(--trad-color-active) 12%, transparent)',
                    border:     '1px solid color-mix(in srgb, var(--trad-color-active) 25%, transparent)',
                  }}
                >
                  Practitioner
                </span>
              )}
              {plan.tradition && (
                <span
                  className="font-display text-[9px] tracking-[0.2em] uppercase"
                  style={{ color: 'var(--trad-color-active)' }}
                >
                  {plan.tradition.name} · {plan.duration_days} days
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl text-fg mb-3 title-glow-hover">
              {plan.title}
            </h1>
            <p className="font-sans text-sm text-fg-muted leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Progress card (inline — visible when not started or completed) */}
          {!isStarted && (
            <div className="mb-8 rounded-2xl border border-border bg-surface-card p-5">
              {user ? (
                <div className="text-center">
                  <p className="font-sans text-sm text-fg-muted mb-4">
                    Begin your {plan.duration_days}-day journey.
                  </p>
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="font-sans text-sm font-medium px-8 py-3 rounded-full transition-opacity disabled:opacity-50 active:scale-[0.97] text-accent-text"
                    style={{ background: 'var(--trad-color-active)' }}
                  >
                    {starting ? 'Starting…' : 'Begin journey'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-sans text-sm text-fg-muted mb-3">
                    Sign in to track your progress.
                  </p>
                  <Link
                    to="/auth/login"
                    className="font-sans text-sm hover:underline"
                    style={{ color: 'var(--trad-color-active)' }}
                  >
                    Sign in →
                  </Link>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="mb-8 rounded-2xl border border-border bg-surface-card p-5 text-center">
              <div className="text-2xl mb-2">✦</div>
              <p className="font-display text-base text-fg">Journey complete</p>
              <p className="font-sans text-xs text-fg-subtle mt-1">
                All {plan.duration_days} days completed.
              </p>
            </div>
          )}

          {isStarted && !isCompleted && (
            <div className="mb-8">
              <ProgressBar currentDay={currentDay} totalDays={plan.duration_days} />
            </div>
          )}

          {/* Entry list with group labels */}
          <div>
            {entries.length === 0 ? (
              <p className="text-center font-sans text-sm text-fg-subtle py-12">
                No passages available yet.
              </p>
            ) : (
              entries.map(entry => {
                const label = groupLabelFor(plan.slug, entry.day_number)
                return (
                  <div key={entry.id}>
                    {label && <GroupLabel label={label} />}
                    <EntryCard
                      entry={entry}
                      isCurrentDay={isStarted && !isCompleted && entry.day_number === currentDay}
                      isDone={isStarted && entry.day_number < currentDay}
                      isLocked={!isStarted && entry.day_number > 1}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Sticky bottom bar — only when actively in progress */}
      {isStarted && !isCompleted && (
        <StickyProgressBar
          currentDay={currentDay}
          totalDays={plan.duration_days}
          tradColors={colors}
          onAdvance={handleAdvance}
          advancing={advancing}
          isCompleted={isCompleted}
        />
      )}
    </>
  )
}

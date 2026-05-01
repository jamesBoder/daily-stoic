// src/features/reading-plans/ReadingPlanDetail.tsx

import { useEffect, useLayoutEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { readingPlansApi } from '../../services/api/readingPlans'
import type { ReadingPlan, ReadingPlanEntry, ReadingPlanProgress, GatedPlanResponse } from '../../types/readingPlan'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAuth } from '../../hooks/useAuth'

// ── Per-plan accent ───────────────────────────────────────────────────────────

const PLAN_COLOR: Record<string, { color: string; bg: string }> = {
  'stoic-virtues-30-days':        { color: '#8b7355', bg: 'rgba(139,115,85,0.12)' },
  'hermetic-principles-49-days':  { color: '#7a4fb5', bg: 'rgba(122,79,181,0.12)' },
}
const DEFAULT_COLOR = PLAN_COLOR['stoic-virtues-30-days']

// ── Entry card ────────────────────────────────────────────────────────────────

function EntryCard({
  entry,
  isCurrentDay,
  isDone,
  isLocked,
  accentColor,
}: {
  entry: ReadingPlanEntry
  isCurrentDay: boolean
  isDone: boolean
  isLocked: boolean
  accentColor: string
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
          style={{ background: `${accentColor}25`, color: accentColor }}
        >
          ✓
        </div>
        <p className="font-sans text-xs text-primary-400 dark:text-night-400 line-through">
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
          : 'border border-primary-200 dark:border-[rgba(255,255,255,0.07)]'
      }`}
      style={isCurrentDay ? {
        borderColor: `${accentColor}60`,
        boxShadow: `0 0 0 1px ${accentColor}25, 0 2px 12px ${accentColor}18`,
      } : undefined}
    >
      {/* Header button */}
      <button
        onClick={() => !isLocked && setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left bg-surface-card active:bg-primary-100 transition-colors touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {/* Day number bubble */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-all"
          style={isCurrentDay ? {
            background: accentColor,
            color: '#fff',
          } : {
            background: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {entry.day_number}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`font-display text-sm leading-snug ${
            isCurrentDay ? 'text-primary-800 dark:text-[#e0ddd4]' : 'text-primary-700 dark:text-[#e0ddd4]'
          }`}>
            {entry.title}
          </p>
          {entry.quote?.author && (
            <p className="font-sans text-[11px] text-primary-400 dark:text-night-500 mt-0.5 truncate">
              {entry.quote.author.name}
            </p>
          )}
        </div>

        {!isLocked && (
          <span
            className="flex-shrink-0 text-base transition-transform duration-200"
            style={{
              color: accentColor,
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ›
          </span>
        )}
      </button>

      {/* Expanded content */}
      {open && !isLocked && (
        <div className="bg-surface-card border-t border-primary-100 dark:border-[rgba(255,255,255,0.06)] px-4 pb-5 pt-4">
          {entry.intro_text && (
            <p className="font-sans text-sm text-primary-500 dark:text-night-400 leading-relaxed mb-4">
              {entry.intro_text}
            </p>
          )}

          {entry.quote && (
            <div className="relative pl-4">
              {/* Left accent bar — PassageCard pattern */}
              <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
                style={{ background: accentColor, opacity: 0.6 }}
              />

              <blockquote className="font-serif text-base leading-relaxed text-primary-900 dark:text-[#ede8dc] italic mb-3">
                "{entry.quote.text}"
              </blockquote>

              <footer className="flex items-center gap-2 flex-wrap">
                {entry.quote.author && (
                  <Link
                    to={`/authors/${entry.quote.author.slug}`}
                    className="font-display text-[10px] tracking-[0.15em] uppercase"
                    style={{ color: accentColor }}
                  >
                    {entry.quote.author.name}
                  </Link>
                )}
                {entry.quote.source && (
                  <span className="font-sans text-[10px] italic text-primary-400 dark:text-night-500">
                    · {entry.quote.source}
                  </span>
                )}
              </footer>

              {entry.quote.context_full && (
                <div className="mt-4 pt-4 border-t border-primary-100 dark:border-[rgba(255,255,255,0.06)]">
                  <p
                    className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                    style={{ color: accentColor }}
                  >
                    Commentary
                  </p>
                  <p className="font-sans text-sm text-primary-600 dark:text-night-400 leading-relaxed">
                    {entry.quote.context_full}
                  </p>
                </div>
              )}

              {entry.quote.reflection_prompt && (
                <div className="mt-4 pt-4 border-t border-primary-100 dark:border-[rgba(255,255,255,0.06)]">
                  <p
                    className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                    style={{ color: accentColor, opacity: 0.7 }}
                  >
                    Practice
                  </p>
                  <p
                    className="font-sans text-sm leading-relaxed italic rounded-lg px-3 py-2.5"
                    style={{
                      color: '#4d4839',
                      background: `${accentColor}12`,
                      border: `1px solid ${accentColor}30`,
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

function ProgressBar({ currentDay, totalDays, accentColor }: { currentDay: number; totalDays: number; accentColor: string }) {
  const pct = Math.round((currentDay / totalDays) * 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-sans text-xs text-primary-500 dark:text-night-400">
          Day {currentDay} of {totalDays}
        </span>
        <span className="font-sans text-xs font-medium" style={{ color: accentColor }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-primary-100 dark:bg-night-800/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: accentColor }}
        />
      </div>
    </div>
  )
}

// ── Sticky bottom CTA (mobile) ────────────────────────────────────────────────

function StickyProgressBar({
  currentDay,
  totalDays,
  accentColor,
  onAdvance,
  advancing,
  isCompleted,
}: {
  currentDay: number
  totalDays: number
  accentColor: string
  onAdvance: () => void
  advancing: boolean
  isCompleted: boolean
}) {
  if (isCompleted) return null
  const pct = Math.round((currentDay / totalDays) * 100)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] pt-3 bg-surface-base/90 dark:bg-[rgba(4,8,22,0.92)] backdrop-blur-md border-t border-primary-200 dark:border-[rgba(255,255,255,0.07)]">
      {/* Thin progress track */}
      <div className="h-0.5 rounded-full bg-primary-200 dark:bg-night-700/50 overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: accentColor }}
        />
      </div>
      <div className="flex items-center gap-3">
        <span className="font-sans text-xs text-primary-500 dark:text-night-400 shrink-0">
          Day {currentDay}/{totalDays}
        </span>
        <button
          onClick={onAdvance}
          disabled={advancing}
          className="flex-1 font-sans text-sm font-medium py-3 rounded-full transition-opacity disabled:opacity-50 active:scale-[0.98]"
          style={{ background: accentColor, color: '#fff' }}
        >
          {advancing ? 'Saving…' : `Complete Day ${currentDay} →`}
        </button>
      </div>
    </div>
  )
}

// ── Day group label (e.g. "Days 1–7: Wisdom") ────────────────────────────────

function GroupLabel({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <div className="h-px flex-1 bg-primary-200 dark:bg-[rgba(255,255,255,0.07)]" />
      <span
        className="font-display text-[9px] tracking-[0.2em] uppercase px-1"
        style={{ color: accentColor }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-primary-200 dark:bg-[rgba(255,255,255,0.07)]" />
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns a group label for a given day in a plan, or null if no grouping applies.
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

  const { color: accentColor, bg: accentBg } = PLAN_COLOR[slug ?? ''] ?? DEFAULT_COLOR

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
          <div className="h-6 w-24 rounded bg-primary-200 dark:bg-night-700/50" />
          <div className="h-8 w-3/4 rounded bg-primary-200 dark:bg-night-700/50" />
          <div className="h-4 rounded bg-primary-200 dark:bg-night-700/50" />
          <div className="h-4 w-2/3 rounded bg-primary-200 dark:bg-night-700/50" />
          {[1,2,3,4].map(i => (
            <div key={i} className="h-14 rounded-xl bg-primary-100 dark:bg-night-800/40" />
          ))}
        </div>
      </main>
    )
  }

  // ── Gated view ──────────────────────────────────────────────────────────────
  if (gated) {
    return (
      <main className="min-h-screen bg-surface-base page-utility px-4 py-12">
        <div className="max-w-lg mx-auto">
          <Link
            to="/reading-plans"
            className="inline-flex items-center gap-1 font-sans text-xs text-primary-400 dark:text-night-500 hover:text-accent mb-10"
          >
            ← Reading Plans
          </Link>
          <div className="text-center py-12">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ background: accentBg, color: accentColor }}
            >
              ✦
            </div>
            <p
              className="font-display text-[10px] tracking-[0.25em] uppercase mb-3"
              style={{ color: accentColor }}
            >
              Practitioner
            </p>
            <h1 className="font-display text-2xl text-primary-800 dark:text-[#e0ddd4] mb-4 px-4">
              {gated.reading_plan.title}
            </h1>
            <p className="font-sans text-sm text-primary-500 dark:text-night-400 max-w-xs mx-auto leading-relaxed mb-8">
              {gated.reading_plan.description}
            </p>
            <Link
              to="/upgrade"
              className="inline-block font-sans text-sm font-medium px-8 py-3.5 rounded-full transition-opacity active:scale-[0.97]"
              style={{ background: accentColor, color: '#fff' }}
            >
              Unlock · Practitioner $14.99
            </Link>
            <p className="mt-3 font-sans text-xs text-primary-400 dark:text-night-500">
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
      <main className="min-h-screen bg-surface-base page-utility px-4 pt-12 pb-32">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            to="/reading-plans"
            className="inline-flex items-center gap-1 font-sans text-xs text-primary-400 dark:text-night-500 hover:text-accent mb-6"
          >
            ← Reading Plans
          </Link>

          {/* Plan header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {plan.tier === 'premium' && (
                <span
                  className="font-display text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded-full"
                  style={{ color: accentColor, background: accentBg, border: `1px solid ${accentColor}40` }}
                >
                  Practitioner
                </span>
              )}
              {plan.tradition && (
                <span
                  className="font-display text-[9px] tracking-[0.2em] uppercase"
                  style={{ color: accentColor }}
                >
                  {plan.tradition.name} · {plan.duration_days} days
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl text-primary-800 dark:text-[#e0ddd4] mb-3 title-glow-hover">
              {plan.title}
            </h1>
            <p className="font-sans text-sm text-primary-500 dark:text-night-400 leading-relaxed">
              {plan.description}
            </p>
          </div>

          {/* Progress card (inline — visible when not started or completed) */}
          {!isStarted && (
            <div className="mb-8 rounded-2xl border border-primary-200 dark:border-[rgba(255,255,255,0.07)] bg-surface-card p-5">
              {user ? (
                <div className="text-center">
                  <p className="font-sans text-sm text-primary-500 dark:text-night-400 mb-4">
                    Begin your {plan.duration_days}-day journey.
                  </p>
                  <button
                    onClick={handleStart}
                    disabled={starting}
                    className="font-sans text-sm font-medium px-8 py-3 rounded-full transition-opacity disabled:opacity-50 active:scale-[0.97]"
                    style={{ background: accentColor, color: '#fff' }}
                  >
                    {starting ? 'Starting…' : 'Begin journey'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="font-sans text-sm text-primary-500 dark:text-night-400 mb-3">
                    Sign in to track your progress.
                  </p>
                  <Link to="/auth/login" className="font-sans text-sm hover:underline" style={{ color: accentColor }}>
                    Sign in →
                  </Link>
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="mb-8 rounded-2xl border border-primary-200 dark:border-[rgba(255,255,255,0.07)] bg-surface-card p-5 text-center">
              <div className="text-2xl mb-2">✦</div>
              <p className="font-display text-base text-primary-700 dark:text-[#e0ddd4]">Journey complete</p>
              <p className="font-sans text-xs text-primary-400 dark:text-night-500 mt-1">
                All {plan.duration_days} days completed.
              </p>
            </div>
          )}

          {isStarted && !isCompleted && (
            <div className="mb-8">
              <ProgressBar currentDay={currentDay} totalDays={plan.duration_days} accentColor={accentColor} />
            </div>
          )}

          {/* Entry list with group labels */}
          <div>
            {entries.length === 0 ? (
              <p className="text-center font-sans text-sm text-primary-500 dark:text-night-500 py-12">
                No passages available yet.
              </p>
            ) : (
              entries.map(entry => {
                const label = groupLabelFor(plan.slug, entry.day_number)
                return (
                  <div key={entry.id}>
                    {label && <GroupLabel label={label} accentColor={accentColor} />}
                    <EntryCard
                      entry={entry}
                      isCurrentDay={isStarted && !isCompleted && entry.day_number === currentDay}
                      isDone={isStarted && entry.day_number < currentDay}
                      isLocked={!isStarted && entry.day_number > 1}
                      accentColor={accentColor}
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
          accentColor={accentColor}
          onAdvance={handleAdvance}
          advancing={advancing}
          isCompleted={isCompleted}
        />
      )}
    </>
  )
}

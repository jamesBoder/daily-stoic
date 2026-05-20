// src/features/reading-plans/ReadingPlanList.tsx

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { readingPlansApi } from '../../services/api/readingPlans'
import type { ReadingPlan } from '../../types/readingPlan'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { TRADITION_COLORS, TRADITION_DEFAULT_COLORS } from '../traditions/constants'

// ── Plan slug → tradition slug lookup ────────────────────────────────────────

const PLAN_TRAD_SLUG: Record<string, string> = {
  'stoic-virtues-30-days':       'stoicism',
  'hermetic-principles-49-days': 'hermeticism',
}

const PLAN_ICON: Record<string, string> = {
  'stoic-virtues-30-days':       '⊕',
  'hermetic-principles-49-days': '✦',
}

// ── Day pip strip ─────────────────────────────────────────────────────────────

function DurationPips({ days }: { days: number }) {
  const max = 12
  const count = Math.min(days, max)
  return (
    <div className="flex items-center gap-[3px] mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[3px] flex-1 rounded-full bg-primary-300 opacity-50"
        />
      ))}
      {days > max && (
        <span className="font-sans text-[10px] text-fg-subtle ml-1">···</span>
      )}
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({ plan, isPremium }: { plan: ReadingPlan; isPremium: boolean }) {
  const tradSlug = PLAN_TRAD_SLUG[plan.slug] ?? 'stoicism'
  const colors   = TRADITION_COLORS[tradSlug] ?? TRADITION_DEFAULT_COLORS
  const icon     = PLAN_ICON[plan.slug] ?? '✦'
  const isLocked = plan.tier === 'premium' && !isPremium

  return (
    <Link
      to={`/reading-plans/${plan.slug}`}
      className="group block relative overflow-hidden rounded-2xl border border-primary-200 dark:border-[var(--color-border)] bg-surface-card active:scale-[0.98] transition-transform duration-150 touch-manipulation"
      style={{
        WebkitTapHighlightColor: 'transparent',
        '--trad-color':    colors.light,
        '--trad-color-dk': colors.dark,
      } as React.CSSProperties}
    >
      {/* Atmospheric glow — adaptive, no longer always-dark */}
      <div
        className="pointer-events-none absolute -top-8 -left-8 w-40 h-40 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
        style={{ background: 'color-mix(in srgb, var(--trad-color-active) 12%, transparent)' }}
      />

      <div className="relative p-5">
        {/* Top row: icon + badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Icon circle */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl font-display transition-transform duration-300 group-hover:scale-110"
            style={{
              background: 'color-mix(in srgb, var(--trad-color-active) 12%, transparent)',
              color:      'var(--trad-color-active)',
            }}
          >
            {icon}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            {isLocked && (
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
            <span className="font-sans text-[10px] text-fg-subtle">
              {plan.duration_days} days
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display text-lg leading-snug text-primary-800 dark:text-fg mb-1.5 group-hover:text-accent transition-colors">
          {plan.title}
        </h2>

        {/* Tradition */}
        {plan.tradition && (
          <p
            className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
            style={{ color: 'var(--trad-color-active)' }}
          >
            {plan.tradition.name}
          </p>
        )}

        {/* Description */}
        <p className="font-sans text-sm text-fg-muted leading-relaxed line-clamp-2">
          {plan.description}
        </p>

        {/* Duration pips */}
        <DurationPips days={plan.duration_days} />

        {/* CTA row */}
        <div className="flex items-center justify-end mt-4">
          <span
            className="font-sans text-xs flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ color: 'var(--trad-color-active)' }}
          >
            {isLocked ? 'Preview' : 'Begin journey'} →
          </span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--trad-color-active) 50%, transparent), transparent)' }}
      />
    </Link>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PlanSkeleton() {
  return (
    <div className="rounded-2xl border border-primary-200 dark:border-[var(--color-border)] bg-surface-card p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-200 dark:bg-surface-hi" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-20 rounded bg-primary-200 dark:bg-surface-hi" />
          <div className="h-5 w-3/4 rounded bg-primary-200 dark:bg-surface-hi" />
        </div>
      </div>
      <div className="h-3 rounded bg-primary-200 dark:bg-surface-hi" />
      <div className="h-3 w-2/3 rounded bg-primary-200 dark:bg-surface-hi" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ReadingPlanList() {
  const [plans, setPlans] = useState<ReadingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const { isPremium } = useSubscription()

  useEffect(() => {
    readingPlansApi.list()
      .then(r => setPlans(r.reading_plans))
      .finally(() => setLoading(false))
  }, [])

  const freePlans    = plans.filter(p => p.tier === 'free')
  const premiumPlans = plans.filter(p => p.tier === 'premium')

  return (
    <main className="min-h-screen bg-surface-base page-utility">
      {/* Hero */}
      <div className="px-5 pt-14 pb-10 text-center">
        <p className="font-display text-[10px] tracking-[0.3em] uppercase text-accent mb-3">
          Curated Journeys
        </p>
        <h1 className="font-display text-3xl text-primary-800 dark:text-fg-muted mb-4 title-glow-hover">
          Reading Plans
        </h1>
        <p className="font-sans text-sm text-fg-muted max-w-xs mx-auto leading-relaxed">
          Multi-week immersions through the great wisdom traditions, one passage at a time.
        </p>
      </div>

      <div className="px-4 pb-20 max-w-lg mx-auto space-y-8">
        {/* Free plans */}
        {(loading || freePlans.length > 0) && (
          <section>
            <SectionLabel label="Free Plans" />
            <div className="space-y-3">
              {loading
                ? <><PlanSkeleton /><PlanSkeleton /></>
                : freePlans.map(p => <PlanCard key={p.id} plan={p} isPremium={isPremium} />)
              }
            </div>
          </section>
        )}

        {/* Premium plans */}
        {(loading || premiumPlans.length > 0) && (
          <section>
            <SectionLabel label="Practitioner Plans" />
            <div className="space-y-3">
              {loading
                ? <PlanSkeleton />
                : premiumPlans.map(p => <PlanCard key={p.id} plan={p} isPremium={isPremium} />)
              }
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-px flex-1 bg-primary-200 dark:bg-[var(--color-border)]" />
      <span className="font-display text-[9px] tracking-[0.25em] uppercase text-fg-subtle">
        {label}
      </span>
      <div className="h-px flex-1 bg-primary-200 dark:bg-[var(--color-border)]" />
    </div>
  )
}

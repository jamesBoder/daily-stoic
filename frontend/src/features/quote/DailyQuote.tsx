// src/features/quote/DailyQuote.tsx

import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QuoteCardSkeleton } from './QuoteCardSkeleton'

const QuoteCard = lazy(() => import('./QuoteCard').then(m => ({ default: m.QuoteCard })))
import { useDailyQuote } from '../../hooks/useQuote'
import { useStreak } from '../../hooks/useStreak'
import { useMilestone } from '../../hooks/useMilestone'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import PullRefreshIndicator from '../../components/common/PullRefreshIndicator'
import { AdBannerTop, AdBannerBottom, AdRail } from './AdBanner'

const WeeklyTheme = lazy(() => import('./WeeklyTheme').then(m => ({ default: m.WeeklyTheme })))
const MilestoneModal = lazy(() => import('../gamification/MilestoneModal').then(m => ({ default: m.MilestoneModal })))

interface ResumeData {
  slug: string
  title: string
  currentDay: number
  totalDays: number
}

function readResumeData(): ResumeData | null {
  try {
    const raw = localStorage.getItem('rp-resume')
    return raw ? (JSON.parse(raw) as ResumeData) : null
  } catch {
    return null
  }
}

function ReadingPlanResumeCTA({ resume }: { resume: ResumeData }) {
  const pct = Math.round((resume.currentDay / resume.totalDays) * 100)
  return (
    <Link
      to={`/reading-plans/${resume.slug}`}
      className="max-w-2xl mx-auto mt-8 flex items-center gap-4 rounded-2xl px-4 py-3.5
                 border border-primary-200 dark:border-[rgba(255,255,255,0.07)]
                 bg-surface-card hover:border-accent/40 dark:hover:border-star-gold/30
                 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="font-display text-[10px] tracking-[0.15em] uppercase text-primary-400 dark:text-night-400 mb-0.5">
          Continue reading plan
        </p>
        <p className="font-display text-sm text-primary-800 dark:text-primary-800 truncate">
          {resume.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 rounded-full bg-primary-100 dark:bg-primary-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent dark:bg-star-gold transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-sans text-[10px] text-primary-400 dark:text-night-400 shrink-0">
            Day {resume.currentDay}/{resume.totalDays}
          </span>
        </div>
      </div>
      <span className="text-primary-300 dark:text-night-500 group-hover:text-accent dark:group-hover:text-star-gold transition-colors text-lg leading-none">›</span>
    </Link>
  )
}

export const DailyQuote = () => {
  const [scrollY, setScrollY] = useState(0)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  const { data, isLoading, isError, refetch } = useDailyQuote()
  const { data: streak } = useStreak()
  const { milestone, dismissMilestone } = useMilestone(streak?.current_streak)
  const { isAuthenticated, isGuest } = useAuth()
  const isRealUser = isAuthenticated && !isGuest
  const [resumeData] = useState<ResumeData | null>(readResumeData)

  const handleRefresh = useCallback(async () => {
    await refetch()
    if (isRealUser) queryClient.invalidateQueries({ queryKey: ['streak'] })
  }, [refetch, isRealUser, queryClient])

  const { onTouchStart, onTouchMove, onTouchEnd, pullProgress, isRefreshing } = usePullToRefresh({
    onRefresh: handleRefresh,
  })

  // The daily quote fetch triggers RecordDailyRead server-side, which increments
  // the streak. Invalidate the streak cache once the quote loads so the header
  // and card reflect the just-recorded read rather than the pre-fetch snapshot.
  useEffect(() => {
    if (data && isRealUser) {
      queryClient.invalidateQueries({ queryKey: ['streak'] })
    }
  }, [data?.quote?.id, isRealUser])

  // Only show the hard error screen if we have no cached data to fall back on
  if (isError && !data) return (
    <div className="text-center py-24 text-primary-400 font-sans">
      <p className="text-lg mb-2">The scroll is unavailable.</p>
      <p className="text-sm mb-6">Check your connection and try again.</p>
      <button
        onClick={() => refetch()}
        className="font-sans text-sm text-accent border border-accent/40 rounded-full px-5 py-2 hover:bg-accent hover:text-white transition-colors"
      >
        Try again
      </button>
    </div>
  )

  return (
    <main
      className="bg-surface-base pt-3 pb-24 px-4"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <PullRefreshIndicator progress={pullProgress} isRefreshing={isRefreshing} />

      {/* Offline banner — shown when network failed but cached quote is available */}
      {isError && data && (
        <div className="flex items-center justify-center gap-1.5 mb-3 text-primary-400 dark:text-night-500 font-sans text-[11px]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-300 dark:bg-night-600" />
          Offline · showing last saved quote
        </div>
      )}

      {/* Date header — parallax drifts slower than page scroll */}
      <header
        className="text-center mb-4"
        style={{ transform: `translateY(${scrollY * 0.18}px)`, willChange: 'transform' }}
      >
        <p className="font-display text-xs tracking-widest uppercase text-primary-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })}
        </p>
        <h1 className="font-display text-2xl text-primary-800 mt-1 cursor-default animate-title-glow transition-all duration-400 hover:tracking-widest hover:text-accent-dark dark:hover:text-star-gold">
          Daily Meditation
        </h1>
      </header>

      {/* Mobile top banner */}
      <AdBannerTop />

      {/* Desktop: three-column layout with sticky side rails */}
      <div className="flex items-start justify-center gap-4">
        <AdRail side="left" />

        <div className="flex-1 min-w-0">
          <Suspense fallback={<QuoteCardSkeleton />}>
            {data?.quote
              ? <QuoteCard quote={data.quote} showStreak streakCount={streak?.current_streak} />
              : <QuoteCardSkeleton />
            }
          </Suspense>
        </div>

        <AdRail side="right" />
      </div>

      {/* Mobile bottom banner */}
      <AdBannerBottom />

      {/* Streak / practice prompt below card */}
      {isRealUser && streak && streak.current_streak > 0 ? (
        <div className="max-w-2xl mx-auto mt-10 flex items-center justify-center gap-2 text-primary-500 font-sans text-sm">
          <span className="animate-flame-pulse inline-block">🔥</span>
          <span>Day {streak.current_streak} — keep your practice alive</span>
        </div>
      ) : !isRealUser ? (
        <div className="max-w-2xl mx-auto mt-10 text-center">
          <p className="font-sans text-sm text-primary-400 mb-3">
            Save quotes, track your streak, and write meditations.
          </p>
          <Link
            to="/auth/register"
            className="inline-block font-sans text-sm text-accent border border-accent/40 rounded-full px-5 py-2 hover:bg-accent hover:text-white transition-colors"
          >
            Start your practice
          </Link>
        </div>
      ) : null}

      {/* Reading plan resume — only shown for authenticated users with an active plan */}
      {isRealUser && resumeData && (
        <ReadingPlanResumeCTA resume={resumeData} />
      )}

      {/* Weekly theme — 7 curated passages for this week's focus */}
      <Suspense fallback={null}>
        <WeeklyTheme />
      </Suspense>

      <Suspense fallback={null}>
        {milestone && (
          <MilestoneModal
            milestone={milestone}
            onClose={dismissMilestone}
          />
        )}
      </Suspense>
    </main>
  )
}
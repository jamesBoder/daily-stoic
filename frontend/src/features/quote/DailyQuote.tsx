// src/features/quote/DailyQuote.tsx

import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { QuoteCard } from './QuoteCard'
import { QuoteCardSkeleton } from './QuoteCardSkeleton'
import { useDailyQuote } from '../../hooks/useQuote'
import { useStreak } from '../../hooks/useStreak'
import { MilestoneModal } from '../gamification/MilestoneModal'
import { useMilestone } from '../../hooks/useMilestone'
import { useAuth } from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import PullRefreshIndicator from '../../components/common/PullRefreshIndicator'
import { AdBannerTop, AdBannerBottom, AdRail } from './AdBanner'

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

  if (isLoading) return <QuoteCardSkeleton />

  if (isError) return (
    <div className="text-center py-24 text-primary-400 font-sans">
      <p className="text-lg mb-2">The scroll is unavailable.</p>
      <p className="text-sm">Check your connection and try again.</p>
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

      {/* Date header — parallax drifts slower than page scroll */}
      <header
        className="text-center mb-4"
        style={{ transform: `translateY(${scrollY * 0.18}px)`, willChange: 'transform' }}
      >
        <p className="font-display text-xs tracking-widest uppercase text-primary-400" style={{ textShadow: '0 1px 3px rgba(38,35,28,0.18)' }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })}
        </p>
        <h1
          className="font-display text-2xl text-primary-800 mt-1 cursor-default animate-title-glow transition-all duration-400 hover:tracking-widest hover:text-accent-dark"
          style={{ textShadow: '0 2px 6px rgba(38,35,28,0.22), 0 1px 2px rgba(38,35,28,0.12)' }}
          onMouseEnter={e => {
            e.currentTarget.style.textShadow = '0 0 14px rgba(139,115,85,0.6), 0 0 32px rgba(139,115,85,0.28), 0 2px 6px rgba(38,35,28,0.2)'
          }}
          onMouseLeave={e => { e.currentTarget.style.textShadow = '0 2px 6px rgba(38,35,28,0.22), 0 1px 2px rgba(38,35,28,0.12)' }}
        >
          Daily Meditation
        </h1>
      </header>

      {/* Mobile top banner */}
      <AdBannerTop />

      {/* Desktop: three-column layout with sticky side rails */}
      <div className="flex items-start justify-center gap-4">
        <AdRail side="left" />

        <div className="flex-1 min-w-0">
          {data && (
            <QuoteCard
              quote={data.quote}
              showStreak
              streakCount={streak?.current_streak}
            />
          )}
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

      {milestone && (
        <MilestoneModal
          milestone={milestone}
          onClose={dismissMilestone}
        />
      )}
    </main>
  )
}
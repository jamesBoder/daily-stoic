// src/features/quote/DailyQuote.tsx

import { QuoteCard } from './QuoteCard'
import { QuoteCardSkeleton } from './QuoteCardSkeleton'
import { useDailyQuote } from '../../hooks/useQuote'
import { useStreak } from '../../hooks/useStreak'
import { MilestoneModal } from '../gamification/MilestoneModal'
import { useMilestone } from '../../hooks/useMilestone'

export const DailyQuote = () => {
  const { data, isLoading, isError } = useDailyQuote()
  const { data: streak } = useStreak()
  const { milestone, dismissMilestone } = useMilestone(streak?.current_streak)

  if (isLoading) return <QuoteCardSkeleton />

  if (isError) return (
    <div className="text-center py-24 text-primary-400 font-sans">
      <p className="text-lg mb-2">The scroll is unavailable.</p>
      <p className="text-sm">Check your connection and try again.</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-surface-base py-16 px-4">
      {/* Date header */}
      <header className="text-center mb-12">
        <p className="font-display text-xs tracking-widest uppercase text-primary-400">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })}
        </p>
        <h1 className="font-display text-2xl text-primary-800 mt-1">
          Daily Reflection
        </h1>
      </header>

      {data && (
        <QuoteCard
          quote={data.quote}
          showStreak
          streakCount={streak?.current_streak}
        />
      )}

      {milestone && (
        <MilestoneModal
          milestone={milestone}
          onClose={dismissMilestone}
        />
      )}
    </main>
  )
}
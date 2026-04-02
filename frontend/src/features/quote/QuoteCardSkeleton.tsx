// src/features/quote/QuoteCardSkeleton.tsx
// Uses CSS shimmer animation — no external library needed

export const QuoteCardSkeleton = () => (
  <div className="bg-surface-card rounded-card shadow-card overflow-hidden max-w-2xl mx-auto">
    {/* Image placeholder — matches illustration panel height to prevent layout shift */}
    <div className="w-full aspect-[3/2] sm:aspect-[16/9] bg-primary-200 animate-shimmer" />
    <div className="px-8 py-10 animate-pulse">
      <div className="h-4 w-20 bg-primary-200 rounded mb-8" />
      <div className="space-y-3 mb-8">
        <div className="h-7 bg-primary-200 rounded w-full" />
        <div className="h-7 bg-primary-200 rounded w-5/6" />
        <div className="h-7 bg-primary-200 rounded w-4/6" />
      </div>
      <div className="h-3 w-32 bg-primary-200 rounded mb-1.5" />
      <div className="h-3 w-24 bg-primary-200 rounded" />
    </div>
  </div>
)

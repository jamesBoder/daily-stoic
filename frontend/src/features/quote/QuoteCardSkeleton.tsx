// src/features/quote/QuoteCardSkeleton.tsx
// Uses CSS shimmer animation — no external library needed

export const QuoteCardSkeleton = () => (
  <div className="max-w-xs sm:max-w-sm mx-auto">
    <div className="bg-surface-card rounded-card shadow-card border border-border-subtle">
      <div className="p-4 sm:p-5">
        <div className="border border-border rounded-[3px] p-4">

          {/* Header */}
          <div className="flex justify-center mb-4">
            <div className="h-4 w-20 bg-surface-hi rounded animate-pulse" />
          </div>

          {/* Medallion */}
          <div className="w-2/5 mx-auto aspect-square bg-surface-hi rounded-[2px] animate-pulse mb-4" />

          {/* Divider */}
          <div className="h-px bg-surface-hi mb-5" />

          {/* Quote lines */}
          <div className="space-y-2 mb-5 animate-pulse">
            <div className="h-5 bg-surface-hi rounded w-full" />
            <div className="h-5 bg-surface-hi rounded w-5/6 mx-auto" />
            <div className="h-5 bg-surface-hi rounded w-4/6 mx-auto" />
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-hi mb-4" />

          {/* Attribution */}
          <div className="flex flex-col items-center gap-1.5 animate-pulse">
            <div className="h-3 w-28 bg-surface-hi rounded" />
            <div className="h-3 w-20 bg-surface-hi rounded" />
          </div>

        </div>
      </div>
    </div>

    {/* Action row skeleton */}
    <div className="flex justify-center gap-2 mt-4 animate-pulse">
      <div className="h-9 w-20 bg-surface-hi rounded-full" />
      <div className="h-9 w-24 bg-surface-hi rounded-full" />
      <div className="h-9 w-20 bg-surface-hi rounded-full" />
    </div>
  </div>
)

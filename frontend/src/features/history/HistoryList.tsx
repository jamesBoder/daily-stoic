// src/features/history/HistoryList.tsx

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { historyService } from '../../services/api/history'
import type { HistoryEntry } from '../../types/history'
import { formatDateShort } from '../../utils/date'

const PAGE_SIZE = 20

const HistoryEntryCard = ({ entry }: { entry: HistoryEntry }) => {
  const { quote } = entry
  const preview =
    quote.text.length > 120 ? quote.text.slice(0, 120).trimEnd() + '…' : quote.text

  return (
    <article className="bg-surface-card rounded-card border border-primary-100 px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base text-primary-800 leading-relaxed mb-2">
            &ldquo;{preview}&rdquo;
          </p>
          <p className="font-display text-xs tracking-widest uppercase text-primary-700">
            {quote.author.name}
            {quote.source && (
              <span className="font-sans normal-case tracking-normal text-primary-500">
                {' '}&mdash; {quote.source}
              </span>
            )}
          </p>
          {quote.tradition && (
            <span className="inline-block mt-2 font-sans text-xs text-accent bg-accent/10 rounded-stone px-2 py-0.5">
              {quote.tradition.name}
            </span>
          )}
        </div>
        <time
          className="font-sans text-xs text-primary-500 whitespace-nowrap mt-0.5 shrink-0"
          dateTime={entry.viewed_at}
        >
          {formatDateShort(entry.viewed_at)}
        </time>
      </div>
    </article>
  )
}

export const HistoryList = () => {
  const [page, setPage] = useState(1)
  const [clearing, setClearing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['history', page],
    queryFn: () => historyService.getHistory(page, PAGE_SIZE),
    staleTime: 2 * 60 * 1000,
  })

  const handleClearHistory = async () => {
    setConfirmClear(false)
    setClearing(true)
    try {
      await historyService.clearHistory()
      setPage(1)
      refetch()
    } finally {
      setClearing(false)
    }
  }

  const entries = data?.history ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.total_pages ?? 1

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-display text-xs tracking-widest uppercase text-primary-600 mb-1">
              Archive
            </p>
            <h1 className="font-display text-2xl text-primary-800 title-glow-hover">Reading History</h1>
          </div>
          {entries.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm text-primary-500">Clear all history?</span>
                <button
                  onClick={handleClearHistory}
                  disabled={clearing}
                  className="font-sans text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  {clearing ? 'Clearing…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="font-sans text-sm text-primary-500 hover:text-primary-700"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="font-sans text-sm text-primary-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
              >
                Clear history
              </button>
            )
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-card rounded-card border border-primary-100 px-6 py-5 animate-pulse"
              >
                <div className="h-4 bg-primary-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-primary-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16 text-primary-400 font-sans">
            <p className="text-lg mb-2">Failed to load history.</p>
            <button
              onClick={() => refetch()}
              className="text-sm text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && entries.length === 0 && (
          <div className="text-center py-24">
            <p className="font-serif text-xl text-primary-400 italic mb-2">
              &ldquo;Begin the journey.&rdquo;
            </p>
            <p className="font-sans text-sm text-primary-400">
              Quotes you read will appear here.
            </p>
          </div>
        )}

        {/* Entry list */}
        {!isLoading && !isError && entries.length > 0 && (
          <>
            <div className="space-y-3">
              {entries.map(entry => (
                <HistoryEntryCard key={entry.id} entry={entry} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="font-sans text-sm text-primary-500 hover:text-primary-800 disabled:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] px-4"
                >
                  ← Previous
                </button>
                <span className="font-sans text-sm text-primary-500">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="font-sans text-sm text-primary-500 hover:text-primary-800 disabled:text-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] px-4"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

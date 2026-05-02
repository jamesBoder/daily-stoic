// src/hooks/useQuote.ts

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { quotesApi } from '../services/api/quotes'
import type { DailyQuoteResponse } from '../types/quote'

export const useQuote = (id?: number) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.getById(id!),
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
  })
}

const LS_KEY = 'dq-cache'

// Today's date in UTC — the same reference the backend uses.
function utcDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

function readCache(): DailyQuoteResponse | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return undefined
    const cached = JSON.parse(raw) as DailyQuoteResponse
    // Only use the cache if it's for today's UTC date.
    // This ensures every user sees the same quote the moment UTC midnight rolls over,
    // regardless of their local timezone.
    if (cached.quote.daily_date !== utcDateString()) return undefined
    return cached
  } catch {
    return undefined
  }
}

export const useDailyQuote = () => {
  const result = useQuery({
    queryKey: ['daily-quote'],
    queryFn: quotesApi.getDaily,
    // Once we have today's quote it won't change — but the date check in readCache
    // ensures we refetch the moment a new UTC day starts.
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    initialData: readCache,
    initialDataUpdatedAt: () => readCache() ? Date.now() : 0,
  })

  // Persist fresh API data back to localStorage for the next visit
  useEffect(() => {
    if (result.data && !result.isFetching) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(result.data))
      } catch { /* ignore quota errors */ }
    }
  }, [result.data, result.isFetching])

  return result
}
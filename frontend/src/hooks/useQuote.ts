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
const LS_TS_KEY = 'dq-cache-ts'

function readCache(): DailyQuoteResponse | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as DailyQuoteResponse) : undefined
  } catch {
    return undefined
  }
}

export const useDailyQuote = () => {
  const result = useQuery({
    queryKey: ['daily-quote'],
    queryFn: quotesApi.getDaily,
    staleTime: 60 * 60 * 1000,   // 1 hour — the daily quote doesn't change mid-day
    gcTime: 24 * 60 * 60 * 1000, // keep in cache all day
    // Seed from localStorage so the quote renders before the API responds
    initialData: readCache,
    initialDataUpdatedAt: () => {
      const ts = localStorage.getItem(LS_TS_KEY)
      return ts ? parseInt(ts, 10) : 0
    },
  })

  // Persist fresh API data back to localStorage for the next visit
  useEffect(() => {
    if (result.data && !result.isFetching) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(result.data))
        localStorage.setItem(LS_TS_KEY, Date.now().toString())
      } catch { /* ignore quota errors */ }
    }
  }, [result.data, result.isFetching])

  return result
}
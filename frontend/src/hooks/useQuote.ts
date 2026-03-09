// src/hooks/useQuote.ts

import { useQuery } from '@tanstack/react-query'
import { quotesApi } from '../services/api/quotes'

export const useQuote = (id?: number) => {
  return useQuery({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.getById(id!),
    enabled: !!id,
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export const useDailyQuote = () => {
  return useQuery({
    queryKey: ['daily-quote'],
    queryFn: quotesApi.getDaily,
    staleTime: 60 * 60 * 1000,   // 1 hour — the daily quote doesn't change mid-day
    gcTime: 24 * 60 * 60 * 1000, // keep in cache all day
  })
}
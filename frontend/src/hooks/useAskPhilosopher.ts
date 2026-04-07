// src/hooks/useAskPhilosopher.ts

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { aiApi, type AskResponse } from '../services/api/ai'
import { useAuth } from './useAuth'

export function useAiUsage() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['ai-usage'],
    queryFn: aiApi.getUsage,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

/** Returns true when an Axios error has an HTTP 429 status. */
export function is429(err: unknown): boolean {
  return (err as AxiosError)?.response?.status === 429
}

export function useAskByQuote() {
  const queryClient = useQueryClient()
  const [lastResponse, setLastResponse] = useState<AskResponse | null>(null)

  const mutation = useMutation({
    mutationFn: ({ quoteId, question }: { quoteId: number; question: string }) =>
      aiApi.askByQuote(quoteId, question),
    onSuccess: data => {
      setLastResponse(data)
      // Refresh usage counter so the UI reflects the newly consumed slot immediately.
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
    },
  })

  return { ...mutation, lastResponse, clearResponse: () => setLastResponse(null) }
}

export function useAskByAuthor() {
  const queryClient = useQueryClient()
  const [lastResponse, setLastResponse] = useState<AskResponse | null>(null)

  const mutation = useMutation({
    mutationFn: ({ authorSlug, question }: { authorSlug: string; question: string }) =>
      aiApi.askByAuthor(authorSlug, question),
    onSuccess: data => {
      setLastResponse(data)
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] })
    },
  })

  return { ...mutation, lastResponse, clearResponse: () => setLastResponse(null) }
}

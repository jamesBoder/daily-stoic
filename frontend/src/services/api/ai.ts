// src/services/api/ai.ts

import apiClient from './api'

export interface AskResponse {
  response: string
  questions_remaining: number | null // null = unlimited (premium)
}

export interface UsageResponse {
  questions_used: number | null
  questions_remaining: number | null
  is_unlimited: boolean
}

export const aiApi = {
  askByQuote: (quoteId: number, question: string) =>
    apiClient
      .post<AskResponse>(`/api/quotes/${quoteId}/ask`, { question })
      .then(r => r.data),

  askByAuthor: (authorSlug: string, question: string) =>
    apiClient
      .post<AskResponse>(`/api/authors/${authorSlug}/ask`, { question })
      .then(r => r.data),

  getUsage: () =>
    apiClient
      .get<UsageResponse>('/api/ai/usage')
      .then(r => r.data),
}

// src/services/api/quotes.ts

import apiClient from './api'
import type { DailyQuoteResponse, Quote } from '../../types/quote'
import type { Week } from '../../types/week'

export const quotesApi = {
  getDaily: (): Promise<DailyQuoteResponse> =>
    apiClient.get('/api/quotes/daily').then(r => r.data),

  getById: (id: number): Promise<Quote> =>
    apiClient.get(`/api/quotes/${id}`).then(r => r.data),

  getByAuthor: (authorId: number): Promise<Quote[]> =>
    apiClient.get(`/api/quotes/by-author/${authorId}`).then(r => r.data),

  search: (params: {
    q?: string
    tradition?: string
    theme?: string
    tier?: string
  }): Promise<Quote[]> =>
    apiClient.get('/api/quotes/search', { params }).then(r => r.data),

  getWeek: (): Promise<{ week: Week | null }> =>
    apiClient.get('/api/quotes/week').then(r => r.data),
}
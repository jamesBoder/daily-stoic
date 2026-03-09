// src/services/api/quotes.ts

import apiClient from './api'
import type { DailyQuoteResponse, Quote } from '../../types/quote'

export const quotesApi = {
  getDaily: (): Promise<DailyQuoteResponse> =>
    apiClient.get('/quotes/daily').then(r => r.data),

  getById: (id: number): Promise<Quote> =>
    apiClient.get(`/quotes/${id}`).then(r => r.data),

  getByAuthor: (authorId: number): Promise<Quote[]> =>
    apiClient.get(`/quotes/by-author/${authorId}`).then(r => r.data),

  search: (params: {
    q?: string
    tradition?: string
    theme?: string
    tier?: string
  }): Promise<Quote[]> =>
    apiClient.get('/quotes/search', { params }).then(r => r.data),
}
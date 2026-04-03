// src/services/api/traditions.ts

import apiClient from './api'
import type { Tradition, Quote } from '../../types/quote'

export const traditionsApi = {
  list: (): Promise<Tradition[]> =>
    apiClient.get('/api/traditions').then(r => r.data.traditions ?? []),

  getBySlug: (slug: string): Promise<Tradition & { quotes: Quote[] }> =>
    apiClient.get(`/api/traditions/${slug}`).then(r => r.data),
}
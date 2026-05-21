// src/services/api/traditions.ts

import apiClient from './api'
import type { Tradition, Quote, Author } from '../../types/quote'

export const traditionsApi = {
  list: (): Promise<Tradition[]> =>
    apiClient.get('/api/traditions').then(r => r.data.traditions ?? []),

  getBySlug: (slug: string): Promise<Tradition & { authors: Author[] }> =>
    apiClient.get(`/api/traditions/${slug}`).then(r => r.data.tradition),

  getAuthorBySlug: (slug: string): Promise<Author> =>
    apiClient.get(`/api/authors/${slug}`).then(r => r.data.author),
}
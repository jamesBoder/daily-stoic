import apiClient from './api'
import type { ReadingPlan, ReadingPlanProgress, GatedPlanResponse } from '../../types/readingPlan'

export const readingPlansApi = {
  list: (): Promise<{ reading_plans: ReadingPlan[] }> =>
    apiClient.get('/api/reading-plans').then(r => r.data),

  get: (slug: string): Promise<{ reading_plan: ReadingPlan } | GatedPlanResponse> =>
    apiClient.get(`/api/reading-plans/${slug}`).then(r => r.data),

  getProgress: (slug: string): Promise<{ progress: ReadingPlanProgress | null }> =>
    apiClient.get(`/api/reading-plans/${slug}/progress`).then(r => r.data),

  start: (slug: string): Promise<{ progress: ReadingPlanProgress }> =>
    apiClient.post(`/api/reading-plans/${slug}/start`).then(r => r.data),

  advance: (slug: string): Promise<{ progress: ReadingPlanProgress }> =>
    apiClient.post(`/api/reading-plans/${slug}/advance`).then(r => r.data),
}

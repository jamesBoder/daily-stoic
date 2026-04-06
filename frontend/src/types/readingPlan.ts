import { Quote, Tradition } from './quote'

export interface ReadingPlan {
  id: number
  slug: string
  title: string
  description: string
  tier: 'free' | 'premium'
  duration_days: number
  tradition_id?: number
  tradition?: Tradition
  entries?: ReadingPlanEntry[]
}

export interface ReadingPlanEntry {
  id: number
  reading_plan_id: number
  day_number: number
  title: string
  intro_text: string
  quote_id?: number
  quote?: Quote
}

export interface ReadingPlanProgress {
  id: number
  user_id: number
  reading_plan_id: number
  current_day: number
  started_at: string
  completed_at?: string
  is_active: boolean
}

export interface GatedPlanResponse {
  gated: true
  tier_required: string
  message: string
  reading_plan: Omit<ReadingPlan, 'entries'>
}

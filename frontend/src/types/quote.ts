// src/types/quote.ts
export interface Author {
  id: number
  name: string
  slug: string
  born?: string
  died?: string
  nationality?: string
  bio?: string
  image_url?: string
  tradition_id?: number
  quotes?: Quote[]
}

export interface Tradition {
  id: number
  name: string
  slug: string
  description?: string
  tier: 'free' | 'premium'
}

export interface Quote {
  id: number
  text: string
  source: string
  context_note?: string
  context_full?: string
  reflection_prompt?: string
  themes: string[]
  tier: 'free' | 'premium'
  daily_date?: string
  image_url?: string
  author: Author
  tradition: Tradition
}

export interface DailyQuoteResponse {
  quote: Quote
}

export interface Streak {
  current_streak: number
  longest_streak: number
  total_reads: number
  last_read_date: string | null
}

export interface Achievement {
  id: number
  name: string
  description: string
  badge_icon: string
  unlocked_at: string
}
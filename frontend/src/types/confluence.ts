export type RarityTier = 'common' | 'uncommon' | 'rare' | 'major_arcana'
export type GroupTier  = 'yellow' | 'green' | 'blue' | 'purple'
export type SessionStatus = 'in_progress' | 'complete' | 'failed'
export type PuzzleArchetype = 'convergence' | 'name_change' | 'inversion' | 'lineage' | 'paradox'

export interface WisdomConcept {
  id: number
  name: string
  short_phrase: string
  tradition_id: number
  tradition?: { id: number; name: string; slug: string }
  illustration_url?: string
  rarity_tier: RarityTier
  codex_in_tradition?: string
  codex_echoes?: string
  codex_question?: string
  codex_practice?: string
}

export interface ConfluenceCard {
  id: number
  group_id: number
  concept: WisdomConcept
  display_order: number
}

export interface ConfluenceGroup {
  id: number
  puzzle_id: number
  tier: GroupTier
  label: string
  convergence_teaching?: string  // only present in guess response, not initial fetch
  display_order: number
  cards: ConfluenceCard[]
}

export interface ConfluencePuzzle {
  id: number
  date: string
  title: string
  archetype: PuzzleArchetype
  is_major_arcana: boolean
  major_arcana_id?: number
  groups: ConfluenceGroup[]
}

export interface GuessAttempt {
  card_ids: number[]
  correct: boolean
  tier?: GroupTier
  one_away?: boolean
}

export interface ConfluenceSession {
  id: number
  puzzle_id: number
  status: SessionStatus
  attempts_used: number
  attempts: GuessAttempt[]
  groups_found: number[]
  purple_first_try: boolean
  no_mistakes: boolean
  completed_at?: string
}

export interface GuessResult {
  correct: boolean
  tier?: GroupTier
  label?: string
  convergence_teaching?: string
  one_away?: boolean
  attempts_remaining: number
  session_status: SessionStatus
  purple_first_try?: boolean
  no_mistakes?: boolean
  full_reveal?: ConfluencePuzzle  // present on complete or failed
}

// Local game state (client-side, mirrors server session for auth users)
export interface LocalGameState {
  puzzleId: number
  selectedCardIds: Set<number>   // up to 4 selected for a guess
  foundGroupIds: number[]
  foundGroups: ConfluenceGroup[]
  attempts: GuessAttempt[]
  attemptsRemaining: number
  status: SessionStatus
  purpleFirstTry: boolean
  noMistakes: boolean
}

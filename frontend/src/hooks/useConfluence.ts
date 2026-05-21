import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { confluenceService } from '../services/api/confluence'
import { useAuth } from './useAuth'
import type {
  LocalGameState, ConfluenceGroup, GuessResult, ConfluencePuzzle,
} from '../types/confluence'

// ── Local state machine ──────────────────────────────────────────────────────

type Action =
  | { type: 'SELECT_CARD';    id: number }
  | { type: 'DESELECT_CARD';  id: number }
  | { type: 'DESELECT_ALL' }
  | { type: 'GUESS_CORRECT';  group: ConfluenceGroup; result: GuessResult }
  | { type: 'GUESS_WRONG';    result: GuessResult }
  | { type: 'RESTORE';        session: import('../types/confluence').ConfluenceSession; puzzle: ConfluencePuzzle }
  | { type: 'RESTORE_LOCAL';  state: LocalGameState }
  | { type: 'INIT';           puzzleId: number }

function initState(puzzleId: number): LocalGameState {
  return {
    puzzleId,
    flippedCardIds: new Set(),
    selectedCardIds: new Set(),
    foundGroupIds: [],
    foundGroups: [],
    attempts: [],
    attemptsRemaining: 4,
    status: 'in_progress',
    purpleFirstTry: false,
    noMistakes: false,
  }
}

function reducer(state: LocalGameState, action: Action): LocalGameState {
  switch (action.type) {
    case 'SELECT_CARD': {
      if (state.selectedCardIds.size >= 4) return state
      const flipped = new Set(state.flippedCardIds)
      flipped.add(action.id)
      const selected = new Set(state.selectedCardIds)
      selected.add(action.id)
      return { ...state, flippedCardIds: flipped, selectedCardIds: selected }
    }
    case 'DESELECT_CARD': {
      const next = new Set(state.selectedCardIds)
      next.delete(action.id)
      return { ...state, selectedCardIds: next }
      // Note: card stays flipped even after deselecting
    }
    case 'DESELECT_ALL':
      return { ...state, selectedCardIds: new Set() }
    case 'GUESS_CORRECT': {
      const group = { ...action.group, convergence_teaching: action.result.convergence_teaching }
      return {
        ...state,
        selectedCardIds: new Set(),
        foundGroupIds: [...state.foundGroupIds, action.group.id],
        foundGroups: [...state.foundGroups, group],
        attempts: [...state.attempts, { card_ids: [...state.selectedCardIds], correct: true, tier: action.result.tier }],
        attemptsRemaining: action.result.attempts_remaining,
        status: action.result.session_status,
        purpleFirstTry: state.purpleFirstTry || !!action.result.purple_first_try,
        noMistakes: !!action.result.no_mistakes,
      }
    }
    case 'GUESS_WRONG': {
      return {
        ...state,
        selectedCardIds: new Set(),
        attempts: [...state.attempts, { card_ids: [...state.selectedCardIds], correct: false, one_away: action.result.one_away }],
        attemptsRemaining: action.result.attempts_remaining,
        status: action.result.session_status,
      }
    }
    case 'RESTORE': {
      const foundGroups = (action.session.groups_found ?? [])
        .map(id => action.puzzle.groups.find(g => g.id === id))
        .filter(Boolean) as ConfluenceGroup[]
      const allGuessedIds = (action.session.attempts ?? []).flatMap(a => a.card_ids)
      return {
        ...state,
        puzzleId: action.session.puzzle_id,
        flippedCardIds: new Set(allGuessedIds),
        selectedCardIds: new Set(),
        foundGroupIds: action.session.groups_found ?? [],
        foundGroups,
        attempts: action.session.attempts ?? [],
        attemptsRemaining: 4 - action.session.attempts_used,
        status: action.session.status,
        purpleFirstTry: action.session.purple_first_try,
        noMistakes: action.session.no_mistakes,
      }
    }
    case 'RESTORE_LOCAL':
      return action.state
    case 'INIT':
      return { ...state, puzzleId: action.puzzleId }
    default: return state
  }
}

// ── localStorage serialization ───────────────────────────────────────────────

function serializeGameState(s: LocalGameState) {
  return JSON.stringify({
    ...s,
    flippedCardIds: [...s.flippedCardIds],
    selectedCardIds: [...s.selectedCardIds],
  })
}

function deserializeGameState(raw: string): LocalGameState {
  const parsed = JSON.parse(raw)
  return {
    ...parsed,
    flippedCardIds: new Set(parsed.flippedCardIds ?? []),
    selectedCardIds: new Set(),  // always reset selection on restore
  }
}

// ── Public hook ──────────────────────────────────────────────────────────────

export function useConfluence() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const { data: puzzle, isLoading, error, refetch } = useQuery({
    queryKey: ['confluence', 'today'],
    queryFn: confluenceService.getToday,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  })

  const [gameState, dispatch] = useReducer(reducer, 0, initState)

  const { data: serverSession, isLoading: isSessionLoading } = useQuery({
    queryKey: ['confluence', 'session', puzzle?.id],
    queryFn: () => confluenceService.getSession(puzzle!.id),
    enabled: isAuthenticated && !!puzzle,
    retry: false,  // 404 = no session yet; don't add 7s of retry backoff
  })

  // True once we've either restored from a server session or confirmed none exists.
  // Prevents the grid flashing empty when navigating back with cached session data
  // (TanStack cache makes isSessionLoading=false before RESTORE has dispatched).
  const [sessionSettled, setSessionSettled] = useState(false)

  useEffect(() => {
    if (serverSession && puzzle) {
      dispatch({ type: 'RESTORE', session: serverSession, puzzle })
      setSessionSettled(true)
    }
  }, [serverSession?.id, puzzle?.id])

  // Settle without RESTORE when the session query completes with no session (404)
  useEffect(() => {
    if (isAuthenticated && !isSessionLoading && !serverSession) {
      setSessionSettled(true)
    }
  }, [isAuthenticated, isSessionLoading, serverSession])

  useEffect(() => {
    if (puzzle && !isAuthenticated) {
      dispatch({ type: 'INIT', puzzleId: puzzle.id })
    }
  }, [puzzle?.id, isAuthenticated])

  // Restore anonymous session from localStorage
  useEffect(() => {
    if (!isAuthenticated && puzzle) {
      const raw = localStorage.getItem(`confluence_session_${puzzle.id}`)
      if (raw) {
        try {
          const saved = deserializeGameState(raw)
          if (saved.status === 'in_progress') {
            dispatch({ type: 'RESTORE_LOCAL', state: saved })
          }
        } catch { /* corrupt data — ignore */ }
      }
    }
  }, [puzzle?.id, isAuthenticated])

  // Persist anonymous session to localStorage
  useEffect(() => {
    if (!isAuthenticated && gameState.puzzleId !== 0) {
      localStorage.setItem(
        `confluence_session_${gameState.puzzleId}`,
        serializeGameState(gameState)
      )
    }
  }, [gameState, isAuthenticated])

  const handleAnonymousGuess = useCallback((cardIds: number[]) => {
    if (!puzzle) return
    for (const group of puzzle.groups) {
      if (gameState.foundGroupIds.includes(group.id)) continue
      const matches = group.cards.filter(c => cardIds.includes(c.id)).length
      if (matches === 4) {
        dispatch({ type: 'GUESS_CORRECT', group, result: {
          correct: true, tier: group.tier, label: group.label,
          convergence_teaching: group.tier === 'purple'
            ? 'Sign in to read the full cross-tradition teaching.'
            : undefined,
          attempts_remaining: gameState.attemptsRemaining,
          session_status: gameState.foundGroupIds.length + 1 === 4 ? 'complete' : 'in_progress',
        }})
        return
      }
    }
    const oneAway = puzzle.groups.some(g =>
      !gameState.foundGroupIds.includes(g.id) &&
      g.cards.filter(c => cardIds.includes(c.id)).length === 3
    )
    dispatch({ type: 'GUESS_WRONG', result: {
      correct: false, one_away: oneAway,
      attempts_remaining: gameState.attemptsRemaining - 1,
      session_status: gameState.attemptsRemaining - 1 === 0 ? 'failed' : 'in_progress',
    }})
  }, [puzzle, gameState])

  const [guessError, setGuessError] = useState<string | null>(null)

  const guessMutation = useMutation({
    mutationFn: (cardIds: number[]) => confluenceService.submitGuess(puzzle!.id, cardIds),
    onSuccess: (result) => {
      setGuessError(null)
      if (result.correct) {
        const group = puzzle!.groups.find(
          g => g.tier === result.tier && !gameState.foundGroupIds.includes(g.id)
        )!
        dispatch({ type: 'GUESS_CORRECT', group, result })
        if (result.session_status === 'complete' || result.session_status === 'failed') {
          queryClient.invalidateQueries({ queryKey: ['library'] })
        }
      } else {
        dispatch({ type: 'GUESS_WRONG', result })
      }
    },
    onError: () => {
      setGuessError('Could not submit — check your connection and try again.')
    },
  })

  const toggleCard = useCallback((id: number) => {
    if (gameState.selectedCardIds.has(id)) {
      dispatch({ type: 'DESELECT_CARD', id })
    } else {
      dispatch({ type: 'SELECT_CARD', id })
    }
  }, [gameState.selectedCardIds])

  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' })
  }, [])

  const submitGuess = useCallback(() => {
    if (gameState.selectedCardIds.size !== 4) return
    if (isAuthenticated) {
      guessMutation.mutate([...gameState.selectedCardIds])
    } else {
      handleAnonymousGuess([...gameState.selectedCardIds])
    }
  }, [gameState.selectedCardIds, isAuthenticated, handleAnonymousGuess, guessMutation])

  const lastWrongCardIds = (() => {
    const lastAttempt = gameState.attempts[gameState.attempts.length - 1]
    if (!lastAttempt || lastAttempt.correct) return []
    return lastAttempt.card_ids
  })()

  // Counters let ActionBar detect each new wrong guess and classify it,
  // even when consecutive guesses have the same one_away value.
  const oneAwayCount = gameState.attempts.filter(a => !a.correct && a.one_away).length
  const wrongCount   = gameState.attempts.filter(a => !a.correct).length

  return {
    puzzle,
    gameState,
    isLoading,
    error,
    refetch,
    toggleCard,
    deselectAll,
    submitGuess,
    isPending: guessMutation.isPending,
    lastResult: guessMutation.data,
    guessError,
    oneAwayCount,
    wrongCount,
    isSessionLoading: isAuthenticated ? !sessionSettled : false,
    lastWrongCardIds,
  }
}

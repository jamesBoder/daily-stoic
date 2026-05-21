import apiClient from './api'
import type { ConfluencePuzzle, GuessResult, ConfluenceSession } from '../../types/confluence'

export const confluenceService = {
  getToday: async (): Promise<ConfluencePuzzle> => {
    const { data } = await apiClient.get('/api/games/confluence/today')
    return data
  },

  getByDate: async (date: string): Promise<ConfluencePuzzle> => {
    const { data } = await apiClient.get(`/api/games/confluence/date/${date}`)
    return data
  },

  getSession: async (puzzleId: number): Promise<ConfluenceSession> => {
    const { data } = await apiClient.get(`/api/games/confluence/${puzzleId}/session`)
    return data
  },

  submitGuess: async (puzzleId: number, cardIds: number[]): Promise<GuessResult> => {
    const { data } = await apiClient.post(`/api/games/confluence/${puzzleId}/guess`, {
      card_ids: cardIds,
    })
    return data
  },
}

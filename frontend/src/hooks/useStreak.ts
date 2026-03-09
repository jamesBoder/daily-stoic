// src/hooks/useStreak.ts

import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/api/profile'
import { useAuth } from './useAuth'

export const useStreak = () => {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['streak'],
    queryFn: profileService.getStreak,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,  // re-fetch after 5 min to catch increments
  })
}
import React, { createContext, useContext, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSubscription } from '../services/api/subscription'
import type { SubscriptionTier } from '../types/subscription'
import { useAuth } from '../hooks/useAuth'

interface SubscriptionContextType {
  tier: SubscriptionTier
  isPremium: boolean
  isLoading: boolean
  refetch: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGuest } = useAuth()

  // Query key includes user?.id so it re-fetches on login/logout.
  // Guests and unauthenticated users get tier='free' from the API — no special casing needed.
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subscription', user?.id ?? null],
    queryFn: getSubscription,
    staleTime: 5 * 60 * 1000, // 5 min — matches WoP middleware cache TTL
    retry: false,
    // Guests have no subscription — skip the network call entirely
    enabled: !!user && !isGuest,
  })

  const tier: SubscriptionTier = data?.tier ?? 'free'
  const isPremium = tier === 'lifetime'

  return (
    <SubscriptionContext.Provider value={{ tier, isPremium, isLoading, refetch }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

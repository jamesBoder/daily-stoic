import apiClient from './client'
import type { Subscription, CheckoutSessionResponse } from '../../types/subscription'

export const getSubscription = (): Promise<Subscription> =>
  apiClient.get('/api/subscription').then(r => r.data)

export const createCheckoutSession = (): Promise<CheckoutSessionResponse> =>
  apiClient.post('/api/subscription/checkout').then(r => r.data)

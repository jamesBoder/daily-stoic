import apiClient from './client'
import type { Subscription, CheckoutSessionResponse } from '../../types/subscription'

export const getSubscription = (): Promise<Subscription> =>
  apiClient.get('/subscription').then(r => r.data)

export const createCheckoutSession = (): Promise<CheckoutSessionResponse> =>
  apiClient.post('/subscription/checkout').then(r => r.data)

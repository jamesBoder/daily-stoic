export type SubscriptionTier = 'free' | 'lifetime'

export interface Subscription {
  tier: SubscriptionTier
  status?: string
}

export interface CheckoutSessionResponse {
  url: string
}

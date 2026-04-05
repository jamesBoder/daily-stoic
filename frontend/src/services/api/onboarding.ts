import apiClient from './client'

export interface OnboardingPayload {
  traditions: string[]
  goals: string[]
  daily_reminder: boolean
  email_notifications: boolean
}

export const onboardingApi = {
  complete: (payload: OnboardingPayload) =>
    apiClient.post('/api/onboarding', payload).then(r => r.data),

  reset: () =>
    apiClient.delete('/api/onboarding').then(r => r.data),
}

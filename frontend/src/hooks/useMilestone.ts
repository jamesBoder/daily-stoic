// src/hooks/useMilestone.ts

import { useState, useEffect } from 'react'

const MILESTONE_DAYS = [7, 30] as const
type Milestone = typeof MILESTONE_DAYS[number]

export const useMilestone = (currentStreak?: number) => {
  const [milestone, setMilestone] = useState<Milestone | null>(null)

  useEffect(() => {
    if (!currentStreak) return
    const seen = JSON.parse(localStorage.getItem('seen_milestones') || '[]') as number[]

    for (const day of MILESTONE_DAYS) {
      if (currentStreak >= day && !seen.includes(day)) {
        setMilestone(day)
        return
      }
    }
  }, [currentStreak])

  const dismissMilestone = () => {
    if (!milestone) return
    const seen = JSON.parse(localStorage.getItem('seen_milestones') || '[]') as number[]
    localStorage.setItem('seen_milestones', JSON.stringify([...seen, milestone]))
    setMilestone(null)
  }

  return { milestone, dismissMilestone }
}
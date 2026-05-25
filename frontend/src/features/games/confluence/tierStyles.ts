import type { GroupTier } from '../../../types/confluence'

export const TIER_STYLE: Record<GroupTier, { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-[var(--color-tier-1-bg)]', text: 'text-[var(--color-tier-1)]',  border: 'border-[var(--color-tier-1-border)]' },
  green:  { bg: 'bg-[var(--color-tier-2-bg)]', text: 'text-[var(--color-tier-2)]',  border: 'border-[var(--color-tier-2-border)]' },
  blue:   { bg: 'bg-[var(--color-tier-3-bg)]', text: 'text-[var(--color-tier-3)]',  border: 'border-[var(--color-tier-3-border)]' },
  purple: { bg: 'bg-[var(--color-tier-4-bg)]', text: 'text-[var(--color-tier-4)]',  border: 'border-[var(--color-tier-4-border)]' },
}

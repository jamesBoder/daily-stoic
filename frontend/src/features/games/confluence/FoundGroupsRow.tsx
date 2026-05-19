import { useRef } from 'react'
import type { ConfluenceGroup, GroupTier } from '../../../types/confluence'

const TIER_STYLE: Record<GroupTier, { bg: string; text: string; border: string }> = {
  yellow: { bg: 'bg-amber-900/60',   text: 'text-amber-200',   border: 'border-amber-600/50' },
  green:  { bg: 'bg-emerald-900/60', text: 'text-emerald-200', border: 'border-emerald-600/50' },
  blue:   { bg: 'bg-blue-900/60',    text: 'text-blue-200',    border: 'border-blue-600/50' },
  purple: { bg: 'bg-violet-900/60',  text: 'text-violet-200',  border: 'border-violet-600/50' },
}

interface FoundGroupsRowProps {
  foundGroups: ConfluenceGroup[]
}

export function FoundGroupsRow({ foundGroups }: FoundGroupsRowProps) {
  // Groups present on first render (restored session) appear immediately without animation.
  // Groups added while the component is mounted slide in normally.
  const mountedIds = useRef<Set<number>>(new Set(foundGroups.map(g => g.id)))

  if (foundGroups.length === 0) return null

  return (
    <div className="flex flex-col gap-2 mb-3">
      {foundGroups.map(group => {
        const style = TIER_STYLE[group.tier]
        const isNew = !mountedIds.current.has(group.id)
        if (isNew) mountedIds.current.add(group.id)

        return (
          <div
            key={group.id}
            className={[
              'rounded-lg border px-3 py-2.5',
              isNew ? 'animate-slide-down' : '',
              style.bg,
              style.border,
            ].filter(Boolean).join(' ')}
          >
            <p className={`font-display text-[10px] tracking-widest uppercase mb-1 ${style.text}`}>
              {group.label}
            </p>
            <p className="font-serif text-xs text-stone-300 italic leading-relaxed">
              {group.cards.map(c => c.concept?.name ?? '').filter(Boolean).join(' · ')}
            </p>
          </div>
        )
      })}
    </div>
  )
}

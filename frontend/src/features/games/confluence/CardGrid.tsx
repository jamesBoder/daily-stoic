import { useEffect, useMemo, useRef, useState } from 'react'
import { ConfluenceCard } from './ConfluenceCard'
import type { ConfluencePuzzle, LocalGameState, ConfluenceCard as ConfluenceCardType } from '../../../types/confluence'

// Deterministic Fisher-Yates shuffle seeded by puzzle ID.
// Same puzzle always produces the same card order — safe for session restore.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr]
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0  // LCG
    const j = s % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

interface CardGridProps {
  puzzle: ConfluencePuzzle
  gameState: LocalGameState
  onTap: (id: number) => void
  onInsight: (id: number) => void
  lastWrongCardIds: number[]
  gameOver?: boolean
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 w-full">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[5/7] rounded-xl bg-[var(--color-game-bg)] animate-pulse"
        />
      ))}
    </div>
  )
}

export function CardGrid({ puzzle, gameState, onTap, onInsight, lastWrongCardIds, gameOver = false }: CardGridProps) {
  const [shakingIds, setShakingIds] = useState<Set<number>>(new Set())
  const prevWrongKey = useRef('')
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (lastWrongCardIds.length > 0) {
      const key = [...lastWrongCardIds].sort().join(',')
      if (key !== prevWrongKey.current) {
        prevWrongKey.current = key
        setShakingIds(new Set(lastWrongCardIds))
        if (shakeTimer.current) clearTimeout(shakeTimer.current)
        shakeTimer.current = setTimeout(() => setShakingIds(new Set()), 450)
      }
    }
    return () => { if (shakeTimer.current) clearTimeout(shakeTimer.current) }
  }, [lastWrongCardIds])

  // Flatten all cards and shuffle once per puzzle — same order on every render.
  const allCards = useMemo<ConfluenceCardType[]>(
    () => seededShuffle(puzzle.groups.flatMap(g => g.cards), puzzle.id),
    [puzzle.id]  // eslint-disable-line react-hooks/exhaustive-deps
  )

  const lockedCardIds = new Set(
    puzzle.groups
      .filter(g => gameState.foundGroupIds.includes(g.id))
      .flatMap(g => g.cards.map(c => c.id))
  )

  // Show only unfound cards — compact grid after each correct guess
  const visibleCards = allCards.filter(c => !lockedCardIds.has(c.id))
  const cols = Math.max(1, visibleCards.length <= 4 ? visibleCards.length : 4)
  const anySelected = gameState.selectedCardIds.size > 0

  return (
    <div
      className="grid gap-1.5 sm:gap-2 lg:gap-3 w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {visibleCards.map(card => (
        <ConfluenceCard
          key={card.id}
          card={card}
          isSelected={gameState.selectedCardIds.has(card.id)}
          isAnySelected={anySelected}
          isShaking={shakingIds.has(card.id)}
          isLocked={gameOver}
          onTap={onTap}
          onInsight={onInsight}
        />
      ))}
    </div>
  )
}

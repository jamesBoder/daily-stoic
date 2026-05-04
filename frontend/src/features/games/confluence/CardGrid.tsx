import { useEffect, useRef, useState } from 'react'
import { ConfluenceCard } from './ConfluenceCard'
import type { ConfluencePuzzle, LocalGameState } from '../../../types/confluence'

interface CardGridProps {
  puzzle: ConfluencePuzzle
  gameState: LocalGameState
  onTap: (id: number) => void
  lastWrongCardIds: number[]
}

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3 w-full">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[11/19] rounded-lg bg-stone-800 animate-pulse"
        />
      ))}
    </div>
  )
}

export function CardGrid({ puzzle, gameState, onTap, lastWrongCardIds }: CardGridProps) {
  const [shakingIds, setShakingIds] = useState<Set<number>>(new Set())
  const prevWrongKey = useRef('')

  useEffect(() => {
    if (lastWrongCardIds.length > 0) {
      const key = [...lastWrongCardIds].sort().join(',')
      if (key !== prevWrongKey.current) {
        prevWrongKey.current = key
        setShakingIds(new Set(lastWrongCardIds))
        setTimeout(() => setShakingIds(new Set()), 450)
      }
    }
  }, [lastWrongCardIds])

  // Flatten all cards from all groups, excluding already-found groups
  const allCards = puzzle.groups.flatMap(g => g.cards)
  const lockedCardIds = new Set(
    puzzle.groups
      .filter(g => gameState.foundGroupIds.includes(g.id))
      .flatMap(g => g.cards.map(c => c.id))
  )

  // Show only unfound cards — compact grid after each correct guess
  const visibleCards = allCards.filter(c => !lockedCardIds.has(c.id))
  const cols = visibleCards.length <= 4 ? visibleCards.length : 4

  return (
    <div
      className="grid gap-1.5 sm:gap-2 lg:gap-3 w-full"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {visibleCards.map(card => (
        <ConfluenceCard
          key={card.id}
          card={card}
          isFlipped={gameState.flippedCardIds.has(card.id)}
          isSelected={gameState.selectedCardIds.has(card.id)}
          isShaking={shakingIds.has(card.id)}
          isLocked={false}
          onTap={onTap}
        />
      ))}
    </div>
  )
}

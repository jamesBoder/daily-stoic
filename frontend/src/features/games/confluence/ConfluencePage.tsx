import { useEffect, useRef, useState } from 'react'
import { useConfluence } from '../../../hooks/useConfluence'
import { CardGrid, CardGridSkeleton } from './CardGrid'
import { FoundGroupsRow } from './FoundGroupsRow'
import { ActionBar } from './ActionBar'
import { ConvergenceReveal } from './ConvergenceReveal'
import type { ConfluenceGroup, PuzzleArchetype } from '../../../types/confluence'

const ARCHETYPE_LABEL: Record<PuzzleArchetype, string> = {
  convergence: 'Convergence',
  name_change:  'Name Change',
  inversion:    'Inversion',
  lineage:      'Lineage',
  paradox:      'Paradox',
}

export function ConfluencePage() {
  const {
    puzzle,
    gameState,
    isLoading,
    isSessionLoading,
    error,
    toggleCard,
    deselectAll,
    submitGuess,
    isPending,
    guessError,
    oneAwayCount,
    wrongCount,
    refetch,
    lastWrongCardIds,
  } = useConfluence()

  // ── Convergence Reveal (purple group) ────────────────────────────
  const [convergenceGroup, setConvergenceGroup] = useState<ConfluenceGroup | null>(null)
  const prevGroupCountRef = useRef(0)

  useEffect(() => {
    const count = gameState.foundGroupIds.length
    if (count > prevGroupCountRef.current) {
      const added = count - prevGroupCountRef.current
      prevGroupCountRef.current = count
      // Only trigger on a single new group — bulk additions are session restores
      if (added === 1) {
        // Check the NEWLY ADDED group — not any purple in foundGroups.
        // Once purple is found it stays in foundGroups forever; searching
        // the whole array would re-trigger the reveal on every subsequent guess.
        const newGroupId = gameState.foundGroupIds[gameState.foundGroupIds.length - 1]
        const newGroup = gameState.foundGroups.find(g => g.id === newGroupId)
        if (newGroup?.tier === 'purple') {
          setConvergenceGroup(newGroup)
        }
      }
    }
  }, [gameState.foundGroupIds, gameState.foundGroups])

  // Puzzle not yet loaded — show full page skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">
          <div className="lg:w-72 lg:flex-shrink-0 mb-6 lg:mb-0">
            <div className="h-3 w-28 bg-stone-800 rounded animate-pulse mb-3" />
            <div className="h-8 w-56 bg-stone-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-44 bg-stone-800 rounded animate-pulse mb-6" />
            <div className="h-3 w-20 bg-stone-800 rounded animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <CardGridSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error || !puzzle) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-24 text-center">
        <p className="font-serif text-stone-400 italic text-lg leading-relaxed">
          No puzzle today — the philosophers are still deliberating.
          <br />Check back tomorrow.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 text-sm text-stone-500 underline underline-offset-2 hover:text-stone-300 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const puzzleDate = new Date(puzzle.date).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })

  const gameOver = gameState.status === 'complete' || gameState.status === 'failed'

  return (
    <>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
      <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start">

        {/* ── Info panel ── */}
        <div className="lg:w-72 lg:flex-shrink-0 mb-6 lg:mb-0 lg:sticky lg:top-8">
          <p className="font-display text-[10px] tracking-widest text-stone-500 uppercase mb-2">
            {puzzleDate}
          </p>

          <h1 className="font-display text-2xl lg:text-3xl text-stone-100 tracking-wide leading-tight mb-3">
            {puzzle.title}
          </h1>

          <div className="w-8 h-px bg-stone-700 mb-4" />

          <p className="font-serif text-sm text-stone-400 italic leading-relaxed mb-6">
            Sixteen cards. Four hidden connections across traditions.
            Find them all.
          </p>

          {/* Archetype badge */}
          <span className="inline-block font-display text-[10px] tracking-widest uppercase px-2.5 py-1 rounded border border-stone-700 text-stone-500">
            {ARCHETYPE_LABEL[puzzle.archetype]}
          </span>

          {/* Major Arcana indicator */}
          {puzzle.is_major_arcana && (
            <p className="mt-3 font-display text-[10px] tracking-widest text-star-gold uppercase">
              ✦ Major Arcana
            </p>
          )}

          {/* Game over message — desktop only (mobile shows inline) */}
          {gameOver && (
            <p className="hidden lg:block mt-6 font-serif text-sm italic text-stone-400">
              {gameState.status === 'complete'
                ? 'Confluence achieved.'
                : 'The philosophers remain divided.'}
            </p>
          )}
        </div>

        {/* ── Game area ──
            While the server session loads (isSessionLoading), the info panel above is
            already visible. Only the grid area skeletons — consistent with the spec. */}
        <div className="flex-1 min-w-0">

          {isSessionLoading ? (
            <CardGridSkeleton />
          ) : (
            <>
              <FoundGroupsRow foundGroups={gameState.foundGroups} />

              <CardGrid
                puzzle={puzzle}
                gameState={gameState}
                onTap={toggleCard}
                lastWrongCardIds={lastWrongCardIds}
                gameOver={gameOver}
              />

              <ActionBar
                selectedCount={gameState.selectedCardIds.size}
                attemptsRemaining={gameState.attemptsRemaining}
                isPending={isPending}
                guessError={guessError}
                oneAwayCount={oneAwayCount}
                wrongCount={wrongCount}
                gameOver={gameOver}
                onSubmit={submitGuess}
                onDeselect={deselectAll}
              />

              {/* Game over message — mobile */}
              {gameOver && (
                <p className="lg:hidden mt-6 text-center font-serif text-sm italic text-stone-400">
                  {gameState.status === 'complete'
                    ? 'Confluence achieved.'
                    : 'The philosophers remain divided.'}
                </p>
              )}
            </>
          )}
        </div>

      </div>
    </div>

    <ConvergenceReveal
      group={convergenceGroup}
      isOpen={!!convergenceGroup}
      onClose={() => setConvergenceGroup(null)}
    />
    </>
  )
}

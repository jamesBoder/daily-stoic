import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import type { ConfluencePuzzle, LocalGameState, GroupTier } from '../../../types/confluence'
import { ShareBlock } from './ShareBlock'
import { TIER_STYLE } from './tierStyles'

const TIER_ORDER: GroupTier[] = ['yellow', 'green', 'blue', 'purple']

interface ResultModalProps {
  puzzle: ConfluencePuzzle
  gameState: LocalGameState
  isOpen: boolean
  onClose: () => void
}

export function ResultModal({ puzzle, gameState, isOpen, onClose }: ResultModalProps) {
  const isComplete = gameState.status === 'complete'

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen) return null

  // Sort groups in canonical tier order for the reveal
  const sortedGroups = [...puzzle.groups].sort(
    (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  )

  const foundGroupIds = new Set(gameState.foundGroupIds)

  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-modal-title"
        className={[
          'relative z-10 w-full sm:max-w-md bg-[var(--color-game-surface)] border border-[var(--color-game-border)]',
          'sm:rounded-xl rounded-t-2xl',
          'max-h-[92dvh] overflow-y-auto',
          'animate-modal-rise',
        ].join(' ')}
        style={{ padding: '1.5rem' }}
      >

        {/* Header */}
        <div className="text-center mb-6">
          {isComplete ? (
            <>
              <p className="font-display text-[10px] tracking-widest uppercase text-[var(--color-tier-4)] mb-2">
                ✦ Complete
              </p>
              <h2 id="result-modal-title" className="font-display text-xl text-[var(--color-game-fg)] tracking-wide">
                Confluence achieved.
              </h2>
              {gameState.purpleFirstTry && (
                <p className="mt-1 font-serif text-xs italic text-[var(--color-tier-4)]">
                  Purple found first — rare mastery.
                </p>
              )}
              {gameState.noMistakes && (
                <p className="mt-1 font-serif text-xs italic text-[var(--color-game-fg-muted)]">
                  No mistakes.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="font-display text-[10px] tracking-widest uppercase text-[var(--color-game-fg-dim)] mb-2">
                Game over
              </p>
              <h2 id="result-modal-title" className="font-display text-xl text-[var(--color-game-fg-muted)] tracking-wide">
                The philosophers remain divided.
              </h2>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-[var(--color-game-border)] mx-auto mb-5" />

        {/* Group reveal — all 4 in tier order */}
        <div className="flex flex-col gap-2 mb-2">
          {sortedGroups.map(group => {
            const style = TIER_STYLE[group.tier]
            const wasFound = foundGroupIds.has(group.id)
            return (
              <div
                key={group.id}
                className={[
                  'rounded-lg border px-3 py-2.5',
                  style.bg,
                  style.border,
                  !wasFound ? 'opacity-60' : '',
                ].filter(Boolean).join(' ')}
              >
                <p className={`font-display text-[10px] tracking-widest uppercase mb-1 ${style.text}`}>
                  {group.label}
                </p>
                <p className="font-serif text-xs text-[var(--color-game-fg-muted)] italic leading-relaxed">
                  {group.cards.map(c => c.concept?.name ?? '').filter(Boolean).join(' · ')}
                </p>
              </div>
            )
          })}
        </div>

        {/* Share block */}
        <ShareBlock attempts={gameState.attempts} puzzle={puzzle} />

        {/* Close button */}
        <div className="mt-5 flex justify-center">
          <button
            onClick={onClose}
            className="font-display text-[10px] tracking-widest uppercase px-6 py-2 rounded-full
                       border border-[var(--color-game-border)] text-[var(--color-game-fg-dim)]
                       hover:border-[var(--color-game-fg-dim)] hover:text-[var(--color-game-fg-muted)]
                       transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}

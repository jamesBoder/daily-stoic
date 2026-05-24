import { useState } from 'react'
import type { GuessAttempt, ConfluencePuzzle, GroupTier } from '../../../types/confluence'

type CopyState = 'idle' | 'copied' | 'failed'

const TIER_EMOJI: Record<GroupTier, string> = {
  yellow: '🟡',
  green:  '🟢',
  blue:   '🔵',
  purple: '🟣',
}

function buildEmojiGrid(attempts: GuessAttempt[], puzzle: ConfluencePuzzle): string {
  const cardToTier = new Map<number, GroupTier>()
  puzzle.groups.forEach(g => g.cards.forEach(c => cardToTier.set(c.id, g.tier)))

  const lines = attempts.map(attempt => {
    if (attempt.correct && attempt.tier) {
      return TIER_EMOJI[attempt.tier].repeat(4)
    }
    return attempt.card_ids.map(id => {
      const tier = cardToTier.get(id)
      return tier ? TIER_EMOJI[tier] : '⬜'
    }).join('')
  })

  const date = new Date(puzzle.date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })

  const tagline = attempts.some(a => a.correct && a.tier === 'purple')
    ? '\nFour traditions. One truth.'
    : ''

  return [`Confluence — ${date}`, ...lines].join('\n') + tagline
}

interface ShareBlockProps {
  attempts: GuessAttempt[]
  puzzle: ConfluencePuzzle
}

export function ShareBlock({ attempts, puzzle }: ShareBlockProps) {
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const grid = buildEmojiGrid(attempts, puzzle)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(grid)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Clipboard API blocked (non-HTTPS, permissions denied, iOS WebView).
      // The <pre> has select-all so the user can copy manually.
      setCopyState('failed')
      setTimeout(() => setCopyState('idle'), 3000)
    }
  }

  const COPY_LABEL: Record<CopyState, string> = {
    idle:   'Copy result',
    copied: 'Copied ✓',
    failed: 'Select text above to copy',
  }

  return (
    <div className="mt-6 border-t border-[var(--color-game-border)] pt-5">
      <pre className="font-sans text-base leading-snug tracking-wider whitespace-pre text-center mb-4 select-all">
        {grid}
      </pre>
      <div className="flex justify-center">
        <button
          onClick={handleCopy}
          className={[
            'font-display text-[10px] tracking-widest uppercase px-5 py-2 rounded border transition-colors duration-200',
            copyState === 'copied'
              ? 'border-[var(--color-tier-4-border)] text-[var(--color-tier-4)]'
              : copyState === 'failed'
                ? 'border-[var(--color-danger,#ef4444)] text-[var(--color-danger,#ef4444)]'
                : 'border-[var(--color-game-border)] text-[var(--color-game-fg-dim)] hover:border-[var(--color-game-fg-dim)] hover:text-[var(--color-game-fg-muted)]',
          ].join(' ')}
        >
          {COPY_LABEL[copyState]}
        </button>
      </div>
    </div>
  )
}

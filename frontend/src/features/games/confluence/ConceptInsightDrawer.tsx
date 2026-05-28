import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import type { ConfluenceCard } from '../../../types/confluence'

interface Props {
  card: ConfluenceCard
  onClose: () => void
}

export function ConceptInsightDrawer({ card, onClose }: Props) {
  const { concept } = card
  const artHue = (card.id * 137) % 360
  const artBg = `hsl(${artHue}, var(--color-game-art-s, 42%), var(--color-game-art-l, 11%))`
  const hasCodex = !!concept.codex_in_tradition

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Escape key dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Swipe-to-dismiss
  const touchStartY = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0].clientY - touchStartY.current > 80) onClose()
  }

  const content = (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      {/* Scrim — semi-transparent so the game remains visible */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="insight-drawer-title"
        className={[
          'relative w-full sm:max-w-lg',
          'rounded-t-2xl sm:rounded-2xl',
          'max-h-[75dvh] sm:max-h-[80vh]',
          'overflow-y-auto',
          'border-t border-x border-[var(--color-game-border)] sm:border',
          'animate-modal-rise',
        ].join(' ')}
        style={{ background: 'var(--color-game-surface)' }}
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {/* Swipe handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className="w-10 h-1 rounded-full opacity-60"
            style={{ backgroundColor: 'var(--color-game-border)' }}
          />
        </div>

        {/* Close button — 44px on mobile, 32px on desktop */}
        <button
          onClick={onClose}
          aria-label="Close insight"
          className="absolute top-3 right-3 w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded
                     transition-colors"
          style={{ color: 'var(--color-game-fg-dim)' }}
        >
          <span className="text-xl leading-none select-none">×</span>
        </button>

        {/* Content — two columns on desktop, stacked on mobile */}
        <div className="flex flex-col sm:flex-row sm:gap-6 px-5 pb-6 pt-3 sm:pt-6">

          {/* Art swatch — left column, desktop only */}
          <div
            className="hidden sm:block sm:w-28 sm:flex-shrink-0 rounded-xl"
            style={{ backgroundColor: artBg, minHeight: '9rem' }}
          />

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h2
              id="insight-drawer-title"
              className="font-display text-xl sm:text-2xl tracking-wide leading-tight mb-1"
              style={{ color: 'var(--color-game-fg)' }}
            >
              {concept.name}
            </h2>
            <p
              className="font-serif text-sm italic leading-relaxed mb-4"
              style={{ color: 'var(--color-game-fg-muted)' }}
            >
              {concept.short_phrase}
            </p>

            <div
              className="w-full h-px mb-4"
              style={{ backgroundColor: 'var(--color-game-border)', opacity: 0.5 }}
            />

            {hasCodex ? (
              <>
                <p
                  className="font-sans text-sm leading-relaxed mb-4"
                  style={{ color: 'var(--color-game-fg)' }}
                >
                  {concept.codex_in_tradition}
                </p>

                {concept.codex_echoes && (
                  <div className="mb-4">
                    <p
                      className="font-display text-[10px] tracking-widest uppercase mb-2"
                      style={{ color: 'var(--color-game-fg-dim)' }}
                    >
                      Echoes
                    </p>
                    <p
                      className="font-sans text-sm leading-relaxed"
                      style={{ color: 'var(--color-game-fg-muted)' }}
                    >
                      {concept.codex_echoes}
                    </p>
                  </div>
                )}

                {concept.codex_question && (
                  <blockquote
                    className="border-l-2 pl-4"
                    style={{ borderColor: 'var(--color-game-border)' }}
                  >
                    <p
                      className="font-serif text-sm italic leading-relaxed"
                      style={{ color: 'var(--color-game-fg-muted)' }}
                    >
                      ❝ {concept.codex_question} ❞
                    </p>
                  </blockquote>
                )}
              </>
            ) : (
              <p
                className="font-serif text-sm italic leading-relaxed"
                style={{ color: 'var(--color-game-fg-dim)' }}
              >
                This concept comes from {concept.tradition?.name ?? 'an ancient tradition'}.
                Full insight is being written — check back soon.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

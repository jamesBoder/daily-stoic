// src/features/gamification/MilestoneModal.tsx

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  milestone: 7 | 30
  onClose: () => void
}

const MILESTONES = {
  7: {
    icon: '🔥',
    heading: 'Seven Days',
    subheading: 'A week of practice.',
    body: 'Marcus Aurelius wrote the Meditations over years of daily practice. You have begun yours.',
    cta: 'Continue',
  },
  30: {
    icon: '⚡',
    heading: 'Thirty Days',
    subheading: 'A month of discipline.',
    body: '"Habit is second nature." The ancients knew what neuroscience confirms: thirty days reshapes a mind.',
    cta: 'Onward',
  },
}

export const MilestoneModal = ({ milestone, onClose }: Props) => {
  const config = MILESTONES[milestone]
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onMouseDown={e => { if (e.target === backdropRef.current) onClose() }}
    >
      {/* Confetti layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="absolute inline-block w-2 h-2 rounded-full bg-accent animate-confetti-fall"
            style={{
              left: `${10 + i * 11}%`,
              top: '-10px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1.0 + i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Modal card */}
      <div
        className="animate-milestone-burst relative w-full max-w-sm rounded-modal shadow-modal text-center p-10"
        style={{
          background: 'var(--color-surface-modal)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div className="text-5xl mb-6 animate-flame-pulse inline-block">
          {config.icon}
        </div>

        <h2 className="font-display text-2xl tracking-wide mb-1 text-fg">
          {config.heading}
        </h2>
        <p className="font-display text-sm uppercase tracking-widest text-accent dark:text-accent mb-6">
          {config.subheading}
        </p>

        <p className="font-serif text-base leading-relaxed mb-8 italic text-fg-muted">
          &ldquo;{config.body}&rdquo;
        </p>

        <button
          onClick={onClose}
          className="w-full font-sans text-sm font-semibold rounded-stone px-8 py-3 transition-colors
                     text-accent-text bg-accent hover:bg-accent-dark"
        >
          {config.cta}
        </button>
      </div>
    </div>,
    document.body
  )
}

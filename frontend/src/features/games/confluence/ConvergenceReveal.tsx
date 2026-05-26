import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ConfluenceGroup } from '../../../types/confluence'
import { useAuth } from '../../../hooks/useAuth'
import { TRADITION_COLORS } from '../../traditions/constants'

type RevealPhase = 'hidden' | 'backdrop' | 'drift' | 'pulse' | 'merge' | 'text' | 'actions'

const PHASE_ORDER: RevealPhase[] = ['hidden', 'backdrop', 'drift', 'pulse', 'merge', 'text', 'actions']
const atLeast = (current: RevealPhase, target: RevealPhase) =>
  PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target)

// Per-tradition sigils — mirrors ConfluenceCard. Colors derive from TRADITION_COLORS[slug].dark.
const TRAD: Record<string, { sigil: string }> = {
  stoicism:                 { sigil: 'Λ' },
  hermeticism:              { sigil: '☿' },
  neoplatonism:             { sigil: '◎' },
  gnosticism:               { sigil: '⊕' },
  kabbalah:                 { sigil: '✡' },
  pythagoreanism:           { sigil: '△' },
  'pre-socratic':           { sigil: '≋' },
  'african-philosophy':     { sigil: '☽' },
  'renaissance-philosophy': { sigil: 'Φ' },
  transcendentalism:        { sigil: '☀' },
  buddhism:                 { sigil: '☸' },
  taoism:                   { sigil: '☯' },
  vedanta:                  { sigil: 'ॐ' },
  existentialism:           { sigil: '∅' },
  'kemetic-wisdom':         { sigil: '𓂀' },
}
const FALLBACK = { sigil: '✦' }
const PURPLE_COLOR = 'var(--color-tier-4)'
const PURPLE_GLOW  = 'var(--color-convergence-glow)'

interface Props {
  group: ConfluenceGroup | null
  isOpen: boolean
  onClose: () => void
}

export function ConvergenceReveal({ group, isOpen, onClose }: Props) {
  const [phase, setPhase] = useState<RevealPhase>('hidden')
  const { isAuthenticated } = useAuth()

  // Drive the animation sequence
  useEffect(() => {
    if (!isOpen || !group) {
      setPhase('hidden')
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPhase('actions')
      return
    }
    const timers = [
      setTimeout(() => setPhase('backdrop'),  0),
      setTimeout(() => setPhase('drift'),    150),
      setTimeout(() => setPhase('pulse'),    750),
      setTimeout(() => setPhase('merge'),   1150),
      setTimeout(() => setPhase('text'),    1900),
      setTimeout(() => setPhase('actions'), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [isOpen, group])

  // ESC only works once actions are visible
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && atLeast(phase, 'actions')) onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, phase, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [isOpen])

  if (!isOpen || !group || phase === 'hidden') return null

  const merged      = atLeast(phase, 'merge')
  const showText    = atLeast(phase, 'text')
  const showActions = atLeast(phase, 'actions')
  const showDrift   = atLeast(phase, 'drift')
  const isPulsing   = phase === 'pulse'

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center px-6"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundColor: atLeast(phase, 'backdrop') ? 'var(--color-game-reveal-bg)' : 'transparent',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
        onClick={showActions ? onClose : undefined}
      />

      {/* Central panel */}
      <div className="relative z-10 text-center w-full max-w-sm">

        {/* The 4 concept mini-cards */}
        <div className="flex justify-center gap-2.5 mb-10">
          {group.cards.map((card, i) => {
            const slug        = card.concept.tradition?.slug ?? ''
            const cfg         = TRAD[slug] ?? FALLBACK
            const tradColor   = TRADITION_COLORS[slug]?.dark ?? 'var(--color-game-fg-muted)'
            const borderColor = merged ? PURPLE_COLOR : tradColor
            const sigilColor  = merged ? PURPLE_COLOR : tradColor

            return (
              <div
                key={card.id}
                className={[
                  'w-[3.25rem] rounded-lg border-2 flex flex-col items-center justify-center py-3 gap-1',
                  'bg-[var(--color-game-surface)]',
                  showDrift ? 'animate-convergence-drift' : 'opacity-0',
                  isPulsing ? 'animate-border-pulse' : '',
                ].filter(Boolean).join(' ')}
                style={{
                  borderColor,
                  boxShadow: merged ? PURPLE_GLOW : undefined,
                  animationDelay: showDrift ? `${i * 70}ms` : undefined,
                  transition: 'border-color 0.6s ease, box-shadow 0.6s ease',
                }}
              >
                <span className="text-lg leading-none" style={{ color: sigilColor, transition: 'color 0.6s ease' }}>
                  {cfg.sigil}
                </span>
                <p className="font-serif text-[7px] text-[var(--color-game-fg-muted)] italic px-1 text-center leading-tight line-clamp-3">
                  {card.concept.name}
                </p>
              </div>
            )
          })}
        </div>

        {/* Group label + horizontal rule */}
        <div
          className="transition-opacity duration-700"
          style={{ opacity: showText ? 1 : 0 }}
        >
          <p className="font-display text-[10px] tracking-widest uppercase text-[var(--color-tier-4)] mb-2">
            {group.label}
          </p>
          <div className="w-8 h-px bg-[var(--color-tier-4-border)] mx-auto mb-5" />
        </div>

        {/* Convergence teaching (or anonymous CTA) */}
        <div
          className="transition-opacity duration-700"
          style={{ opacity: showText ? 1 : 0, transitionDelay: showText ? '200ms' : '0ms' }}
        >
          {group.convergence_teaching ? (
            isAuthenticated ? (
              <p className="font-serif text-sm text-[var(--color-game-reveal-text)] italic leading-relaxed">
                {group.convergence_teaching}
              </p>
            ) : (
              <div className="space-y-4">
                <p className="font-serif text-sm text-[var(--color-game-reveal-text)] italic leading-relaxed">
                  Sign in to read the full cross-tradition teaching.
                </p>
                <Link
                  to="/auth/login"
                  onClick={onClose}
                  className="inline-block font-display text-[10px] tracking-widest uppercase
                             px-4 py-1.5 rounded border border-[var(--color-tier-4-border)] text-[var(--color-tier-4)]
                             hover:border-[var(--color-tier-4)] hover:text-[var(--color-tier-4)] transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )
          ) : (
            // Fallback if teaching text is missing (shouldn't happen in normal data)
            <p className="font-serif text-sm text-[var(--color-game-reveal-text)] italic">
              The traditions converge.
            </p>
          )}
        </div>

        {/* Continue button */}
        <div
          className="mt-10 transition-opacity duration-500"
          style={{ opacity: showActions ? 1 : 0 }}
        >
          <button
            disabled={!showActions}
            onClick={onClose}
            className="font-display text-xs tracking-widest uppercase px-7 py-2.5 rounded-full
                       bg-[var(--color-game-fg)] text-[var(--color-game-bg)] hover:bg-[var(--color-game-fg)] transition-colors
                       disabled:pointer-events-none"
          >
            Continue
          </button>
        </div>

      </div>
    </div>,
    document.body
  )
}

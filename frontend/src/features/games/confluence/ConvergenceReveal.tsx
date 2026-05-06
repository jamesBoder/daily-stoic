import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ConfluenceGroup } from '../../../types/confluence'
import { useAuth } from '../../../hooks/useAuth'

type RevealPhase = 'hidden' | 'backdrop' | 'drift' | 'pulse' | 'merge' | 'text' | 'actions'

const PHASE_ORDER: RevealPhase[] = ['hidden', 'backdrop', 'drift', 'pulse', 'merge', 'text', 'actions']
const atLeast = (current: RevealPhase, target: RevealPhase) =>
  PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target)

// Per-tradition border color (hex) + sigil — mirrors ConfluenceCard's TRADITION_CONFIG
const TRAD: Record<string, { color: string; sigil: string }> = {
  stoicism:                 { color: '#64748b', sigil: 'Λ' },
  hermeticism:              { color: '#ca8a04', sigil: '☿' },
  neoplatonism:             { color: '#8b5cf6', sigil: '◎' },
  gnosticism:               { color: '#dc2626', sigil: '⊕' },
  kabbalah:                 { color: '#2563eb', sigil: '✡' },
  pythagoreanism:           { color: '#059669', sigil: '△' },
  'pre-socratic':           { color: '#d97706', sigil: '≋' },
  'african-philosophy':     { color: '#ea580c', sigil: '☽' },
  'renaissance-philosophy': { color: '#be185d', sigil: 'Φ' },
  transcendentalism:        { color: '#16a34a', sigil: '☀' },
  buddhism:                 { color: '#f59e0b', sigil: '☸' },
  taoism:                   { color: '#0d9488', sigil: '☯' },
  vedanta:                  { color: '#f97316', sigil: 'ॐ' },
  existentialism:           { color: '#71717a', sigil: '∅' },
  'kemetic-wisdom':         { color: '#eab308', sigil: '𓂀' },
}
const FALLBACK = { color: '#78716c', sigil: '✦' }
const PURPLE_COLOR = '#7c3aed'
const PURPLE_GLOW  = '0 0 16px 4px rgba(124, 58, 237, 0.45)'

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
          backgroundColor: atLeast(phase, 'backdrop') ? 'rgba(0,0,0,0.87)' : 'rgba(0,0,0,0)',
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
            const slug = card.concept.tradition?.slug ?? ''
            const cfg  = TRAD[slug] ?? FALLBACK
            const borderColor = merged ? PURPLE_COLOR : cfg.color
            const sigilColor  = merged ? '#a78bfa' : cfg.color

            return (
              <div
                key={card.id}
                className={[
                  'w-[3.25rem] rounded-lg border-2 flex flex-col items-center justify-center py-3 gap-1',
                  'bg-stone-900/90',
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
                <p className="font-serif text-[7px] text-stone-400 italic px-1 text-center leading-tight line-clamp-3">
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
          <p className="font-display text-[10px] tracking-widest uppercase text-violet-400 mb-2">
            {group.label}
          </p>
          <div className="w-8 h-px bg-violet-700/50 mx-auto mb-5" />
        </div>

        {/* Convergence teaching (or anonymous CTA) */}
        <div
          className="transition-opacity duration-700"
          style={{ opacity: showText ? 1 : 0, transitionDelay: showText ? '200ms' : '0ms' }}
        >
          {group.convergence_teaching ? (
            isAuthenticated ? (
              <p className="font-serif text-sm text-stone-300 italic leading-relaxed">
                {group.convergence_teaching}
              </p>
            ) : (
              <div className="space-y-4">
                <p className="font-serif text-sm text-stone-400 italic leading-relaxed">
                  Sign in to read the full cross-tradition teaching.
                </p>
                <Link
                  to="/auth/login"
                  onClick={onClose}
                  className="inline-block font-display text-[10px] tracking-widest uppercase
                             px-4 py-1.5 rounded border border-violet-700/50 text-violet-400
                             hover:border-violet-600 hover:text-violet-300 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )
          ) : (
            // Fallback if teaching text is missing (shouldn't happen in normal data)
            <p className="font-serif text-sm text-stone-500 italic">
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
                       bg-stone-100 text-stone-900 hover:bg-white transition-colors
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

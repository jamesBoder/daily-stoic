import type { ConfluenceCard as ConfluenceCardType, GroupTier } from '../../../types/confluence'
import { TRADITION_COLORS } from '../../traditions/constants'

// Per-tradition sigil + background. Border/glow derive from TRADITION_COLORS via --trad-color.
// Λ = Lambda, the Logos — rational divine fire at the heart of Stoic cosmology
// Φ = Phi, the golden ratio — emblem of Renaissance humanism and classical proportion
const TRADITION_CONFIG: Record<string, { sigil: string; bgClass: string }> = {
  stoicism:               { sigil: 'Λ',  bgClass: 'bg-slate-900' },
  hermeticism:            { sigil: '☿',  bgClass: 'bg-yellow-950' },
  neoplatonism:           { sigil: '◎',  bgClass: 'bg-violet-950' },
  gnosticism:             { sigil: '⊕',  bgClass: 'bg-red-950' },
  kabbalah:               { sigil: '✡',  bgClass: 'bg-blue-950' },
  pythagoreanism:         { sigil: '△',  bgClass: 'bg-emerald-950' },
  'pre-socratic':         { sigil: '≋',  bgClass: 'bg-amber-950' },
  'african-philosophy':   { sigil: '☽',  bgClass: 'bg-orange-950' },
  'renaissance-philosophy': { sigil: 'Φ', bgClass: 'bg-rose-950' },
  transcendentalism:      { sigil: '☀',  bgClass: 'bg-green-950' },
  buddhism:               { sigil: '☸',  bgClass: 'bg-amber-950' },
  taoism:                 { sigil: '☯',  bgClass: 'bg-teal-950' },
  vedanta:                { sigil: 'ॐ',  bgClass: 'bg-orange-950' },
  existentialism:         { sigil: '∅',  bgClass: 'bg-zinc-900' },
  'kemetic-wisdom':       { sigil: '𓂀', bgClass: 'bg-yellow-950' },
}

const FALLBACK_CONFIG = { sigil: '✦', bgClass: 'bg-[var(--color-game-bg)]' }

interface ConfluenceCardProps {
  card: ConfluenceCardType
  isFlipped: boolean
  isSelected: boolean
  isShaking: boolean
  isLocked: boolean
  lockedTier?: GroupTier
  onTap: (id: number) => void
}

export function ConfluenceCard({ card, isFlipped, isSelected, isShaking, isLocked, onTap }: ConfluenceCardProps) {
  const tradSlug  = card.concept.tradition?.slug ?? ''
  const cfg       = TRADITION_CONFIG[tradSlug] ?? FALLBACK_CONFIG
  const tradColor = TRADITION_COLORS[tradSlug]?.dark ?? 'var(--color-game-fg-muted)'

  return (
    <div
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={isFlipped ? `${card.concept.name} — ${card.concept.tradition?.name ?? 'Unknown'}` : 'Face-down card'}
      aria-disabled={isLocked}
      className={[
        'relative aspect-[11/19] cursor-pointer select-none',
        'transition-transform duration-150',
        isSelected && !isLocked ? 'scale-[1.04] -translate-y-1' : '',
        isShaking ? 'animate-shake' : '',
        isLocked ? 'opacity-40 pointer-events-none' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--trad-color': tradColor } as React.CSSProperties}
      onClick={() => !isLocked && onTap(card.id)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
          e.preventDefault()
          onTap(card.id)
        }
      }}
    >
      {/* 3D flip container */}
      <div
        className={[
          'relative w-full h-full transition-transform duration-300 ease-in-out',
          '[transform-style:preserve-3d]',
          isFlipped ? '[transform:rotateY(180deg)]' : '',
        ].join(' ')}
      >
        {/* Card Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden bg-[var(--color-game-card-back)] border border-[var(--color-game-border)]">
          <CardBack />
        </div>

        {/* Card Front */}
        <div className={[
          'absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]',
          'rounded-lg overflow-hidden border-2 flex flex-col',
          'border-[var(--trad-color)]',
          cfg.bgClass,
          isSelected ? 'ring-2 ring-offset-1 ring-[var(--color-game-selected-ring)] shadow-[0_0_16px_4px_var(--trad-color)]' : '',
        ].join(' ')}>
          {/* Tradition sigil — top right only; name lives in aria-label */}
          <div className="flex justify-end items-center px-1.5 pt-1.5 pb-0.5">
            <span className="text-sm leading-none opacity-70 flex-shrink-0">
              {isFlipped ? cfg.sigil : ''}
            </span>
          </div>

          {/* Illustration */}
          <div className="flex-1 mx-1.5 rounded overflow-hidden bg-[var(--color-game-surface)] flex items-center justify-center">
            {card.concept.illustration_url
              ? <img src={card.concept.illustration_url} alt="" className="w-full h-full object-cover opacity-90" />
              : <ConceptPlaceholderArt slug={tradSlug} />
            }
          </div>

          {/* Concept name + phrase — overflow-safe */}
          <div className="px-1.5 pt-1 pb-2 text-center overflow-hidden">
            <p className="font-display text-[10px] tracking-wide text-[var(--color-game-fg)] uppercase leading-tight break-words">
              {card.concept.name}
            </p>
            <p className="font-serif text-[8px] text-[var(--color-game-fg-muted)] italic mt-0.5 leading-tight line-clamp-2 overflow-hidden">
              {card.concept.short_phrase}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CardBack() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[var(--color-game-card-back)] relative">
      {/* Concentric rings — suggest the Stoic/Neoplatonic emanating cosmos */}
      <div className="absolute w-[68%] aspect-square rounded-full border border-[var(--color-game-border)]" />
      <div className="absolute w-[46%] aspect-square rounded-full border border-[var(--color-game-border)]" />
      <div className="absolute w-[26%] aspect-square rounded-full border border-[var(--color-game-border)]" />
      <span className="relative text-[var(--color-game-fg-dim)] text-xs select-none">✦</span>
    </div>
  )
}

function ConceptPlaceholderArt({ slug }: { slug: string }) {
  const cfg = TRADITION_CONFIG[slug] ?? FALLBACK_CONFIG
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-3xl opacity-25 select-none">{cfg.sigil}</span>
    </div>
  )
}

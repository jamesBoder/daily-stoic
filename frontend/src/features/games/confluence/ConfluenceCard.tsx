import type { ConfluenceCard as ConfluenceCardType, GroupTier } from '../../../types/confluence'

// Slugs match DB values (hyphens). Sigils are unicode text characters, not emoji,
// so they render in the card's tradition color rather than system emoji color.
const TRADITION_CONFIG: Record<string, {
  borderClass: string
  glowClass: string
  sigil: string
  bgClass: string
}> = {
  // Λ = Lambda, the Logos — the rational divine fire at the heart of Stoic cosmology
  stoicism:               { borderClass: 'border-slate-500',    glowClass: 'shadow-slate-400',   sigil: 'Λ',  bgClass: 'bg-slate-900' },
  hermeticism:            { borderClass: 'border-yellow-600',   glowClass: 'shadow-yellow-400',  sigil: '☿',  bgClass: 'bg-yellow-950' },
  neoplatonism:           { borderClass: 'border-violet-500',   glowClass: 'shadow-violet-400',  sigil: '◎',  bgClass: 'bg-violet-950' },
  gnosticism:             { borderClass: 'border-red-700',      glowClass: 'shadow-red-400',     sigil: '⊕',  bgClass: 'bg-red-950' },
  kabbalah:               { borderClass: 'border-blue-600',     glowClass: 'shadow-blue-400',    sigil: '✡',  bgClass: 'bg-blue-950' },
  pythagoreanism:         { borderClass: 'border-emerald-600',  glowClass: 'shadow-emerald-400', sigil: '△',  bgClass: 'bg-emerald-950' },
  'pre-socratic':         { borderClass: 'border-amber-600',    glowClass: 'shadow-amber-400',   sigil: '≋',  bgClass: 'bg-amber-950' },
  'african-philosophy':   { borderClass: 'border-orange-600',   glowClass: 'shadow-orange-400',  sigil: '☽',  bgClass: 'bg-orange-950' },
  // Φ = Phi, the golden ratio — emblem of Renaissance humanism and classical proportion
  'renaissance-philosophy': { borderClass: 'border-rose-700',   glowClass: 'shadow-rose-400',    sigil: 'Φ',  bgClass: 'bg-rose-950' },
  transcendentalism:      { borderClass: 'border-green-600',    glowClass: 'shadow-green-400',   sigil: '☀',  bgClass: 'bg-green-950' },
  buddhism:               { borderClass: 'border-amber-500',    glowClass: 'shadow-amber-300',   sigil: '☸',  bgClass: 'bg-amber-950' },
  taoism:                 { borderClass: 'border-teal-500',     glowClass: 'shadow-teal-400',    sigil: '☯',  bgClass: 'bg-teal-950' },
  vedanta:                { borderClass: 'border-orange-500',   glowClass: 'shadow-orange-400',  sigil: 'ॐ',  bgClass: 'bg-orange-950' },
  existentialism:         { borderClass: 'border-zinc-500',     glowClass: 'shadow-zinc-400',    sigil: '∅',  bgClass: 'bg-zinc-900' },
  'kemetic-wisdom':       { borderClass: 'border-yellow-500',   glowClass: 'shadow-yellow-300',  sigil: '𓂀', bgClass: 'bg-yellow-950' },
}

const FALLBACK_CONFIG = { borderClass: 'border-stone-500', glowClass: 'shadow-stone-400', sigil: '✦', bgClass: 'bg-stone-900' }

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
  const tradSlug = card.concept.tradition?.slug ?? ''
  const cfg = TRADITION_CONFIG[tradSlug] ?? FALLBACK_CONFIG

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
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-lg overflow-hidden bg-[#0d1117] border border-stone-700/80">
          <CardBack />
        </div>

        {/* Card Front */}
        <div className={[
          'absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]',
          'rounded-lg overflow-hidden border-2 flex flex-col',
          isFlipped ? cfg.borderClass : 'border-stone-600',
          cfg.bgClass,
          isSelected ? `ring-2 ring-offset-1 ring-white/90 ${cfg.glowClass} shadow-lg` : '',
        ].join(' ')}>
          {/* Tradition sigil — top right only; name lives in aria-label */}
          <div className="flex justify-end items-center px-1.5 pt-1.5 pb-0.5">
            <span className="text-sm leading-none opacity-70 flex-shrink-0">
              {isFlipped ? cfg.sigil : ''}
            </span>
          </div>

          {/* Illustration */}
          <div className="flex-1 mx-1.5 rounded overflow-hidden bg-stone-900/40 flex items-center justify-center">
            {card.concept.illustration_url
              ? <img src={card.concept.illustration_url} alt="" className="w-full h-full object-cover opacity-90" />
              : <ConceptPlaceholderArt slug={tradSlug} />
            }
          </div>

          {/* Concept name + phrase — overflow-safe */}
          <div className="px-1.5 pt-1 pb-2 text-center overflow-hidden">
            <p className="font-display text-[10px] tracking-wide text-stone-100 uppercase leading-tight break-words">
              {card.concept.name}
            </p>
            <p className="font-serif text-[8px] text-stone-400 italic mt-0.5 leading-tight line-clamp-2 overflow-hidden">
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
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117] relative">
      {/* Concentric rings — suggest the Stoic/Neoplatonic emanating cosmos */}
      <div className="absolute w-[68%] aspect-square rounded-full border border-stone-700/40" />
      <div className="absolute w-[46%] aspect-square rounded-full border border-stone-600/50" />
      <div className="absolute w-[26%] aspect-square rounded-full border border-stone-600/70" />
      <span className="relative text-stone-600 text-xs select-none">✦</span>
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

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

interface ConfluenceCardProps {
  card: ConfluenceCardType
  isSelected: boolean
  isAnySelected: boolean
  isShaking: boolean
  isLocked: boolean
  lockedTier?: GroupTier
  onTap: (id: number) => void
}

export function ConfluenceCard({ card, isSelected, isAnySelected, isShaking, isLocked, onTap }: ConfluenceCardProps) {
  const tradSlug  = card.concept.tradition?.slug ?? ''
  const tradColor = TRADITION_COLORS[tradSlug]?.dark ?? 'var(--color-game-fg-muted)'
  // Unique art color per card — golden-angle hue distribution is independent of tradition groupings,
  // so players cannot use color as a grouping signal.
  const artHue = (card.id * 137) % 360
  const artBg  = `hsl(${artHue}, var(--color-game-art-s, 42%), var(--color-game-art-l, 11%))`

  return (
    <div
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`${card.concept.name} — ${card.concept.tradition?.name ?? 'Unknown'}`}
      aria-disabled={isLocked}
      className={[
        'relative aspect-[5/7] cursor-pointer select-none',
        'transition-[transform,opacity] duration-200',
        isSelected && !isLocked
          ? 'scale-[1.1] -translate-y-2 z-10'
          : !isSelected && isAnySelected && !isLocked
          ? 'opacity-60 scale-[0.97]'
          : '',
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
      {/* Card face — tradition hidden in grid; revealed only in FoundGroupsRow and ConvergenceReveal */}
      <div
        className={[
          'w-full h-full rounded-xl overflow-hidden border-2 flex flex-col',
          'border-[var(--color-game-border)] bg-[var(--color-game-card-back)]',
          isSelected ? 'ring-2 ring-offset-1 ring-[var(--color-game-selected-ring)]' : '',
        ].join(' ')}
        style={{ boxShadow: isSelected ? 'var(--color-game-card-sel-shadow)' : 'var(--color-game-card-shadow)' }}
      >

        {/* Art area — upper 33% on mobile, 38% on sm+ */}
        <div className="h-[33%] sm:h-[38%] flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: artBg }}>
          {card.concept.illustration_url
            ? <img src={card.concept.illustration_url} alt="" className="w-full h-full object-cover opacity-90" />
            : <NeutralPlaceholderArt variant={card.id % 6} />
          }
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[var(--color-game-border)] opacity-50 flex-shrink-0" />

        {/* Text area — lower 62%, vertically centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 py-1.5 sm:py-2 lg:px-3 lg:py-3 text-center gap-1 sm:gap-1.5 lg:gap-2 min-h-0 overflow-hidden">
          <p className="font-display text-[11px] sm:text-[13px] lg:text-[14px] tracking-wide text-[var(--color-game-fg)] uppercase leading-tight break-words w-full">
            {card.concept.name}
          </p>
          <div className="w-6 h-px bg-[var(--color-game-fg-dim)] opacity-30 flex-shrink-0" />
          <p className="font-serif text-[10px] sm:text-[11px] lg:text-[12px] text-[var(--color-game-fg-muted)] italic leading-snug line-clamp-2 sm:line-clamp-3 w-full">
            {card.concept.short_phrase}
          </p>
        </div>
      </div>
    </div>
  )
}

// Central symbols — all abstract geometry, none tied to a specific tradition
const VARIANT_SYMBOLS = ['✦', '✧', '◇', '◈', '⬡', '⁕'] as const

function NeutralPlaceholderArt({ variant }: { variant: number }) {
  const v = variant % 6
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {v === 0 && <Rings />}
      {v === 1 && <Rays count={6} step={30} />}
      {v === 2 && <NestedSquares />}
      {v === 3 && <Diamonds />}
      {v === 4 && <CrossCircle />}
      {v === 5 && <Rays count={4} step={45} />}
      <span className="relative text-xl opacity-30 select-none text-[var(--color-game-fg-dim)]">
        {VARIANT_SYMBOLS[v]}
      </span>
    </div>
  )
}

function Rings() {
  return <>
    <div className="absolute w-[76%] aspect-square rounded-full border border-[var(--color-game-border)] opacity-30" />
    <div className="absolute w-[52%] aspect-square rounded-full border border-[var(--color-game-border)] opacity-25" />
    <div className="absolute w-[28%] aspect-square rounded-full border border-[var(--color-game-border)] opacity-20" />
  </>
}

function Rays({ count, step }: { count: number; step: number }) {
  return <>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className="absolute h-px w-full bg-[var(--color-game-border)] opacity-20"
        style={{ top: '50%', left: 0, transform: `rotate(${i * step}deg)` }}
      />
    ))}
  </>
}

function NestedSquares() {
  return <>
    <div className="absolute w-[70%] aspect-square border border-[var(--color-game-border)] opacity-30" />
    <div className="absolute w-[48%] aspect-square border border-[var(--color-game-border)] opacity-25" />
    <div className="absolute w-[26%] aspect-square border border-[var(--color-game-border)] opacity-20" />
  </>
}

function Diamonds() {
  return <>
    <div className="absolute w-[65%] aspect-square border border-[var(--color-game-border)] opacity-30 rotate-45" />
    <div className="absolute w-[43%] aspect-square border border-[var(--color-game-border)] opacity-25 rotate-45" />
    <div className="absolute w-[22%] aspect-square border border-[var(--color-game-border)] opacity-20 rotate-45" />
  </>
}

function CrossCircle() {
  return <>
    <div className="absolute w-[68%] aspect-square rounded-full border border-[var(--color-game-border)] opacity-25" />
    <div className="absolute h-px w-full bg-[var(--color-game-border)] opacity-20" style={{ top: '50%', left: 0 }} />
    <div className="absolute w-px h-full bg-[var(--color-game-border)] opacity-20" style={{ top: 0, left: '50%' }} />
  </>
}

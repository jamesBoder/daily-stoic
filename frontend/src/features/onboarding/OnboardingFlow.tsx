import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import { onboardingApi } from '../../services/api/onboarding'
import { showToast } from '../../utils/toast'
import type { Tradition } from '../../types/quote'
import { META, ICON_COLOR_DARK } from '../traditions/constants'
import { WordMark } from '../../components/common/WordMark'

// ── Goals ─────────────────────────────────────────────────────────────────────

const GOALS = [
  { key: 'morning-clarity',     label: 'Morning Clarity',      desc: 'Start each day grounded in wisdom',                    icon: '☀' },
  { key: 'inner-peace',         label: 'Inner Peace',          desc: 'Find stillness amid life\'s turbulence',               icon: '◎' },
  { key: 'stoic-resilience',    label: 'Stoic Resilience',     desc: 'Build mental strength for any circumstance',           icon: '⊕' },
  { key: 'philosophical-depth', label: 'Philosophical Depth',  desc: 'Explore the great questions of existence',             icon: '∞' },
  { key: 'daily-discipline',    label: 'Daily Discipline',     desc: 'Build consistency through small sacred acts',          icon: '△' },
  { key: 'stress-relief',       label: 'Stress Relief',        desc: 'Calm the mind with timeless perspective',              icon: '☯' },
]

// ── Deterministic star positions (avoids hydration flicker) ───────────────────

const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = i * 137.508 // golden angle
  const r = Math.sqrt(i / 70)
  return {
    id: i,
    top:   `${r * Math.sin(a) * 50 + 50}%`,
    left:  `${r * Math.cos(a) * 50 + 50}%`,
    size:  i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
    dur:   `${2.5 + (i % 5) * 0.8}s`,
    delay: `${(i % 11) * 0.3}s`,
  }
})

// ── Starfield ─────────────────────────────────────────────────────────────────

function Starfield() {
  return (
    <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden">
      {STARS.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            '--twinkle-dur':   s.dur,
            '--twinkle-delay': s.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ── Progress dots ─────────────────────────────────────────────────────────────

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
      {[1, 2, 3].map(n => (
        <div
          key={n}
          className="rounded-full transition-all duration-300"
          style={{
            width:      n === step ? 24 : 8,
            height:     8,
            background: n <= step ? '#d4a853' : 'rgba(255,255,255,0.18)',
            animation:  n === step ? 'dot-fill 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
          }}
        />
      ))}
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="w-full h-[72px] rounded-xl border"
      style={{
        background:   'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation:    'shimmer 1.6s linear infinite',
        borderColor:  'rgba(255,255,255,0.07)',
      }}
    />
  )
}

// ── Selection card ────────────────────────────────────────────────────────────

function SelectCard({
  selected, onClick, icon, iconColor, iconBg, label, desc, badge, index,
}: {
  selected: boolean; onClick: () => void
  icon: string; iconColor: string; iconBg: string
  label: string; desc: string; badge?: string; index: number
}) {
  const [popped, setPopped] = useState(false)

  const handleClick = () => {
    setPopped(true)
    setTimeout(() => setPopped(false), 300)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl border text-left focus-visible:outline-none focus-visible:ring-2"
      style={{
        background:   selected ? 'rgba(212,168,83,0.09)' : 'rgba(255,255,255,0.04)',
        borderColor:  selected ? 'rgba(212,168,83,0.65)' : 'rgba(255,255,255,0.09)',
        boxShadow:    selected ? '0 0 0 1px rgba(212,168,83,0.25), 0 4px 16px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.2)',
        transform:    popped ? 'scale(0.97)' : 'scale(1)',
        transition:   'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 280ms cubic-bezier(0.34,1.56,0.64,1)',
        // stagger in on mount
        animationDelay: `${index * 45}ms`,
      }}
    >
      {/* Icon */}
      <div
        className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl transition-transform duration-200"
        style={{
          background: iconBg,
          color:      iconColor,
          transform:  selected ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-display text-sm tracking-wider text-[#e0ddd4]" style={{ fontVariant: 'small-caps' }}>
            {label}
          </span>
          {badge && (
            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#d4a853]/50 text-[#d4a853]">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-[#7a7060] leading-relaxed line-clamp-2">{desc}</p>
      </div>

      {/* Checkbox */}
      <div
        className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center"
        style={{
          borderColor: selected ? '#d4a853' : 'rgba(255,255,255,0.2)',
          background:  selected ? '#d4a853' : 'transparent',
          transition:  'border-color 180ms ease, background 180ms ease',
        }}
      >
        {selected && (
          <svg viewBox="0 0 12 10" className="w-3 h-2.5" fill="none">
            <path d="M1 5l3.5 3.5L11 1" stroke="#080d1a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}

// ── Toggle card (Step 3) ──────────────────────────────────────────────────────

function ToggleCard({ icon, label, desc, checked, onChange, index }: {
  icon: string; label: string; desc: string
  checked: boolean; onChange: () => void; index: number
}) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl border"
      style={{
        background:  'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.09)',
        boxShadow:   '0 2px 8px rgba(0,0,0,0.2)',
        animationDelay: `${index * 45}ms`,
      }}
    >
      <div className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
        style={{ background: 'rgba(212,168,83,0.15)', color: '#d4a853' }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-display text-sm tracking-wider text-[#e0ddd4]" style={{ fontVariant: 'small-caps' }}>
          {label}
        </p>
        <p className="text-xs text-[#7a7060] leading-relaxed">{desc}</p>
      </div>
      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        className="shrink-0 relative w-11 h-6 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a853]"
        style={{
          background: checked ? '#d4a853' : 'rgba(255,255,255,0.15)',
          transition: 'background 220ms ease',
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow"
          style={{
            transform:  checked ? 'translateX(20px)' : 'translateX(0)',
            transition: 'transform 220ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </button>
    </div>
  )
}

// ── Step content wrappers ─────────────────────────────────────────────────────

function StepOne({ traditions, selected, onToggle }: {
  traditions: Tradition[]; selected: string[]; onToggle: (slug: string) => void
}) {
  const sorted = [...traditions].sort((a, b) => {
    if (a.tier === b.tier) return 0
    return a.tier === 'free' ? -1 : 1
  })

  return (
    <>
      {traditions.length === 0
        ? Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)
        : sorted.map((t, i) => {
            const meta  = META[t.slug]
            const color = ICON_COLOR_DARK[t.slug] ?? '#d4a853'
            const bg    = meta?.accentDark ?? 'rgba(212,168,83,0.15)'
            return (
              <SelectCard key={t.slug} index={i}
                selected={selected.includes(t.slug)} onClick={() => onToggle(t.slug)}
                icon={meta?.icon ?? '✦'} iconColor={color} iconBg={bg}
                label={t.name} desc={meta?.description ?? ''}
                badge={t.tier === 'premium' ? 'Premium' : undefined}
              />
            )
          })}
    </>
  )
}

function StepTwo({ selected, onToggle }: { selected: string[]; onToggle: (key: string) => void }) {
  return (
    <>
      {GOALS.map((g, i) => (
        <SelectCard key={g.key} index={i}
          selected={selected.includes(g.key)} onClick={() => onToggle(g.key)}
          icon={g.icon} iconColor="#d4a853" iconBg="rgba(212,168,83,0.15)"
          label={g.label} desc={g.desc}
        />
      ))}
    </>
  )
}

function StepThree({ dailyReminder, emailNotifications, onToggleDaily, onToggleEmail }: {
  dailyReminder: boolean; emailNotifications: boolean
  onToggleDaily: () => void; onToggleEmail: () => void
}) {
  return (
    <>
      <ToggleCard index={0} icon="🕯" label="Daily Reminder"
        desc="A gentle nudge each morning to open your practice"
        checked={dailyReminder} onChange={onToggleDaily}
      />
      <ToggleCard index={1} icon="✉" label="Email Updates"
        desc="Occasional wisdom — never more than once a week"
        checked={emailNotifications} onChange={onToggleEmail}
      />
    </>
  )
}

// ── Step metadata ─────────────────────────────────────────────────────────────

const STEP_META = [
  {
    eyebrow:  'Your Path to Wisdom',
    title:    ['Which Tradition', 'Speaks to You?'],
    subtitle: 'Choose one or more. Your daily meditation will begin here.',
    hint:     'Select all that call to you',
  },
  {
    eyebrow:  'Your Intention',
    title:    ['What Do You', 'Seek?'],
    subtitle: 'Select the themes that resonate most deeply with you.',
    hint:     'Choose any that feel true',
  },
  {
    eyebrow:  'Your Practice',
    title:    ['Set Your', 'Rhythm'],
    subtitle: 'Let your practice meet you where you are.',
    hint:     'You can change these anytime in Settings',
  },
]

// ── CTA label ─────────────────────────────────────────────────────────────────

function buildCtaLabel(step: number, traditions: Tradition[], selectedTraditions: string[]): string {
  if (step === 1) {
    const n = selectedTraditions.length
    if (n === 0) return 'Begin My Practice'
    if (n === 1) return `Begin with ${traditions.find(t => t.slug === selectedTraditions[0])?.name ?? ''}`
    return `Begin with ${n} Traditions`
  }
  if (step === 2) return 'Continue'
  return 'Begin My Practice'
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function OnboardingFlow() {
  const navigate  = useNavigate()

  // Data
  const [traditions,     setTraditions]     = useState<Tradition[]>([])
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([])
  const [selectedGoals,  setSelectedGoals]  = useState<string[]>([])
  const [dailyReminder,  setDailyReminder]  = useState(true)
  const [emailNotif,     setEmailNotif]     = useState(true)

  // Step transition
  const [step,           setStep]           = useState(1)
  const [displayStep,    setDisplayStep]    = useState(1)
  const [phase,          setPhase]          = useState<'idle' | 'exiting' | 'entering'>('idle')

  // Completion overlay
  const [showOverlay,    setShowOverlay]    = useState(false)
  const [submitting,     setSubmitting]     = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    traditionsApi.list().then(setTraditions).catch(() => {})
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && phase === 'idle') advance()
      if (e.key === 'Escape') submit(true)
      if (e.key === 'ArrowLeft' && step > 1 && phase === 'idle') goBack()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const changeStep = (next: number) => {
    if (phase !== 'idle') return
    setPhase('exiting')
    setTimeout(() => {
      setStep(next)
      setDisplayStep(next)
      setPhase('entering')
      // Scroll content to top
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      setTimeout(() => setPhase('idle'), 380)
    }, 190)
  }

  const advance = () => {
    if (displayStep < 3) changeStep(displayStep + 1)
    else submit()
  }

  const goBack = () => {
    if (displayStep > 1) changeStep(displayStep - 1)
  }

  const submit = async (skip = false) => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onboardingApi.complete({
        traditions:          skip ? [] : selectedTraditions,
        goals:               skip ? [] : selectedGoals,
        daily_reminder:      dailyReminder,
        email_notifications: emailNotif,
      })
    } catch {
      showToast.error('Could not save preferences — you can update them in Settings anytime.')
    }
    // Fade out before navigating
    setShowOverlay(true)
    setTimeout(() => navigate('/'), 550)
  }

  const toggleTradition = (slug: string) =>
    setSelectedTraditions(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])

  const toggleGoal = (key: string) =>
    setSelectedGoals(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const meta    = STEP_META[step - 1]
  const ctaLabel = buildCtaLabel(step, traditions, selectedTraditions)

  // Content transition styles
  const contentStyle: React.CSSProperties = {
    opacity:    phase === 'exiting' ? 0 : 1,
    transform:  phase === 'exiting' ? 'translateY(-10px) scale(0.99)'
                : phase === 'entering' ? 'translateY(0) scale(1)' : 'translateY(0) scale(1)',
    transition: phase === 'exiting'
      ? 'opacity 190ms ease, transform 190ms ease'
      : phase === 'entering'
        ? 'none'
        : 'none',
    animation: phase === 'entering' ? 'step-in 0.38s cubic-bezier(0.22,1,0.36,1) both' : 'none',
  }

  return (
    <div
      className="min-h-screen relative flex flex-col select-none"
      style={{ background: 'linear-gradient(160deg, #060b16 0%, #0b1528 55%, #080f1e 100%)' }}
    >
      <Starfield />

      {/* ── Completion overlay ── */}
      {showOverlay && (
        <div
          className="fixed inset-0 z-50 bg-[#060b16]"
          style={{ animation: 'overlay-in 0.55s ease forwards' }}
        />
      )}

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-3">
        {/* Back button */}
        <div className="w-20">
          {step > 1 ? (
            <button
              onClick={goBack}
              className="text-[#7a7060] hover:text-[#d4a853] transition-colors duration-200 flex items-center gap-1.5 text-sm"
              disabled={phase !== 'idle'}
            >
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          ) : (
            <span className="font-display text-sm tracking-[0.2em] uppercase text-[#d4a853]">
              <WordMark />
            </span>
          )}
        </div>

        {/* Progress dots */}
        <ProgressDots step={step} />

        {/* Right spacer */}
        <div className="w-20 flex justify-end">
          <span className="text-[10px] text-[#4a4438] tracking-widest uppercase">
            {step} / 3
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="relative z-10 h-px mx-6" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col px-5 pt-8 pb-6 max-w-lg mx-auto w-full">

        {/* Header block */}
        <div style={contentStyle}>
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-[#d4a853] text-center mb-3">
            {meta.eyebrow}
          </p>
          <h1 className="font-display text-[2.6rem] leading-tight text-center text-[#ede5d0] mb-4"
            style={{ fontVariant: 'small-caps' }}>
            {meta.title[0]}<br />{meta.title[1]}
          </h1>
          <p className="text-sm text-[#7a7060] text-center italic mb-5 leading-relaxed px-3">
            {meta.subtitle}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: '#d4a853', fontSize: 10 }}>◆</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-[#4a4438] text-center italic mb-5">
            {meta.hint}
          </p>
        </div>

        {/* Cards */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 pb-2" style={contentStyle}>
          {displayStep === 1 && (
            <StepOne traditions={traditions} selected={selectedTraditions} onToggle={toggleTradition} />
          )}
          {displayStep === 2 && (
            <StepTwo selected={selectedGoals} onToggle={toggleGoal} />
          )}
          {displayStep === 3 && (
            <StepThree
              dailyReminder={dailyReminder} emailNotifications={emailNotif}
              onToggleDaily={() => setDailyReminder(v => !v)}
              onToggleEmail={() => setEmailNotif(v => !v)}
            />
          )}
        </div>

        {/* ── CTA ── */}
        <div className="mt-5 space-y-3">
          <button
            onClick={advance}
            disabled={submitting || phase !== 'idle'}
            className="w-full py-4 rounded-xl font-display tracking-widest uppercase text-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #d4a853 0%, #b8903d 100%)',
              color:      '#080d1a',
              opacity:    submitting ? 0.7 : 1,
              transition: 'opacity 200ms ease, transform 120ms ease',
              boxShadow:  '0 4px 24px rgba(212,168,83,0.25), 0 1px 0 rgba(255,255,255,0.15) inset',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.985)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Shimmer sweep on hover */}
            <span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2.4s linear infinite',
              }}
            />
            <span className="relative">
              {submitting ? 'Saving…' : ctaLabel} {!submitting && '→'}
            </span>
          </button>

          <button
            onClick={() => submit(true)}
            disabled={submitting}
            className="w-full text-center text-xs text-[#4a4438] hover:text-[#d4a853] transition-colors duration-200 py-1"
          >
            • I'll explore on my own →
          </button>
        </div>
      </div>
    </div>
  )
}

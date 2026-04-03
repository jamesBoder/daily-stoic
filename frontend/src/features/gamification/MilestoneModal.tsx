// src/features/gamification/MilestoneModal.tsx

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

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm px-4">

      {/* Confetti layer — 8 dots, staggered */}
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
      <div className="animate-milestone-burst bg-surface-card rounded-modal shadow-modal max-w-sm w-full p-10 text-center relative">
        <div className="text-5xl mb-6 animate-flame-pulse inline-block">
          {config.icon}
        </div>

        <h2 className="font-display text-2xl text-primary-800 tracking-wide mb-1">
          {config.heading}
        </h2>
        <p className="font-display text-sm uppercase tracking-widest text-accent mb-6">
          {config.subheading}
        </p>

        <p className="font-serif text-base text-primary-600 leading-relaxed mb-8 italic">
          &ldquo;{config.body}&rdquo;
        </p>

        <button
          onClick={onClose}
          className="font-sans text-sm font-semibold text-white bg-accent hover:bg-accent-dark rounded-stone px-8 py-3 transition-colors w-full"
        >
          {config.cta}
        </button>
      </div>
    </div>
  )
}
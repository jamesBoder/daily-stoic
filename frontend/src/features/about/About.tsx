import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { WordMark } from '../../components/common/WordMark'

// ── Shared section divider ────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="font-display text-[9px] tracking-[0.3em] uppercase text-accent mb-5">
      {label}
    </p>
  )
}

// ── Tradition pill ────────────────────────────────────────────────────────────

const TRADITIONS = [
  { name: 'Stoicism',            icon: '⊕', tier: 'free'    },
  { name: 'African Philosophy',  icon: '◈', tier: 'free'    },
  { name: 'Buddhism',            icon: '☸', tier: 'free'    },
  { name: 'Taoism',              icon: '☯', tier: 'free'    },
  { name: 'Existentialism',      icon: '∅', tier: 'free'    },
  { name: 'Transcendentalism',   icon: '✿', tier: 'free'    },
  { name: 'Renaissance',         icon: '⟁', tier: 'free'    },
  { name: 'Kemetic Wisdom',      icon: '𓂀', tier: 'free'    },
  { name: 'Hermeticism',         icon: '✦', tier: 'premium' },
  { name: 'Neoplatonism',        icon: '◉', tier: 'premium' },
  { name: 'Vedanta',             icon: '॰', tier: 'premium' },
  { name: 'Gnosticism',          icon: '✶', tier: 'premium' },
  { name: 'Kabbalah',            icon: '✡', tier: 'premium' },
  { name: 'Pythagoreanism',      icon: '△', tier: 'premium' },
  { name: 'Pre-Socratic',        icon: 'Φ', tier: 'premium' },
]

function TraditionPill({ name, icon, tier }: { name: string; icon: string; tier: string }) {
  const isPremium = tier === 'premium'
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-sans ${
      isPremium
        ? 'border-accent/30 text-accent/70 dark:text-accent bg-accent/5'
        : 'border-primary-200 dark:border-[var(--color-border)] text-primary-600 dark:text-fg-muted bg-surface-card'
    }`}>
      <span className="text-[11px] select-none">{icon}</span>
      {name}
      {isPremium && <span className="text-[9px] opacity-60">✦</span>}
    </div>
  )
}

// ── Feature row ───────────────────────────────────────────────────────────────

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-accent/10 dark:bg-accent/10 flex items-center justify-center text-base text-accent select-none">
        {icon}
      </div>
      <div>
        <h3 className="font-display text-sm text-primary-800 dark:text-fg mb-1">{title}</h3>
        <p className="font-sans text-sm text-primary-500 dark:text-fg-muted leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export const About: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuth()
  const { isPremium } = useSubscription()
  const showCTA = !isAuthenticated || isGuest

  return (
    <div className="bg-surface-base page-utility min-h-screen">

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-5 pt-16 pb-14 text-center">
        <div className="font-display text-3xl text-accent dark:text-accent mb-6 select-none logo-glow-hover">
          <WordMark />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-primary-900 dark:text-fg leading-tight mb-5 title-glow-hover">
          Ancient wisdom.<br />One passage a day.
        </h1>
        <div className="w-10 border-t border-accent/40 mx-auto mb-6" />
        <p className="font-sans text-base text-primary-500 dark:text-fg-muted leading-relaxed max-w-md mx-auto">
          A daily reading practice drawing from fifteen philosophical traditions — Stoicism,
          Hermeticism, Buddhism, Vedanta, and beyond — presented as beautiful oracle-deck cards,
          with reading plans, author profiles, and weekly themes to deepen the practice.
        </p>

        {showCTA && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/auth/register"
              className="font-sans text-sm font-medium bg-accent text-accent-text px-6 py-3 rounded-full hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Start free
            </Link>
            <Link
              to="/auth/login"
              className="font-sans text-sm text-primary-500 dark:text-fg-muted hover:text-accent transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}
      </section>

      {/* ── Features ── */}
      <section className="max-w-2xl mx-auto px-5 py-12 border-t border-primary-200 dark:border-[var(--color-border)]">
        <SectionLabel label="The Practice" />
        <div className="space-y-7">
          <Feature
            icon="☀"
            title="One card, every morning"
            description="Each day a single passage drawn from across the philosophical traditions — the Meditations, the Tao Te Ching, the Corpus Hermeticum, the Enneads, and beyond. Read it. Sit with it. Let it shape your day."
          />
          <Feature
            icon="✦"
            title="15 philosophical traditions"
            description="Free and premium content spans Stoicism, African Philosophy, Buddhism, Taoism, Existentialism, Transcendentalism, Renaissance philosophy, Kemetic Wisdom, and seven premium esoteric traditions."
          />
          <Feature
            icon="◉"
            title="Deep author profiles"
            description="Each philosopher has a full profile: biography, historical context, and a curated selection of their best passages. Explore Marcus Aurelius, Plotinus, Laozi, Epictetus, Thich Nhat Hanh, and more."
          />
          <Feature
            icon="📖"
            title="Reading plans"
            description="Curated multi-week journeys: the 30-day Stoic Virtues plan (Wisdom, Courage, Justice, Temperance) and the 49-day Hermetic Principles journey. Track your progress, advance at your own pace."
          />
          <Feature
            icon="⊕"
            title="Weekly themes"
            description="Every Monday, a new theme — resilience, equanimity, justice, contemplation — with seven curated passages to keep your practice varied through the year."
          />
          <Feature
            icon="♡"
            title="Save what resonates"
            description="Swipe left on any card to save it. Build a personal library of wisdom you can return to, organised by tradition and theme."
          />
          <Feature
            icon="🔥"
            title="Build a streak"
            description="Consistency over intensity — a principle every tradition holds in common. A daily practice, even five minutes, compounds. Your streak tracks that continuity."
          />
          <Feature
            icon="✎"
            title="Write your reflections"
            description="Attach your own commentary to any passage — a private meditation, a note, a question that arose. The practice deepens when you write."
          />
        </div>
      </section>

      {/* ── Traditions ── */}
      <section className="max-w-2xl mx-auto px-5 py-12 border-t border-primary-200 dark:border-[var(--color-border)]">
        <SectionLabel label="Traditions" />
        <p className="font-sans text-sm text-primary-500 dark:text-fg-muted leading-relaxed mb-6">
          Content spans fifteen philosophical traditions. Free-tier traditions are available immediately.
          Traditions marked <span className="text-accent">✦</span> require Practitioner access.
        </p>
        <div className="flex flex-wrap gap-2">
          {TRADITIONS.map(t => (
            <TraditionPill key={t.name} {...t} />
          ))}
        </div>
        <div className="mt-5">
          <Link
            to="/traditions"
            className="font-sans text-sm text-accent hover:underline"
          >
            Browse all traditions →
          </Link>
        </div>
      </section>

      {/* ── Practitioner ── (hidden if already premium) */}
      {!isPremium && (
        <section className="max-w-2xl mx-auto px-5 py-12 border-t border-primary-200 dark:border-[var(--color-border)]">
          <SectionLabel label="Practitioner" />
          <div className="rounded-2xl border border-accent/25 bg-accent/5 dark:bg-accent/5 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-lg text-accent select-none">
                ✦
              </div>
              <div>
                <h3 className="font-display text-base text-primary-800 dark:text-fg mb-1">
                  Practitioner — $14.99 lifetime
                </h3>
                <p className="font-sans text-sm text-primary-500 dark:text-fg-muted leading-relaxed">
                  One payment. Permanent access. No subscription.
                </p>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {[
                'Seven premium esoteric traditions (Hermeticism, Neoplatonism, Vedanta, and more)',
                '49-day Hermetic Principles reading plan',
                'Extended commentaries and practice prompts on all passages',
                'Ad-free experience',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 font-sans text-sm text-primary-600 dark:text-fg-muted">
                  <span className="flex-shrink-0 text-accent mt-0.5 text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/upgrade"
              className="inline-block font-sans text-sm font-medium bg-accent text-accent-text px-6 py-2.5 rounded-full hover:opacity-90 active:scale-[0.97] transition-all"
            >
              Unlock Practitioner
            </Link>
          </div>
        </section>
      )}

      {/* ── Philosophy ── */}
      <section className="max-w-2xl mx-auto px-5 py-12 border-t border-primary-200 dark:border-[var(--color-border)]">
        <SectionLabel label="Why this app exists" />
        <div className="space-y-4 font-sans text-sm text-primary-600 dark:text-fg-muted leading-relaxed">
          <p>
            Most of the wisdom in these texts is not hidden — it is simply unread.
            The <em>Meditations</em> are available for free in a dozen translations.
            The Tao Te Ching has eighty-one verses that can be read in an afternoon.
            The Corpus Hermeticum is in every major library.
          </p>
          <p>
            The problem is not access. It is attention.
          </p>
          <p>
            Daily Xam is designed around a single principle: one passage a day, done consistently,
            is worth more than a library unread. The oracle-card format, the streak, the reading
            plans — all of it is in service of that one practice.
          </p>
          <p>
            Marcus Aurelius wrote the <em>Meditations</em> as private notes to himself — not
            for publication, but for practice. Not to become famous, but to become better.
            That is the spirit this is built in.
          </p>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="max-w-2xl mx-auto px-5 py-12 border-t border-primary-200 dark:border-[var(--color-border)]">
        <SectionLabel label="Contact" />
        <div className="space-y-3 font-sans text-sm text-primary-500 dark:text-fg-muted">
          <p>
            Found a bug or have a suggestion?{' '}
            <a
              href="mailto:hello@dailyxam.app"
              className="text-accent hover:underline transition-colors"
            >
              hello@dailyxam.app
            </a>
          </p>
          <p>
            Instagram:{' '}
            <a
              href="https://instagram.com/dailyxamapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline transition-colors"
            >
              @dailyxamapp
            </a>
          </p>
        </div>
      </section>

      <div className="pb-16" />
    </div>
  )
}

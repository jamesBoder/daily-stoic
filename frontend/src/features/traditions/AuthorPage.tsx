// src/features/traditions/AuthorPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import type { Author } from '../../types/quote'
import { PassageCard } from './PassageCard'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { PremiumGate } from '../../components/common/PremiumGate'
import { AskPhilosopherModal } from '../ai/AskPhilosopherModal'
import {
  TRADITION_ICON,
  TRADITION_NAME,
  TRADITION_SLUG,
  TRADITION_COLORS,
  TRADITION_DEFAULT_COLORS,
} from './constants'

export function AuthorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [author, setAuthor]   = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const { isPremium } = useSubscription()

  useEffect(() => {
    if (!slug) return
    traditionsApi.getAuthorBySlug(slug)
      .then(setAuthor)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const traditionId   = author?.tradition_id ?? 1
  const traditionSlug = TRADITION_SLUG[traditionId]
  const colors        = TRADITION_COLORS[traditionSlug ?? ''] ?? TRADITION_DEFAULT_COLORS

  const freeQuotes    = (author?.quotes ?? []).filter(q => q.tier === 'free')
  const premiumQuotes = (author?.quotes ?? []).filter(q => q.tier === 'premium')

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base page-utility py-20 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-card bg-surface animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (error || !author) {
    return (
      <main className="min-h-screen bg-surface-base page-utility py-24 px-4 text-center">
        <p className="font-sans text-sm text-fg-subtle">
          Author not found.{' '}
          <Link to="/traditions" className="underline hover:text-fg-muted">
            Browse traditions
          </Link>
        </p>
      </main>
    )
  }

  const traditionIcon = TRADITION_ICON[traditionId] ?? '✦'
  const traditionName = TRADITION_NAME[traditionId]

  return (
    <main
      className="min-h-screen bg-surface-base page-utility py-16 px-4"
      style={{
        '--trad-color':    colors.light,
        '--trad-color-dk': colors.dark,
      } as React.CSSProperties}
    >
      <div className="max-w-lg mx-auto">

        {/* Back link */}
        <Link
          to={traditionSlug ? `/traditions/${traditionSlug}` : '/traditions'}
          className="inline-flex items-center gap-1.5 font-display text-[10px] tracking-widest uppercase mb-8 transition-all hover:underline py-2 -my-2"
          style={{ color: 'var(--trad-color-active)' }}
        >
          <span>←</span> {traditionName ?? 'Traditions'}
        </Link>

        {/* Author header */}
        <header className="mb-10">

          {/* Avatar */}
          <div className="mb-5">
            {author.image_url ? (
              <img
                src={author.image_url}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '2px solid color-mix(in srgb, var(--trad-color-active) 38%, transparent)' }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'color-mix(in srgb, var(--trad-color-active) 9%, transparent)',
                  border: '2px solid color-mix(in srgb, var(--trad-color-active) 38%, transparent)',
                  color: 'var(--trad-color-active)',
                }}
              >
                {traditionIcon}
              </div>
            )}
          </div>

          {/* Tradition badge */}
          {traditionName && (
            <p
              className="font-display text-[9px] tracking-[0.28em] uppercase mb-2"
              style={{ color: 'var(--trad-color-active)' }}
            >
              {traditionName}
            </p>
          )}

          <h1 className="font-display text-3xl text-fg mb-1">
            {author.name}
          </h1>

          {/* Dates & nationality */}
          {(author.born || author.died || author.nationality) && (
            <p className="font-sans text-xs text-fg-subtle mb-4">
              {[author.nationality, author.born && author.died
                ? `${author.born} – ${author.died}`
                : author.born ?? author.died
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Accent rule */}
          <div
            className="h-px w-12 mb-4 rounded-full opacity-50"
            style={{ background: 'var(--trad-color-active)' }}
          />

          {/* Bio */}
          {author.bio ? (
            <p className="font-sans text-sm text-fg-muted leading-relaxed mb-5">
              {author.bio}
            </p>
          ) : (
            <p className="font-sans text-xs italic text-fg-subtle mb-5">
              No biography available yet.
            </p>
          )}

          {/* Speak with button */}
          <button
            onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-2 font-display text-xs tracking-wider uppercase
                       px-4 py-2 rounded-full transition-all hover:opacity-85 active:scale-95"
            style={{
              color: 'var(--trad-color-active)',
              background: 'color-mix(in srgb, var(--trad-color-active) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--trad-color-active) 25%, transparent)',
            }}
          >
            <span>✦</span>
            <span>Speak with {author.name.split(' ')[0]}</span>
          </button>
        </header>

        {askOpen && (
          <AskPhilosopherModal
            author={author}
            tradColors={colors}
            onClose={() => setAskOpen(false)}
          />
        )}

        {/* Quotes */}
        {(freeQuotes.length > 0 || premiumQuotes.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-border-hi" />
              <h2 className="font-display text-[10px] tracking-[0.25em] uppercase text-fg-muted px-1">
                Works
              </h2>
              <div className="h-px flex-1 bg-border-hi" />
            </div>

            <div className="space-y-8">
              {freeQuotes.map(q => (
                <PassageCard key={q.id} quote={q} tradColors={colors} />
              ))}

              {premiumQuotes.map(q => {
                if (isPremium) {
                  return <PassageCard key={q.id} quote={q} tradColors={colors} />
                }
                return (
                  <PremiumGate key={q.id}>
                    <PassageCard quote={q} tradColors={colors} />
                  </PremiumGate>
                )
              })}
            </div>
          </section>
        )}

        {freeQuotes.length === 0 && premiumQuotes.length === 0 && (
          <p className="font-sans text-xs text-fg-subtle text-center py-8">
            No passages available yet for this author.
          </p>
        )}
      </div>
    </main>
  )
}

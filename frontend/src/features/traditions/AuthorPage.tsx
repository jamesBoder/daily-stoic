// src/features/traditions/AuthorPage.tsx

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { traditionsApi } from '../../services/api/traditions'
import type { Author } from '../../types/quote'
import { PassageCard } from './PassageCard'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useIsDark } from '../../hooks/useIsDark'
import { PremiumGate } from '../../components/common/PremiumGate'
import { AskPhilosopherModal } from '../ai/AskPhilosopherModal'
import {
  TRADITION_ICON,
  TRADITION_NAME,
  TRADITION_SLUG,
  TRADITION_ACCENT,
} from './constants'

export function AuthorPage() {
  const { slug } = useParams<{ slug: string }>()
  const [author, setAuthor]   = useState<Author | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const { isPremium } = useSubscription()
  const isDark = useIsDark()

  useEffect(() => {
    if (!slug) return
    traditionsApi.getAuthorBySlug(slug)
      .then(setAuthor)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  const traditionId = author?.tradition_id ?? 1
  const accent = isDark
    ? (TRADITION_ACCENT[traditionId]?.dark ?? '#d4a853')
    : (TRADITION_ACCENT[traditionId]?.light ?? '#8b7355')

  const freeQuotes    = (author?.quotes ?? []).filter(q => q.tier === 'free')
  const premiumQuotes = (author?.quotes ?? []).filter(q => q.tier === 'premium')

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-base page-utility py-20 px-4">
        <div className="max-w-lg mx-auto space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-card bg-primary-100/60 dark:bg-night-800/40 animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (error || !author) {
    return (
      <main className="min-h-screen bg-surface-base page-utility py-24 px-4 text-center">
        <p className="font-sans text-sm text-primary-400 dark:text-night-500">
          Author not found.{' '}
          <Link to="/traditions" className="underline hover:text-primary-600">
            Browse traditions
          </Link>
        </p>
      </main>
    )
  }

  const traditionSlug = TRADITION_SLUG[traditionId]
  const traditionIcon = TRADITION_ICON[traditionId] ?? '✦'
  const traditionName = TRADITION_NAME[traditionId]

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
      <div className="max-w-lg mx-auto">

        {/* Back link — to tradition page if we know the slug, else to /traditions */}
        <Link
          to={traditionSlug ? `/traditions/${traditionSlug}` : '/traditions'}
          className="inline-flex items-center gap-1.5 font-display text-[10px] tracking-widest uppercase mb-8 transition-all hover:underline py-2 -my-2"
          style={{ color: accent }}
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
                style={{ border: `2px solid ${accent}60` }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: `${accent}18`,
                  border: `2px solid ${accent}60`,
                  color: accent,
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
              style={{ color: accent }}
            >
              {traditionName}
            </p>
          )}

          <h1 className="font-display text-3xl text-primary-800 dark:text-[#e8e0cc] mb-1">
            {author.name}
          </h1>

          {/* Dates & nationality */}
          {(author.born || author.died || author.nationality) && (
            <p className="font-sans text-xs text-primary-500 dark:text-night-500 mb-4">
              {[author.nationality, author.born && author.died
                ? `${author.born} – ${author.died}`
                : author.born ?? author.died
              ].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Accent rule */}
          <div
            className="h-px w-12 mb-4 rounded-full"
            style={{ background: accent, opacity: 0.5 }}
          />

          {/* Bio */}
          {author.bio ? (
            <p className="font-sans text-sm text-primary-700 dark:text-night-400 leading-relaxed mb-5">
              {author.bio}
            </p>
          ) : (
            <p className="font-sans text-xs italic text-primary-400 dark:text-night-600 mb-5">
              No biography available yet.
            </p>
          )}

          {/* Speak with button */}
          <button
            onClick={() => setAskOpen(true)}
            className="inline-flex items-center gap-2 font-display text-xs tracking-wider uppercase
                       px-4 py-2 rounded-full transition-all hover:opacity-85 active:scale-95"
            style={{ color: accent, background: `${accent}14`, border: `1px solid ${accent}40` }}
          >
            <span>✦</span>
            <span>Speak with {author.name.split(' ')[0]}</span>
          </button>
        </header>

        {askOpen && (
          <AskPhilosopherModal
            author={author}
            accentColor={accent}
            onClose={() => setAskOpen(false)}
          />
        )}

        {/* Quotes */}
        {(freeQuotes.length > 0 || premiumQuotes.length > 0) && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
              <h2 className="font-display text-[10px] tracking-[0.25em] uppercase text-primary-600 dark:text-night-400 px-1">
                Works
              </h2>
              <div className="h-px flex-1 bg-primary-300 dark:bg-[rgba(255,255,255,0.12)]" />
            </div>

            <div className="space-y-8">
              {freeQuotes.map(q => (
                <PassageCard key={q.id} quote={q} accentColor={accent} />
              ))}

              {premiumQuotes.map(q => {
                if (isPremium) {
                  return <PassageCard key={q.id} quote={q} accentColor={accent} />
                }
                return (
                  <PremiumGate key={q.id}>
                    <PassageCard quote={q} accentColor={accent} />
                  </PremiumGate>
                )
              })}
            </div>
          </section>
        )}

        {freeQuotes.length === 0 && premiumQuotes.length === 0 && (
          <p className="font-sans text-xs text-primary-400 dark:text-night-500 text-center py-8">
            No passages available yet for this author.
          </p>
        )}
      </div>
    </main>
  )
}

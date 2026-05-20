// src/features/ai/ConversePage.tsx
// Dedicated page for conversing with any philosopher in the app.
// Free users: 3 questions/day. Practitioner: unlimited.

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../../services/api/api'
import type { Author } from '../../types/quote'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../contexts/SubscriptionContext'
import { useAskByAuthor, useAiUsage, is429 } from '../../hooks/useAskPhilosopher'
import { TRADITION_ICON, TRADITION_NAME, TRADITION_SLUG, TRADITION_COLORS, TRADITION_DEFAULT_COLORS } from '../traditions/constants'
import { Link } from 'react-router-dom'

const FREE_LIMIT = 3

// ── Fetch all authors ─────────────────────────────────────────────────────────

function useAuthors() {
  return useQuery<Author[]>({
    queryKey: ['authors-all'],
    queryFn: () => apiClient.get('/api/authors').then(r => r.data.authors ?? []),
    staleTime: 10 * 60_000,
  })
}

// ── Philosopher card ──────────────────────────────────────────────────────────

function PhilosopherCard({
  author,
  isSelected,
  onClick,
}: {
  author: Author
  isSelected: boolean
  onClick: () => void
}) {
  const traditionId = author.tradition_id ?? 1
  const slug        = TRADITION_SLUG[traditionId] ?? ''
  const colors      = TRADITION_COLORS[slug] ?? TRADITION_DEFAULT_COLORS
  const icon        = TRADITION_ICON[traditionId] ?? '✦'
  const tradition   = TRADITION_NAME[traditionId] ?? ''

  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      className={`w-full text-left rounded-card border p-3 transition-all duration-200 group
                  ${isSelected
                    ? ''
                    : 'border-border hover:border-border-hi'}
                  bg-surface`}
      style={isSelected
        ? {
            boxShadow: 'var(--shadow-accent-glow)',
            borderColor: 'color-mix(in srgb, var(--trad-color-active) 38%, transparent)',
            '--trad-color':    colors.light,
            '--trad-color-dk': colors.dark,
          } as React.CSSProperties
        : {
            '--trad-color':    colors.light,
            '--trad-color-dk': colors.dark,
          } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        {/* Avatar / icon */}
        {author.image_url ? (
          <img
            src={author.image_url}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
            style={{ border: '1.5px solid color-mix(in srgb, var(--trad-color-active) 31%, transparent)' }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0"
            style={{
              background: 'color-mix(in srgb, var(--trad-color-active) 9%, transparent)',
              color: 'var(--trad-color-active)',
              border: '1.5px solid color-mix(in srgb, var(--trad-color-active) 25%, transparent)',
            }}
          >
            {icon}
          </div>
        )}

        {/* Name + tradition */}
        <div className="min-w-0">
          <p className="font-display text-sm tracking-wide text-fg truncate">
            {author.name}
          </p>
          {tradition && (
            <p
              className="font-sans text-[10px] truncate opacity-80"
              style={{ color: 'var(--trad-color-active)' }}
            >
              {tradition}
            </p>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <span className="shrink-0 ml-auto text-sm" style={{ color: 'var(--trad-color-active)' }}>✦</span>
        )}
      </div>
    </button>
  )
}

// ── Inline conversation panel ─────────────────────────────────────────────────

function ConversationPanel({ author }: { author: Author }) {
  const { isAuthenticated } = useAuth()
  const { isPremium } = useSubscription()
  const { data: usage } = useAiUsage()
  const { mutate, isPending, lastResponse, clearResponse, reset, isError, error } = useAskByAuthor()
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const panelRef    = useRef<HTMLDivElement>(null)

  const traditionId = author.tradition_id ?? 1
  const slug        = TRADITION_SLUG[traditionId] ?? ''
  const colors      = TRADITION_COLORS[slug] ?? TRADITION_DEFAULT_COLORS

  const isAtLimit = !isPremium && is429(error)
  const remaining = lastResponse?.questions_remaining

  // Scroll panel into view when a philosopher is selected on mobile
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    textareaRef.current?.focus()
  }, [author.id])

  const resetRef = useRef<() => void>(() => {})
  resetRef.current = () => {
    clearResponse()
    reset()
    setQuestion('')
  }

  useEffect(() => {
    resetRef.current()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author.id])

  const handleSubmit = () => {
    if (!question.trim() || isPending || !author.slug) return
    mutate({ authorSlug: author.slug, question: question.trim() })
  }

  const handleAskAnother = () => {
    clearResponse()
    reset()
    setQuestion('')
    const t = setTimeout(() => textareaRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }

  return (
    <div
      ref={panelRef}
      className="rounded-card border bg-surface border-border overflow-hidden"
      style={{
        '--trad-color':    colors.light,
        '--trad-color-dk': colors.dark,
      } as React.CSSProperties}
    >
      {/* Panel header */}
      <div className="h-0.5" style={{ background: 'var(--trad-color-active)' }} />
      <div className="px-5 py-4 border-b border-border-subtle">
        <p
          className="font-display text-[9px] tracking-[0.28em] uppercase mb-0.5"
          style={{ color: 'var(--trad-color-active)' }}
        >
          Conversing with
        </p>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-fg">
            {author.name}
          </h2>
          <Link
            to={`/authors/${author.slug}`}
            className="font-display text-[9px] tracking-[0.2em] uppercase transition-all hover:underline"
            style={{ color: 'var(--trad-color-active)' }}
          >
            View passages →
          </Link>
        </div>

        {/* Usage counter — free users only */}
        {isAuthenticated && !isPremium && usage && !usage.is_unlimited && (
          <p className="font-sans text-[10px] text-fg-subtle mt-1">
            {usage.questions_remaining !== null && usage.questions_remaining > 0
              ? `${usage.questions_remaining} of ${FREE_LIMIT} questions remaining today`
              : usage.questions_remaining === 0
                ? 'No questions remaining today'
                : null}
          </p>
        )}
      </div>

      <div className="p-5">

        {/* Not signed in */}
        {!isAuthenticated && (
          <div className="text-center py-8">
            <p className="font-sans text-sm text-fg-muted mb-4">
              Sign in to begin conversing with {author.name}.
            </p>
            <Link
              to="/auth/login"
              className="font-display text-xs tracking-wider uppercase px-5 py-2 rounded-full text-fg-inverse transition-all hover:opacity-90"
              style={{ background: 'var(--trad-color-active)' }}
            >
              Sign in
            </Link>
          </div>
        )}

        {/* At limit */}
        {isAuthenticated && isAtLimit && (
          <div className="text-center py-8">
            <p className="text-3xl mb-3">⧖</p>
            <p className="font-display text-sm text-fg mb-1">
              Today's questions are spent.
            </p>
            <p className="font-sans text-xs text-fg-subtle mb-4">
              {author.name} will await your return tomorrow.
            </p>
            {!isPremium && (
              <Link
                to="/upgrade"
                className="font-display text-[10px] tracking-[0.2em] uppercase transition-all hover:underline"
                style={{ color: 'var(--trad-color-active)' }}
              >
                Upgrade for unlimited →
              </Link>
            )}
          </div>
        )}

        {/* Response */}
        {isAuthenticated && !isAtLimit && lastResponse && (
          <div>
            <div
              className="rounded-[8px] p-4 mb-5"
              style={{
                background: 'color-mix(in srgb, var(--trad-color-active) 5%, transparent)',
                border: '1px solid color-mix(in srgb, var(--trad-color-active) 19%, transparent)',
              }}
            >
              <p
                className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                style={{ color: 'var(--trad-color-active)' }}
              >
                {author.name} responds
              </p>
              <p className="font-serif text-base leading-relaxed text-fg">
                {lastResponse.response}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] text-fg-subtle">
                {remaining != null && remaining > 0
                  ? `${remaining} of ${FREE_LIMIT} questions remaining today`
                  : remaining === 0
                    ? 'No questions remaining today'
                    : null}
              </span>
              <button
                onClick={handleAskAnother}
                className="font-display text-[10px] tracking-[0.2em] uppercase transition-all hover:underline"
                style={{ color: 'var(--trad-color-active)' }}
              >
                Ask another →
              </button>
            </div>
          </div>
        )}

        {/* Question input */}
        {isAuthenticated && !isAtLimit && !lastResponse && (
          <div>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
              }}
              placeholder={`Ask ${author.name} anything…`}
              rows={3}
              maxLength={500}
              className="w-full rounded-[8px] px-3 py-2.5 text-sm font-sans resize-none transition-colors
                         bg-surface-input border border-border text-fg placeholder:text-fg-subtle
                         focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': 'var(--trad-color-active)' } as React.CSSProperties}
            />

            <div className="flex items-center justify-between mt-3">
              <span className="font-sans text-[10px] text-fg-subtle">
                ↵ to send · ⇧↵ for newline
              </span>
              <button
                onClick={handleSubmit}
                disabled={question.trim().length < 3 || isPending}
                className="font-display text-xs tracking-wider uppercase px-5 py-2 rounded-full transition-all
                           disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-fg-inverse"
                style={{ background: 'var(--trad-color-active)' }}
              >
                {isPending ? 'Asking…' : 'Ask'}
              </button>
            </div>

            {isError && !isAtLimit && (
              <p className="font-sans text-xs text-danger mt-2">
                The philosopher could not be reached. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main ConversePage ─────────────────────────────────────────────────────────

export function ConversePage() {
  const { data: authors = [], isLoading, isError } = useAuthors()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selectedAuthor = authors.find(a => a.id === selectedId) ?? null

  // Default to first author once loaded
  useEffect(() => {
    if (authors.length > 0 && selectedId === null) {
      setSelectedId(authors[0].id)
    }
  }, [authors, selectedId])

  return (
    <main className="min-h-screen bg-surface-base page-utility py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <header className="text-center mb-10">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
            Ask the Philosopher
          </p>
          <h1 className="font-display text-3xl text-fg mb-3 title-glow-hover">
            Converse
          </h1>
          <p className="font-sans text-sm text-fg-muted max-w-sm mx-auto leading-relaxed">
            Select a philosopher and ask them anything. Their answers draw only from
            their actual writings.
          </p>
        </header>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-16 rounded-card bg-surface animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <p className="font-sans text-sm text-fg-subtle text-center py-16">
            Could not load philosophers. Is the backend running?
          </p>
        )}

        {!isLoading && !isError && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left: philosopher grid */}
            <div className="lg:w-72 shrink-0">
              <p className="font-display text-[9px] tracking-[0.25em] uppercase text-fg-subtle mb-3">
                Choose a philosopher
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                {authors.map(author => (
                  <PhilosopherCard
                    key={author.id}
                    author={author}
                    isSelected={author.id === selectedId}
                    onClick={() => setSelectedId(author.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right: conversation panel */}
            <div className="flex-1 min-w-0">
              {selectedAuthor ? (
                <ConversationPanel author={selectedAuthor} />
              ) : (
                <div className="rounded-card border border-border
                                bg-surface p-10 text-center">
                  <p className="font-sans text-sm text-fg-subtle">
                    Select a philosopher to begin.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </main>
  )
}

// src/features/ai/AskPhilosopherModal.tsx
// Shared modal used from QuoteCard, PassageCard, AuthorPage, and ConversePage.

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAskByQuote, useAskByAuthor, is429 } from '../../hooks/useAskPhilosopher'
import type { Quote, Author } from '../../types/quote'

interface Props {
  // Provide one of: quote (has author embedded) or author (no specific quote)
  quote?: Quote
  author?: Author
  tradColors?: { light: string; dark: string }
  onClose: () => void
}

const FREE_LIMIT = 3
const MAX_CHARS  = 500

export function AskPhilosopherModal({ quote, author, tradColors, onClose }: Props) {
  const { isAuthenticated } = useAuth()
  const [question, setQuestion] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const byQuote  = useAskByQuote()
  const byAuthor = useAskByAuthor()

  const mutation      = quote ? byQuote : byAuthor
  const lastResponse  = quote ? byQuote.lastResponse : byAuthor.lastResponse
  const clearResponse = quote ? byQuote.clearResponse : byAuthor.clearResponse

  const displayAuthor = quote?.author ?? author
  const isPending     = mutation.isPending
  const isAtLimit     = mutation.isError && is429(mutation.error)
  const remaining     = lastResponse?.questions_remaining // null = unlimited

  const charsLeft = MAX_CHARS - question.length
  const nearLimit = charsLeft <= 60

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = () => {
    if (!question.trim() || isPending) return
    if (quote) {
      byQuote.mutate({ quoteId: quote.id, question: question.trim() })
    } else if (author?.slug) {
      byAuthor.mutate({ authorSlug: author.slug, question: question.trim() })
    }
  }

  const handleAskAnother = () => {
    clearResponse()
    mutation.reset()
    setQuestion('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return createPortal(
    /* Backdrop */
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] flex items-end sm:items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-0 sm:p-4"
      style={{ top: 0, height: '100dvh' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={`Ask ${displayAuthor?.name ?? 'the philosopher'}`}
    >
      {/* Modal panel — sets per-tradition CSS vars for portal context */}
      <div
        className="animate-modal-rise relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border overflow-hidden
                   flex flex-col
                   bg-surface-modal border-border
                   dark:border-[var(--color-accent-20)]"
        style={{
          boxShadow:         'var(--shadow-ask-modal)',
          minHeight:         '60dvh',
          maxHeight:         '85dvh',
          '--trad-color':    tradColors?.light ?? 'var(--color-accent)',
          '--trad-color-dk': tradColors?.dark  ?? 'var(--color-accent)',
        } as React.CSSProperties}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full shrink-0" style={{ background: 'var(--trad-color-active)' }} />

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 flex flex-col p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p
                className="font-display text-[9px] tracking-[0.28em] uppercase mb-1"
                style={{ color: 'var(--trad-color-active)' }}
              >
                Ask the Philosopher
              </p>
              <h2 className="font-display text-xl text-fg-muted">
                {displayAuthor?.name ?? 'Unknown'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-fg-subtle hover:text-fg transition-colors p-2 -mr-2 rounded-full
                         focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Focal quote preview */}
          {quote && !lastResponse && (
            <div
              className="mb-4 rounded-[6px] px-3 py-2.5 text-xs italic font-sans leading-relaxed text-fg-muted"
              style={{
                background:  'color-mix(in srgb, var(--trad-color-active) 6%, transparent)',
                borderLeft:  '2px solid color-mix(in srgb, var(--trad-color-active) 25%, transparent)',
              }}
            >
              "{quote.text}"
            </div>
          )}

          {/* Unauthenticated */}
          {!isAuthenticated && (
            <div className="text-center py-6">
              <p className="font-sans text-sm text-fg-muted mb-4">
                Sign in to converse with {displayAuthor?.name ?? 'the philosopher'}.
              </p>
              <Link
                to="/auth/login"
                className="font-display text-xs tracking-wider uppercase px-4 py-2 rounded-full text-accent-text transition-all hover:opacity-90"
                style={{ background: 'var(--trad-color-active)' }}
                onClick={onClose}
              >
                Sign in
              </Link>
            </div>
          )}

          {/* At daily limit */}
          {isAuthenticated && isAtLimit && (
            <div className="text-center py-6">
              <p className="text-3xl mb-3">⧖</p>
              <p className="font-display text-sm text-fg mb-1">
                Today's questions are spent.
              </p>
              <p className="font-sans text-xs text-fg-subtle">
                {displayAuthor?.name ?? 'The philosopher'} will await your return tomorrow.
              </p>
            </div>
          )}

          {/* Response */}
          {isAuthenticated && !isAtLimit && lastResponse && (
            <div>
              <div
                className="rounded-[8px] p-4 mb-4"
                style={{
                  background: 'color-mix(in srgb, var(--trad-color-active) 5%, transparent)',
                  border:     '1px solid color-mix(in srgb, var(--trad-color-active) 19%, transparent)',
                }}
              >
                <p
                  className="font-display text-[9px] tracking-[0.2em] uppercase mb-2"
                  style={{ color: 'var(--trad-color-active)' }}
                >
                  {displayAuthor?.name ?? 'Response'}
                </p>
                <p className="font-serif text-sm md:text-base leading-relaxed text-fg-muted">
                  {lastResponse.response}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-sans text-[10px] text-fg-subtle">
                  {remaining != null
                    ? remaining > 0
                      ? `${remaining} of ${FREE_LIMIT} questions remaining today`
                      : 'No questions remaining today'
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
            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
                  }}
                  placeholder={`Ask ${displayAuthor?.name ?? 'them'} anything…`}
                  maxLength={MAX_CHARS}
                  className="flex-1 w-full rounded-[8px] px-3 py-2.5 text-[16px] md:text-sm font-sans resize-none transition-colors
                             bg-surface-input border border-border text-fg placeholder:text-fg-subtle
                             focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': 'var(--trad-color-active)' } as React.CSSProperties}
                />
                {/* Character counter */}
                <span
                  className={`absolute bottom-2 right-2 font-sans text-[10px] transition-colors ${
                    charsLeft <= 20 ? 'text-danger' : nearLimit ? 'text-fg-subtle' : 'text-fg-dim'
                  }`}
                >
                  {charsLeft}
                </span>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="font-sans text-[10px] text-fg-subtle">
                  ↵ to submit · ⇧↵ for newline
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={question.trim().length < 3 || isPending}
                  className="font-display text-xs tracking-wider uppercase px-4 py-2 rounded-full transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-accent-text"
                  style={{ background: 'var(--trad-color-active)' }}
                >
                  {isPending ? 'Asking…' : 'Ask'}
                </button>
              </div>

              {mutation.isError && !isAtLimit && (
                <p className="font-sans text-xs text-danger mt-2">
                  The philosopher could not be reached. Please try again.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  )
}

// src/features/quote/CommentSection.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '../../components/common/Button'
import { commentService } from '../../services/api/comment'
import type { Comment } from '../../types/comment'

interface Props {
  quoteId: number
}

export const CommentSection = ({ quoteId }: Props) => {
  const [comment, setComment] = useState<Comment | null>(null)
  const [commentText, setCommentText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadComment = useCallback(async () => {
    try {
      const existing = await commentService.getCommentForQuote(quoteId)
      if (existing) {
        setComment(existing)
        setCommentText(existing.comment_text)
      } else {
        setComment(null)
        setCommentText('')
      }
    } catch {
      setComment(null)
      setCommentText('')
    }
  }, [quoteId])

  useEffect(() => {
    setComment(null)
    setCommentText('')
    setIsEditing(false)
    setError('')
    loadComment()
  }, [loadComment])

  const handleSave = async () => {
    if (!commentText.trim()) {
      setError('Meditation cannot be empty.')
      return
    }
    if (commentText.length > 1000) {
      setError('Meditation must be 1000 characters or fewer.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      const saved = await commentService.addOrUpdateComment({
        quote_id: quoteId,
        comment_text: commentText.trim(),
      })
      setComment(saved)
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save meditation.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!comment) return
    setConfirmingDelete(false)
    setIsSaving(true)
    try {
      await commentService.deleteComment(comment.id)
      setComment(null)
      setCommentText('')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete meditation.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setCommentText(comment?.comment_text || '')
    setIsEditing(false)
    setError('')
  }

  return (
    <div className="mt-6 border-t border-primary-200 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-sm tracking-widest uppercase text-primary-600">
            Meditations
          </h2>
          {!isVisible && comment && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans bg-accent/10 text-accent">
              1
            </span>
          )}
        </div>
        <button
          onClick={() => setIsVisible(v => !v)}
          className="text-primary-400 hover:text-primary-600 transition-colors"
          aria-label={isVisible ? 'Hide meditation' : 'Show meditation'}
        >
          {isVisible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-sans">
            {error}
          </div>
        )}

        {!isEditing && !comment && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 font-sans text-sm text-primary-400 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add a meditation
          </button>
        )}

        {!isEditing && comment && (
          <div className="bg-surface-elevated rounded-card border border-primary-100 p-4">
            <p className="font-sans text-sm text-primary-800 whitespace-pre-wrap mb-3">
              {comment.comment_text}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => { setIsEditing(true); setConfirmingDelete(false) }}
                className="font-sans text-sm text-primary-500 hover:text-primary-700 transition-colors"
              >
                Edit
              </button>
              {confirmingDelete ? (
                <>
                  <span className="font-sans text-sm text-primary-500">Delete this meditation?</span>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="font-sans text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="font-sans text-sm text-primary-500 hover:text-primary-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="font-sans text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="font-sans text-xs text-primary-400 mt-2">
              Last updated {new Date(comment.updated_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {isEditing && (
          <div>
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write your meditation on this quote..."
              className="w-full px-4 py-3 font-sans text-sm text-primary-800 bg-surface-elevated border border-primary-200 rounded-card focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none outline-none"
              rows={4}
              maxLength={1000}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2 gap-2">
              <span className="font-sans text-xs text-primary-400">
                {commentText.length}/1000
              </span>
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="secondary" disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="primary" isLoading={isSaving}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

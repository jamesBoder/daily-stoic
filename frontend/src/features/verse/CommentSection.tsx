import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/common/Button";
import { commentService } from "../../services/api/comment";
import { Comment } from "../../types/comment";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

interface CommentSectionProps {
  verseId: number;
  verseReference: string;
  onCommentSaved?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  verseId,
  verseReference,
  onCommentSaved,
}) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState<Comment | null>(null);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // define loadComment before using it in useEffect
  const loadComment = useCallback(async () => {
    try {
      const existingComment =
        await commentService.getCommentForVerse(verseReference);
      if (existingComment) {
        setComment(existingComment);
        setCommentText(existingComment.comment_text);
      } else {
        // No comment found for this verse - clear any existing comment
        setComment(null);
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to load comment:", err);
      // On error, also clear to avoid showing stale data
      setComment(null);
      setCommentText("");
    }
  }, [verseReference]);

  // Load existing comment and reset state when verse changes
  useEffect(() => {
    // Reset state immediately when verse reference changes
    setComment(null);
    setCommentText("");
    setIsEditing(false);
    setError("");
    
    // Then load the comment for the new verse
    loadComment();
  }, [loadComment]);

  const handleSave = async () => {
    if (!commentText.trim()) {
      setError(t('notes.emptyError'));
      return;
    }

    if (commentText.length > 1000) {
      setError(t('notes.tooLongError'));
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedComment = await commentService.addOrUpdateComment({
        verse_id: verseId,
        verse_reference: verseReference,
        comment_text: commentText.trim(),
      });

      setComment(savedComment);
      setIsEditing(false);
      onCommentSaved?.();
    } catch (err: any) {
      setError(err.response?.data?.error || t('notes.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!comment) return;
    setConfirmingDelete(false);
    setIsSaving(true);
    try {
      await commentService.deleteComment(comment.id);
      setComment(null);
      setCommentText("");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || t('notes.deleteFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCommentText(comment?.comment_text || "");
    setIsEditing(false);
    setError("");
  };

  // Keyboard shortcut to focus comment input
  useKeyboardShortcuts([
    {
      key: 'c',
      callback: () => {
        if (!isEditing) {
          setIsEditing(true);
          // Focus textarea after state update
          setTimeout(() => {
            textareaRef.current?.focus();
          }, 0);
        } else {
          textareaRef.current?.focus();
        }
      },
    },
  ]);

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('notes.title')}
          </h2>
          {!isVisible && comment && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
              1
            </span>
          )}
        </div>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          aria-label={isVisible ? t('notes.hideNotes') : t('notes.showNotes')}
        >
          {isVisible ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!isEditing && !comment && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-2"
            aria-label={t('notes.addNote')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('notes.addNote')}
          </button>
        )}

        {!isEditing && comment && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
              {comment.comment_text}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setIsEditing(true); setConfirmingDelete(false); }}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                aria-label={t('notes.edit')}
              >
                {t('notes.edit')}
              </button>
              {confirmingDelete ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('notes.deleteConfirm')}
                  </span>
                  <button
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50"
                  >
                    {t('common.confirm')}
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                  >
                    {t('common.cancel')}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                  aria-label={t('notes.delete')}
                >
                  {t('notes.delete')}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t('notes.lastUpdated')} {new Date(comment.updated_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {isEditing && (
          <div>
            <textarea
              ref={textareaRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('notes.placeholder')}
              className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={1000}
              aria-label={t('notes.addNote')}
            />
            <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {commentText.length}/1000 {t('notes.characters')}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <Button onClick={handleCancel} variant="secondary" disabled={isSaving}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleSave} variant="primary" isLoading={isSaving}>
                  {t('notes.saveNote')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

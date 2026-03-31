import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
}

interface TutorialModalProps {
  /** Emoji or icon element shown in the header */
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  steps: TutorialStep[];
  ctaLabel?: string;
  /** Hint shown at bottom reminding user how to re-open */
  reopenHint?: string;
  onDismiss: () => void;
  'aria-label'?: string;
}

/**
 * Generic, accessible tutorial modal used across all features.
 * - One step at a time with pagination dots
 * - Compact size — never covers the app header
 * - Focus-trapped while open
 * - Escape key and backdrop click dismiss
 * - localStorage marking is handled by the caller (via useTutorial)
 */
export const TutorialModal: React.FC<TutorialModalProps> = ({
  icon,
  title,
  subtitle,
  steps,
  ctaLabel,
  reopenHint,
  onDismiss,
  'aria-label': ariaLabel,
}) => {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDismiss();
    } else {
      setStepIdx(i => i + 1);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onDismiss();
  };

  // Focus trap + Escape key
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onDismiss(); return; }
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    };

    panel.addEventListener('keydown', onKeyDown);
    first?.focus();
    return () => panel.removeEventListener('keydown', onKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <div
        ref={panelRef}
        className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--surface-card, #ece9e1)' }}
      >
        {/* Decorative top accent — warm bronze gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-accent-dark to-accent" />

        {/* Close button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-primary-400 hover:text-primary-700 hover:bg-primary-100 dark:hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
          onClick={onDismiss}
          aria-label={t('common.close', 'Close')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 text-center">
          <div className="text-2xl mb-1" aria-hidden>{icon}</div>
          <h2 className="text-base font-bold text-primary-800 dark:text-primary-100 font-display leading-tight">
            {title}
          </h2>
          {subtitle && stepIdx === 0 && (
            <p className="mt-0.5 text-xs text-primary-500 dark:text-primary-400 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Single step */}
        <div className="px-5 pb-2">
          <div className="flex gap-3 items-start p-3 rounded-xl bg-primary-50 dark:bg-primary-800/60">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-base" aria-hidden>
              {step.emoji}
            </div>
            <div>
              <p className="text-sm font-semibold text-primary-800 dark:text-primary-200 leading-tight">
                {step.title}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 leading-relaxed mt-0.5">
                {step.body}
              </p>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        {steps.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === stepIdx
                    ? 'w-4 h-1.5 bg-accent'
                    : 'w-1.5 h-1.5 bg-primary-300 dark:bg-primary-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* CTA button */}
        <div className="px-5 pb-4 pt-1">
          <button
            className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-dark active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            onClick={handleNext}
          >
            {isLast ? (ctaLabel ?? t('tutorial.gotIt', 'Got it!')) : t('tutorial.next', 'Next')}
          </button>
          {reopenHint && isLast && (
            <p className="mt-2 text-center text-xs text-primary-400 dark:text-primary-500">
              {reopenHint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

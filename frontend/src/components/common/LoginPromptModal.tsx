// src/components/common/LoginPromptModal.tsx
// Shown when guest clicks a gated action

import { Link } from 'react-router-dom'

export const LoginPromptModal = ({ action, onClose }: { action: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/50 backdrop-blur-sm px-4">
    <div className="animate-modal-rise bg-surface-card rounded-modal shadow-modal max-w-xs w-full p-8 text-center">
      <p className="font-display text-xs uppercase tracking-widest text-accent mb-4">
        Track your practice
      </p>
      <p className="font-sans text-sm text-primary-600 mb-6">
        Create a free account to {action} and build your daily streak.
      </p>
      <div className="flex flex-col gap-2">
        <Link
          to="/auth/register"
          className="font-sans text-sm font-semibold text-white bg-accent rounded-stone px-6 py-3"
          onClick={onClose}
        >
          Create account
        </Link>
        <Link
          to="/auth/login"
          className="font-sans text-sm text-primary-500 py-2"
          onClick={onClose}
        >
          Sign in
        </Link>
      </div>
    </div>
  </div>
)
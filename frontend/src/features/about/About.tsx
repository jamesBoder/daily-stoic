import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const About: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const showCTA = !isAuthenticated || isGuest;

  return (
    <div className="bg-surface-base min-h-screen">

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="font-display text-xs tracking-widest uppercase text-primary-400 mb-4">
          Daily Stoic
        </p>
        <h1 className="font-serif text-5xl text-primary-800 leading-tight mb-6">
          Ancient wisdom.<br />One quote a day.
        </h1>
        <div className="w-12 border-t border-primary-300 mx-auto mb-6" />
        <p className="font-sans text-base text-primary-500 leading-relaxed max-w-md mx-auto">
          A daily practice built on the teachings of Marcus Aurelius, Seneca,
          Epictetus, and the Stoic tradition — delivered simply, without noise.
        </p>
      </section>

      {/* What it is */}
      <section className="max-w-2xl mx-auto px-6 py-12 border-t border-primary-200">
        <h2 className="font-display text-xs tracking-widest uppercase text-primary-400 mb-6">
          The Practice
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">One quote, every morning</h3>
            <p className="font-sans text-sm text-primary-500 leading-relaxed">
              Each day a single passage from the Stoic canon — drawn from the
              Meditations, Letters to Lucilius, the Discourses, and beyond.
              Read it. Sit with it. Let it shape your day.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Save what resonates</h3>
            <p className="font-sans text-sm text-primary-500 leading-relaxed">
              Bookmark quotes that speak to you. Build a personal library of
              wisdom you can return to.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Write your meditations</h3>
            <p className="font-sans text-sm text-primary-500 leading-relaxed">
              Marcus Aurelius wrote the <em>Meditations</em> as private notes to
              himself — not for publication, but for practice. You can do the
              same. Attach your own meditation to any quote and build a record
              of your thinking over time.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Build a streak</h3>
            <p className="font-sans text-sm text-primary-500 leading-relaxed">
              The Stoics prized consistency above intensity. A daily practice —
              even five minutes — compounds. Your streak tracks that continuity.
            </p>
          </div>
        </div>
      </section>

      {/* CTA — only for non-authenticated or guests */}
      {showCTA && (
        <section className="max-w-2xl mx-auto px-6 py-12 border-t border-primary-200">
          <h2 className="font-display text-xs tracking-widest uppercase text-primary-400 mb-4">
            Begin
          </h2>
          <p className="font-sans text-sm text-primary-500 leading-relaxed mb-6">
            Creating an account is free and takes less than a minute.
            Your quotes, meditations, and streak are waiting.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/auth/register"
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Create account
            </Link>
            <Link
              to="/auth/login"
              className="font-sans text-sm text-primary-500 hover:text-primary-800 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="max-w-2xl mx-auto px-6 py-12 border-t border-primary-200">
        <h2 className="font-display text-xs tracking-widest uppercase text-primary-400 mb-6">
          Contact
        </h2>
        <div className="space-y-3 font-sans text-sm text-primary-500">
          <p>
            Found a bug or have a suggestion?{' '}
            <a
              href="mailto:hello@dailystoic.app"
              className="text-accent hover:text-accent-dark transition-colors"
            >
              hello@dailystoic.app
            </a>
          </p>
          <p>
            Instagram:{' '}
            <a
              href="https://instagram.com/dailystoicapp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-dark transition-colors"
            >
              @dailystoicapp
            </a>
          </p>
        </div>
      </section>

      {/* Footer breathing room */}
      <div className="pb-16" />
    </div>
  );
};

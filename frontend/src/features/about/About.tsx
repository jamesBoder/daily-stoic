import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const About: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuth();
  const showCTA = !isAuthenticated || isGuest;

  return (
    <div className="bg-surface-base page-utility min-h-screen">

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="font-display text-xs tracking-widest uppercase text-primary-600 mb-4">
          DailyXam
        </p>
        <h1 className="font-serif text-5xl text-primary-800 leading-tight mb-6 title-glow-hover">
          Ancient wisdom.<br />One card a day.
        </h1>
        <div className="w-12 border-t border-primary-400 mx-auto mb-6" />
        <p className="font-sans text-base text-primary-600 leading-relaxed max-w-md mx-auto">
          Xam means knowledge. A daily practice drawing from ten wisdom
          traditions — Stoicism, African philosophy, Hermeticism, Taoism,
          and more — delivered as beautiful visual cards, without noise.
        </p>
      </section>

      {/* What it is */}
      <section className="max-w-2xl mx-auto px-6 py-12 border-t border-primary-200">
        <h2 className="font-display text-xs tracking-widest uppercase text-primary-600 mb-6">
          The Practice
        </h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">One card, every morning</h3>
            <p className="font-sans text-sm text-primary-600 leading-relaxed">
              Each day a single passage drawn from across the philosophical
              traditions — the Meditations, the Tao Te Ching, the Ubuntu
              proverbs, the Hermetic Corpus, and beyond.
              Read it. Sit with it. Let it shape your day.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Beautiful visual cards</h3>
            <p className="font-sans text-sm text-primary-600 leading-relaxed">
              Every quote is presented as a richly illustrated card with theme
              artwork. Swipe to save the ones that speak to you, or share them
              directly with anyone.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Save what resonates</h3>
            <p className="font-sans text-sm text-primary-600 leading-relaxed">
              Bookmark quotes that speak to you. Build a personal library of
              wisdom you can return to.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Write your meditations</h3>
            <p className="font-sans text-sm text-primary-600 leading-relaxed">
              Marcus Aurelius wrote the <em>Meditations</em> as private notes to
              himself — not for publication, but for practice. You can do the
              same. Attach your own meditation to any quote and build a record
              of your thinking over time.
            </p>
          </div>
          <div>
            <h3 className="font-display text-base text-primary-700 mb-2">Build a streak</h3>
            <p className="font-sans text-sm text-primary-600 leading-relaxed">
              Consistency over intensity — a principle every wisdom tradition
              holds in common. A daily practice, even five minutes, compounds.
              Your streak tracks that continuity.
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
        <h2 className="font-display text-xs tracking-widest uppercase text-primary-600 mb-6">
          Contact
        </h2>
        <div className="space-y-3 font-sans text-sm text-primary-600">
          <p>
            Found a bug or have a suggestion?{' '}
            <a
              href="mailto:hello@dailyxam.app"
              className="text-accent hover:text-accent-dark hover:underline transition-colors"
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
              className="text-accent hover:text-accent-dark hover:underline transition-colors"
            >
              @dailyxamapp
            </a>
          </p>
        </div>
      </section>

      {/* Footer breathing room */}
      <div className="pb-16" />
    </div>
  );
};

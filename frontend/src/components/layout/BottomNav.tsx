import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSwipe } from '../../hooks/useSwipe';
import {
  Home,
  Bookmark,
  Clock,
  User,
  Menu,
  X,
  Settings,
  Info,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';

// ── BottomNav ──────────────────────────────────────────────────────────────────
// Mobile-only persistent tab bar. Hidden on md+ screens where the header handles
// navigation. Shown to all users including guests.
// ──────────────────────────────────────────────────────────────────────────────

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const sheetSwipe = useSwipe({ onSwipeDown: () => setSheetOpen(false) });

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Close sheet on Escape key
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const handleLogout = async () => {
    setSheetOpen(false);
    await logout();
    navigate('/');
  };

  const tabBase =
    'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium transition-all duration-150 active:scale-90 select-none focus:outline-none min-w-0 overflow-hidden';
  const tabActive = 'text-accent dark:text-accent-light';
  const tabInactive = 'text-primary-400 dark:text-primary-500';

  return (
    <>
      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-primary-200/60 dark:border-primary-700/40 bg-surface-base/95 backdrop-blur-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', willChange: 'transform', transform: 'translateZ(0)' }}
        aria-label={t('nav.mainNavigation', 'Main navigation')}
      >
        <div className="flex items-stretch h-14">

          {/* Home */}
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`}
            aria-label={t('nav.home', 'Home')}
          >
            {({ isActive }) => (
              <>
                <Home size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate w-full text-center">{t('nav.home', 'Home')}</span>
              </>
            )}
          </NavLink>

          {/* Saved */}
          <NavLink
            to="/saved"
            className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`}
            aria-label={t('nav.saved', 'Saved')}
          >
            {({ isActive }) => (
              <>
                <Bookmark size={22} strokeWidth={isActive ? 2.5 : 1.75} fill={isActive ? 'currentColor' : 'none'} />
                <span className="truncate w-full text-center">{t('nav.saved', 'Saved')}</span>
              </>
            )}
          </NavLink>

          {/* History */}
          <NavLink
            to="/history"
            className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`}
            aria-label={t('nav.history', 'History')}
          >
            {({ isActive }) => (
              <>
                <Clock size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate w-full text-center">{t('nav.history', 'History')}</span>
              </>
            )}
          </NavLink>

          {/* Profile */}
          <NavLink
            to="/profile"
            className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`}
            aria-label={t('nav.profile', 'Profile')}
          >
            {({ isActive }) => (
              <>
                <User size={22} strokeWidth={isActive ? 2.5 : 1.75} fill={isActive ? 'currentColor' : 'none'} />
                <span className="truncate w-full text-center">{t('nav.profile', 'Profile')}</span>
              </>
            )}
          </NavLink>

          {/* More */}
          <button
            className={`${tabBase} ${sheetOpen ? tabActive : tabInactive}`}
            onClick={() => setSheetOpen(true)}
            aria-label={t('nav.more', 'More')}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <Menu size={22} strokeWidth={sheetOpen ? 2.5 : 1.75} />
            <span className="truncate w-full text-center">{t('nav.more', 'More')}</span>
          </button>

        </div>
      </nav>

      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSheetOpen(false)}
      />

      {/* ── More slide-up sheet ──────────────────────────────────────────── */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.moreMenu', 'More options')}
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-primary-200/60 dark:border-primary-700/40 bg-surface-base/98 backdrop-blur-sm transition-transform duration-300 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        {...sheetSwipe}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-primary-300 dark:bg-primary-600" />
        </div>

        {/* Close button */}
        <button
          className="absolute top-3 right-4 p-2 rounded-full text-primary-400 dark:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-700 transition-colors"
          onClick={() => setSheetOpen(false)}
          aria-label={t('common.close', 'Close')}
        >
          <X size={18} />
        </button>

        {isGuest || !isAuthenticated ? (
          /* ── Guest sheet: sign-up prompt ─────────────────────────────── */
          <div className="px-4 pb-6 pt-2">
            <p className="text-xs font-semibold text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-3 px-1">
              {t('nav.more', 'More')}
            </p>
            <p className="text-sm text-primary-500 dark:text-primary-400 mb-5 px-1">
              Create a free account to save quotes, track your streak, and build a Stoic practice.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setSheetOpen(false); navigate('/auth/register'); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-white bg-accent hover:bg-accent-dark transition-colors w-full"
              >
                <UserPlus size={20} />
                Sign Up Free
              </button>
              <button
                onClick={() => { setSheetOpen(false); navigate('/auth/login'); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 transition-colors w-full"
              >
                <LogIn size={20} />
                Sign In
              </button>
            </div>
          </div>
        ) : (
          /* ── Authenticated sheet: nav links ──────────────────────────── */
          <div className="px-4 pb-4 pt-2">
            <p className="text-xs font-semibold text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-3 px-1">
              {t('nav.more', 'More')}
            </p>

            <div className="flex flex-col gap-1">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-light'
                      : 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                  }`
                }
              >
                <Settings size={20} />
                {t('nav.settings', 'Settings')}
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-light'
                      : 'text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800'
                  }`
                }
              >
                <Info size={20} />
                {t('nav.about', 'About')}
              </NavLink>

              <div className="h-px bg-primary-200 dark:bg-primary-700 my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
              >
                <LogOut size={20} />
                {t('nav.logout', 'Sign out')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BottomNav;

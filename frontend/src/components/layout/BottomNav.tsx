import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSwipe } from '../../hooks/useSwipe';
import {
  Home,
  Bookmark,
  ScrollText,
  MessageCircle,
  Menu,
  X,
  Settings,
  Info,
  LogOut,
  LogIn,
  UserPlus,
  Clock,
  Sun,
  Moon,
  Swords,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isGuest, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const sheetSwipe = useSwipe({ onSwipeDown: () => setSheetOpen(false) });

  useEffect(() => { setSheetOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheetOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const handleLogout = async () => {
    setSheetOpen(false);
    await logout();
    navigate('/');
  };

  const tabBase =
    'relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[11px] font-medium transition-all duration-150 active:scale-90 select-none focus:outline-none min-w-0 overflow-hidden';
  const tabActive   = 'text-accent';
  const tabInactive = 'text-primary-400 dark:text-fg-muted';
  const tabIndicator = (active: boolean) =>
    `absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full transition-all duration-200 ${active ? 'bg-accent opacity-100' : 'opacity-0'}`;

  const sheetItemBase =
    'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors';
  const sheetItemActive =
    'bg-accent/10 text-accent';
  const sheetItemInactive =
    'text-primary-700 hover:bg-primary-100 dark:text-fg-muted dark:hover:bg-surface-hi';

  return (
    <>
      {/* ── Tab bar ─────────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30
                   border-t border-primary-200/60 dark:border-[var(--color-border)]
                   bg-surface-base/95 dark:bg-[var(--color-overlay)] backdrop-blur-sm dark:backdrop-blur-glass"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          WebkitBackdropFilter: 'blur(20px)',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        aria-label={t('nav.mainNavigation', 'Main navigation')}
      >
        <div className="flex items-stretch h-14">

          {/* Home */}
          <NavLink to="/" end className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`} aria-label="Home">
            {({ isActive }) => (
              <>
                <span className={tabIndicator(isActive)} />
                <Home size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate w-full text-center">Home</span>
              </>
            )}
          </NavLink>

          {/* Saved */}
          <NavLink to="/saved" className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`} aria-label="Saved">
            {({ isActive }) => (
              <>
                <span className={tabIndicator(isActive)} />
                <Bookmark size={22} strokeWidth={isActive ? 2.5 : 1.75} fill={isActive ? 'currentColor' : 'none'} />
                <span className="truncate w-full text-center">Saved</span>
              </>
            )}
          </NavLink>

          {/* Traditions */}
          <NavLink to="/traditions" className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`} aria-label="Traditions">
            {({ isActive }) => (
              <>
                <span className={tabIndicator(isActive)} />
                <ScrollText size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="truncate w-full text-center">Traditions</span>
              </>
            )}
          </NavLink>

          {/* Converse */}
          <NavLink to="/converse" className={({ isActive }) => `${tabBase} ${isActive ? tabActive : tabInactive}`} aria-label="Converse">
            {({ isActive }) => (
              <>
                <span className={tabIndicator(isActive)} />
                <MessageCircle size={22} strokeWidth={isActive ? 2.5 : 1.75} fill={isActive ? 'currentColor' : 'none'} />
                <span className="truncate w-full text-center">Converse</span>
              </>
            )}
          </NavLink>

          {/* More */}
          <button
            className={`${tabBase} ${sheetOpen ? tabActive : tabInactive}`}
            onClick={() => setSheetOpen(true)}
            aria-label="More"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <span className={tabIndicator(sheetOpen)} />
            <Menu size={22} strokeWidth={sheetOpen ? 2.5 : 1.75} />
            <span className="truncate w-full text-center">More</span>
          </button>

        </div>
      </nav>

      {/* ── Backdrop ─────────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-[var(--color-overlay)] transition-opacity duration-200 ${
          sheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSheetOpen(false)}
      />

      {/* ── More slide-up sheet ──────────────────────────────────────── */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="More options"
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl
                   border-t border-primary-200/60 dark:border-[var(--color-border)]
                   bg-surface-base/98 dark:bg-[var(--color-surface-modal)] backdrop-blur-sm dark:backdrop-blur-glass
                   transition-transform duration-300 ease-out ${
                     sheetOpen ? 'translate-y-0' : 'translate-y-full'
                   }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', WebkitBackdropFilter: 'blur(20px)' }}
        {...sheetSwipe}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-primary-300 dark:bg-surface-hi" />
        </div>

        {/* Close */}
        <button
          className="absolute top-3 right-4 p-2 rounded-full text-primary-400 dark:text-fg-muted
                     hover:bg-primary-100 dark:hover:bg-surface-hi transition-colors"
          onClick={() => setSheetOpen(false)}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isGuest || !isAuthenticated ? (
          /* ── Guest sheet ──────────────────────────────────────────── */
          <div className="px-4 pb-6 pt-2">
            <p className="text-xs font-semibold text-primary-400 dark:text-fg-muted uppercase tracking-wider mb-3 px-1">
              More
            </p>
            <p className="text-sm text-primary-500 dark:text-fg-muted mb-5 px-1">
              Create a free account to save quotes, track your streak, and build a practice.
            </p>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/games"
                className={({ isActive }) =>
                  `${sheetItemBase} ${isActive ? sheetItemActive : sheetItemInactive}`
                }
              >
                <Swords size={20} />
                Agora
              </NavLink>

              <button
                onClick={() => { setSheetOpen(false); navigate('/auth/register'); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold
                           text-accent-text bg-accent
                           hover:bg-accent-dark transition-colors w-full"
              >
                <UserPlus size={20} />
                Sign Up Free
              </button>
              <button
                onClick={() => { setSheetOpen(false); navigate('/auth/login'); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                           text-primary-700 bg-primary-100 hover:bg-primary-200
                           dark:text-fg-muted dark:bg-surface-hi dark:hover:brightness-95
                           transition-colors w-full"
              >
                <LogIn size={20} />
                Sign In
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                           text-primary-700 bg-primary-100 hover:bg-primary-200
                           dark:text-fg-muted dark:bg-surface-hi dark:hover:brightness-95
                           transition-colors w-full"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        ) : (
          /* ── Authenticated sheet ──────────────────────────────────── */
          <div className="px-4 pb-4 pt-2">
            <p className="text-xs font-semibold text-primary-400 dark:text-fg-muted uppercase tracking-wider mb-3 px-1">
              More
            </p>

            <div className="flex flex-col gap-1">
              {/* Agora */}
              <NavLink
                to="/games"
                className={({ isActive }) =>
                  `${sheetItemBase} ${isActive ? sheetItemActive : sheetItemInactive}`
                }
              >
                <Swords size={20} />
                Agora
              </NavLink>

              {/* Reading History */}
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `${sheetItemBase} ${isActive ? sheetItemActive : sheetItemInactive}`
                }
              >
                <Clock size={20} />
                Reading History
              </NavLink>

              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `${sheetItemBase} ${isActive ? sheetItemActive : sheetItemInactive}`
                }
              >
                <Settings size={20} />
                {t('nav.settings', 'Settings')}
              </NavLink>

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `${sheetItemBase} ${isActive ? sheetItemActive : sheetItemInactive}`
                }
              >
                <Info size={20} />
                {t('nav.about', 'About')}
              </NavLink>

              <button
                onClick={toggleTheme}
                className={`${sheetItemBase} ${sheetItemInactive}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </button>

              <div className="h-px bg-primary-200 dark:bg-surface-hi my-1" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors
                           text-danger hover:bg-danger-bg w-full text-left"
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

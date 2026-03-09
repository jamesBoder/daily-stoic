import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

export const Header: React.FC = () => {
  const { user, logout, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes (back/forward navigation)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentLanguage: _lang } = useLanguage(); // Subscribe to language context so Header re-renders on language change

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? "shadow-md" : "shadow-sm"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400 transition-all duration-300 group-hover:brightness-125 group-hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.4)] dark:group-hover:drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">
              Daily Stoic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink
              to="/daily"
              className={({ isActive }) =>
                `font-medium transition-all duration-200 relative pb-0.5 border-b-2 ${isActive
                  ? "text-primary-600 dark:text-primary-400 border-primary-500 dark:border-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border-transparent"
                }`
              }
            >
              {t('nav.home')}
            </NavLink>
            {/* Favorites hidden for guests */}
            {!isGuest && (
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `font-medium transition-colors ${isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
              >
                {t('nav.favorites')}
              </NavLink>
            )}
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `font-medium transition-all duration-200 relative pb-0.5 border-b-2 ${isActive
                  ? "text-primary-600 dark:text-primary-400 border-primary-500 dark:border-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border-transparent"
                }`
              }
            >
              {t('nav.about')}
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `font-medium transition-all duration-200 relative pb-0.5 border-b-2 ${isActive
                  ? "text-primary-600 dark:text-primary-400 border-primary-500 dark:border-primary-400"
                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border-transparent"
                }`
              }
            >
              {t('nav.settings')}
            </NavLink>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              {isGuest ? t('auth.browsingAsGuest') : t('auth.welcome', { username: user?.username })}
            </span>
            {isGuest && (
              <Button
                onClick={() => navigate("/signup")}
                variant="primary"
                className="text-sm"
              >
                {t('nav.signup')}
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="secondary"
              className="text-sm"
            >
              {isGuest ? t('auth.exitGuest') : t('nav.logout')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <NavLink
                to="/daily"
                className={({ isActive }) =>
                  `font-medium transition-colors ${isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.home')}
              </NavLink>
              {/* Favorites hidden for guests */}
              {!isGuest && (
                <NavLink
                  to="/favorites"
                  className={({ isActive }) =>
                    `font-medium transition-colors ${isActive
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.favorites')}
                </NavLink>
              )}
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `font-medium transition-colors ${isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.about')}
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `font-medium transition-colors ${isActive
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.settings')}
              </NavLink>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {isGuest ? t('auth.browsingAsGuest') : t('auth.welcome', { username: user?.username })}
                </p>
                {isGuest && (
                  <Button
                    onClick={() => { navigate("/signup"); setIsMenuOpen(false); }}
                    variant="primary"
                    className="w-full mb-2"
                  >
                    {t('nav.signup')}
                  </Button>
                )}
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  className="w-full"
                >
                  {isGuest ? t('auth.exitGuest') : t('nav.logout')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

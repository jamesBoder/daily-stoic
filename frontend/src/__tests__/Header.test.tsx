/**
 * Header tests
 * - Active NavLink gets text-accent class when route matches
 * - Inactive links get text-primary-600 class
 */
import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from './testUtils';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com', is_guest: false },
    isAuthenticated: true,
    isGuest: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
    supportedLanguages: [],
  }),
}));

vi.mock('../hooks/useStreak', () => ({
  useStreak: () => ({ data: null, isLoading: false }),
}));

vi.mock('../contexts/SubscriptionContext', () => ({
  useSubscription: () => ({ isPremium: false, isLoading: false }),
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleTheme: vi.fn() }),
}));

// ── Import after mocks ────────────────────────────────────────────────────────
import { Header } from '../components/layout/Header';

const renderAt = (initialPath: string) =>
  renderWithProviders(<Header />, { initialPath });

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Header – NavLink active highlighting', () => {
  it('applies text-accent to Traditions link when on /traditions', () => {
    renderAt('/traditions');
    const link = screen.getByText('Traditions');
    expect(link).toHaveClass('text-accent');
  });

  it('does NOT apply text-accent to Traditions link when on /converse', () => {
    renderAt('/converse');
    const link = screen.getByText('Traditions');
    expect(link).not.toHaveClass('text-accent');
    expect(link).toHaveClass('text-primary-600');
  });

  it('applies text-accent to Converse link when on /converse', () => {
    renderAt('/converse');
    const link = screen.getByText('Converse');
    expect(link).toHaveClass('text-accent');
  });

  it('applies text-accent to Agora link when on /games', () => {
    renderAt('/games');
    const link = screen.getByText('Agora');
    expect(link).toHaveClass('text-accent');
  });

  it('shows Settings link when authenticated and not guest', () => {
    renderAt('/settings');
    const link = screen.getByText('Settings');
    expect(link).toHaveClass('text-accent');
  });
});

describe('Header – renders nav structure', () => {
  it('renders all main nav links', () => {
    renderAt('/');
    expect(screen.getByText('Traditions')).toBeInTheDocument();
    expect(screen.getByText('Reading Plans')).toBeInTheDocument();
    expect(screen.getByText('Converse')).toBeInTheDocument();
    expect(screen.getByText('Agora')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});

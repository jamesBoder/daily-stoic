/**
 * FavoritesList QoL tests
 * - No window.confirm when removing a favorite
 * - Clicking Remove (after expanding card) shows inline confirm/cancel
 * - Clicking Cancel hides the inline confirm
 * - Clicking Confirm calls removeFavorite (not window.confirm)
 */
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from './testUtils';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useFavorites', () => ({
  useFavorites: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com', is_guest: false },
    isAuthenticated: true,
    isGuest: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../utils/toast', () => ({
  showToast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../features/quote/CommentSection', () => ({
  CommentSection: () => <div data-testid="comment-section" />,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { FavoritesList } from '../features/favorites/FavoritesList';
import { useFavorites } from '../hooks/useFavorites';

const mockRemoveFavorite = vi.fn().mockResolvedValue(undefined);

const defaultFavoritesReturn = {
  favorites: [
    {
      id: 1,
      quote_id: 100,
      created_at: '2024-01-01T00:00:00Z',
      quote: {
        id: 100,
        text: 'You have power over your mind, not outside events.',
        source: 'Meditations',
        context_note: '',
        themes: ['control', 'virtue'],
        tier: 'free' as const,
        author: { id: 1, name: 'Marcus Aurelius', slug: 'marcus-aurelius' },
        tradition: { id: 1, name: 'Stoicism', slug: 'stoicism', tier: 'free' as const },
      },
    },
  ],
  isLoading: false,
  error: null,
  removeFavorite: mockRemoveFavorite,
  isFavorited: () => true,
  getFavoriteId: () => 1,
  isAdding: false,
  isRemoving: false,
  refetch: vi.fn(),
};

const renderComponent = () =>
  renderWithProviders(<FavoritesList />);

// Click the quote text to expand the card — reveals the Remove button
const expandCard = () =>
  fireEvent.click(screen.getByText(/You have power over your mind/, { exact: false }));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('FavoritesList – inline remove confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn() as any;
    vi.mocked(useFavorites).mockReturnValue(defaultFavoritesReturn as any);
  });

  it('shows the Remove button after expanding a card', () => {
    renderComponent();
    expandCard();
    expect(screen.getByText('favorites.remove')).toBeInTheDocument();
  });

  it('does NOT call window.confirm when clicking Remove', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('shows inline Confirm and Cancel after clicking Remove', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    expect(screen.getByText('common.confirm')).toBeInTheDocument();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.queryByText('favorites.remove')).not.toBeInTheDocument();
  });

  it('hides inline confirm and shows Remove again after Cancel', () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    fireEvent.click(screen.getByText('common.cancel'));
    expect(screen.getByText('favorites.remove')).toBeInTheDocument();
    expect(screen.queryByText('common.confirm')).not.toBeInTheDocument();
  });

  it('calls removeFavorite (not window.confirm) when Confirm is clicked', async () => {
    renderComponent();
    expandCard();
    fireEvent.click(screen.getByText('favorites.remove'));
    fireEvent.click(screen.getByText('common.confirm'));
    await waitFor(() => expect(mockRemoveFavorite).toHaveBeenCalledWith(1));
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

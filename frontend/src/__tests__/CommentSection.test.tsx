/**
 * CommentSection tests
 * - No window.confirm for delete — uses inline confirm/cancel
 * - Clicking Delete shows Confirm and Cancel buttons
 * - Clicking Cancel returns to normal view
 * - Clicking Confirm calls deleteComment
 * - Note badge "1" appears when collapsed and comment exists
 * - Badge hidden when expanded
 * - No badge when no comment
 */
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { renderWithProviders } from './testUtils';

// ── Mocks ─────────────────────────────────────────────────────────────────────
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: 'en' },
  }),
}));

vi.mock('../services/api/comment', () => ({
  commentService: {
    getCommentForQuote: vi.fn().mockResolvedValue({
      id: 42,
      comment_text: 'My note',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }),
    addOrUpdateComment: vi.fn(),
    deleteComment: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com' },
    isAuthenticated: true,
    isGuest: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../utils/toast', () => ({
  showToast: { error: vi.fn(), success: vi.fn() },
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { CommentSection } from '../features/quote/CommentSection';
import { commentService } from '../services/api/comment';

const withComment = {
  id: 42,
  comment_text: 'My note',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const renderComponent = () =>
  renderWithProviders(<CommentSection quoteId={1} />);

const expandSection = async () => {
  const toggleBtn = await screen.findByRole('button', { name: /show meditation/i });
  fireEvent.click(toggleBtn);
  await screen.findByText('Delete');
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('CommentSection – inline delete confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn() as any;
    vi.mocked(commentService.getCommentForQuote).mockResolvedValue(withComment as any);
    vi.mocked(commentService.deleteComment).mockResolvedValue(undefined as any);
  });

  it('shows the Delete button after expanding', async () => {
    renderComponent();
    await expandSection();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does NOT call window.confirm when Delete is clicked', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('Delete'));
    expect(window.confirm).not.toHaveBeenCalled();
  });

  it('shows Confirm and Cancel after clicking Delete', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('Delete'));
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('returns to normal view after clicking Cancel', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument();
  });

  it('calls deleteComment (not window.confirm) when Confirm is clicked', async () => {
    renderComponent();
    await expandSection();
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByText('Confirm'));
    await waitFor(() =>
      expect(commentService.deleteComment).toHaveBeenCalledWith(42)
    );
    expect(window.confirm).not.toHaveBeenCalled();
  });
});

describe('CommentSection – note badge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(commentService.getCommentForQuote).mockResolvedValue(withComment as any);
  });

  it('shows badge "1" when collapsed and comment exists', async () => {
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForQuote).toHaveBeenCalled()
    );
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument());
  });

  it('hides badge when section is expanded', async () => {
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForQuote).toHaveBeenCalled()
    );
    const toggleBtn = await screen.findByRole('button', { name: /show meditation/i });
    fireEvent.click(toggleBtn);
    await waitFor(() =>
      expect(screen.queryByText('1')).not.toBeInTheDocument()
    );
  });

  it('shows no badge when no comment exists', async () => {
    vi.mocked(commentService.getCommentForQuote).mockResolvedValue(null as any);
    renderComponent();
    await waitFor(() =>
      expect(commentService.getCommentForQuote).toHaveBeenCalled()
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });
});

/**
 * Settings tests
 * - showToast.error called with 'settings.saveFailed' when updateSettings throws
 * - showToast.success called and no error toast when save succeeds
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'Test', email: 'test@test.com', is_guest: false },
    isAuthenticated: true,
    isGuest: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({ isDarkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    currentLanguage: 'en',
    changeLanguage: vi.fn(),
    supportedLanguages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ],
  }),
}));

vi.mock('../services/api/settings', () => ({
  settingsService: {
    getSettings: vi.fn().mockResolvedValue({
      email_notifications: true,
      daily_verse_reminder: true,
      preferred_language: 'en',
    }),
    updateSettings: vi.fn().mockRejectedValue(new Error('Server error')),
  },
}));

vi.mock('../services/api/profile', () => ({
  profileService: {
    getProfile: vi.fn().mockResolvedValue({
      id: 1, username: 'Test', email: 'test@test.com',
      created_at: '2024-01-01T00:00:00Z',
    }),
  },
}));

vi.mock('../services/api/onboarding', () => ({
  onboardingApi: { reset: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('../utils/toast', () => ({
  showToast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../features/profile/AccountManagement', () => ({
  AccountManagement: () => <div data-testid="account-management" />,
}));
vi.mock('../features/profile/GuestAccountManagement', () => ({
  GuestAccountManagement: () => <div data-testid="guest-account-management" />,
}));
vi.mock('../features/profile/ProfileEditForm', () => ({
  ProfileEditForm: () => <div data-testid="profile-edit-form" />,
}));

// ── Imports after mocks ───────────────────────────────────────────────────────
import { Settings } from '../features/profile/Settings';
import { settingsService } from '../services/api/settings';
import { showToast } from '../utils/toast';

const renderComponent = () =>
  renderWithProviders(<Settings />);

// The save button lives in the Notifications section — find it by its i18n key
// (mock returns fallback: "Save")
const clickSave = async () => {
  const saveBtn = await screen.findByText('Save');
  fireEvent.click(saveBtn);
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('Settings – save error shows toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(settingsService.getSettings).mockResolvedValue({
      email_notifications: true,
      daily_verse_reminder: true,
      preferred_language: 'en',
    } as any);
  });

  it('calls showToast.error with Failed message when updateSettings throws', async () => {
    vi.mocked(settingsService.updateSettings).mockRejectedValue(new Error('Server error'));
    renderComponent();
    await clickSave();
    await waitFor(() => {
      expect(showToast.error).toHaveBeenCalledWith('Failed to save settings');
    });
  });

  it('does NOT call showToast.error when save succeeds', async () => {
    vi.mocked(settingsService.updateSettings).mockResolvedValue({} as any);
    renderComponent();
    await clickSave();
    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalledWith('Settings saved');
    });
    expect(showToast.error).not.toHaveBeenCalled();
  });
});

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { settingsService } from '../services/api/settings';
import toast from 'react-hot-toast';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (language: string) => Promise<void>;
  supportedLanguages: Array<{ code: string; name: string }>;
  isChangingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ht', name: 'Kreyòl Ayisyen' },
];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  // Load user's language preference on mount or when user changes.
  // Compare against i18n.language (not currentLanguage state) to avoid adding
  // currentLanguage to deps, which would cause an infinite update loop.
  useEffect(() => {
    const loadUserLanguage = async () => {
      if (isAuthenticated && user) {
        try {
          const settings = await settingsService.getSettings();
          if (settings.preferred_language && settings.preferred_language !== i18n.language) {
            await i18n.changeLanguage(settings.preferred_language);
            setCurrentLanguage(settings.preferred_language);
          }
        } catch (error) {
          // Silently handle error - user might not have settings yet
          console.log('No user settings found, using default language');
        }
      } else {
        // For guest users, check localStorage
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && savedLanguage !== i18n.language) {
          await i18n.changeLanguage(savedLanguage);
          setCurrentLanguage(savedLanguage);
        }
      }
    };

    loadUserLanguage();
  // user?.id scopes the dep to identity changes only — full `user` would re-run on every
  // reference change, and adding `currentLanguage` would cause an infinite update loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, i18n]);

  const changeLanguage = async (language: string) => {
    setIsChangingLanguage(true);
    try {
      // Change the language in i18next
      await i18n.changeLanguage(language);
      setCurrentLanguage(language);

      if (isAuthenticated && user) {
        // Save to backend for authenticated users
        try {
          await settingsService.updateSettings({ preferred_language: language });
          // Also save to localStorage as backup
          localStorage.setItem('preferredLanguage', language);
          toast.success('Language preference saved');
        } catch (error: any) {
          console.error('Failed to save language preference to server:', error);
          // Always save to localStorage as fallback
          localStorage.setItem('preferredLanguage', language);
          // Don't show error - language still changed in UI
          toast.success('Language changed');
        }
      } else {
        // Save to localStorage for guest users
        localStorage.setItem('preferredLanguage', language);
        toast.success('Language changed');
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error('Failed to change language');
    } finally {
      setIsChangingLanguage(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        supportedLanguages,
        isChangingLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
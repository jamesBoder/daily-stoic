import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { AccountManagement } from "./AccountManagement";
import { GuestAccountManagement } from "./GuestAccountManagement";
import { ProfileEditForm } from "./ProfileEditForm";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { formatDate } from "../../utils/date";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../contexts/LanguageContext";
import { useTranslation } from "react-i18next";
import { settingsService } from "../../services/api/settings";
import { onboardingApi } from "../../services/api/onboarding";
import { showToast } from "../../utils/toast";
import { SettingsToggle } from "../../components/ui/SettingsToggle";

interface SettingsState {
  emailNotifications: boolean;
  dailyVerseReminder: boolean;
  language: string;
}

type SectionId = "profile" | "practice" | "appearance" | "notifications" | "language" | "account";

interface SectionDef {
  id: SectionId;
  label: string;
  guestOnly?: boolean;
  authOnly?: boolean;
}

export const Settings: React.FC = () => {
  const { isGuest } = useAuth();
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(!isGuest);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    emailNotifications: true,
    dailyVerseReminder: true,
    language: currentLanguage,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Section refs for scroll-jump
  const navigate = useNavigate();
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);

  const sectionRefs: Record<SectionId, React.RefObject<HTMLDivElement | null>> = {
    profile: useRef<HTMLDivElement>(null),
    practice: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    language: useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null),
  };

  const handleRevisitOnboarding = async () => {
    setIsResettingOnboarding(true);
    try {
      await onboardingApi.reset();
      navigate("/onboarding");
    } catch {
      showToast.error("Could not reset onboarding. Please try again.");
    } finally {
      setIsResettingOnboarding(false);
    }
  };

  const sections: SectionDef[] = [
    { id: "profile", label: t("settings.tabs.profile", "Profile"), authOnly: true },
    { id: "practice", label: "Your Practice", authOnly: true },
    { id: "appearance", label: t("settings.appearance.title", "Appearance") },
    { id: "notifications", label: t("settings.notifications.title", "Notifications") },
    { id: "language", label: t("settings.language.title", "Language") },
    { id: "account", label: t("settings.tabs.account", "Account") },
  ];

  const visibleSections = sections.filter(s => {
    if (s.authOnly && isGuest) return false;
    return true;
  });

  const scrollToSection = (id: SectionId) => {
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Load profile
  useEffect(() => {
    if (isGuest) return;
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const data = await profileService.getProfile();
        setProfile(data);
      } catch (err: any) {
        setProfileError(err.message || "Failed to load profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [isGuest]);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!isGuest) {
        try {
          const userSettings = await settingsService.getSettings();
          setSettings({
            emailNotifications: userSettings.email_notifications,
            dailyVerseReminder: userSettings.daily_verse_reminder,
            language: userSettings.preferred_language,
          });
        } catch (error) {
          console.error("Failed to load settings:", error);
          showToast.error(t("settings.loadFailed", "Failed to load settings"));
        }
      }
    };
    loadSettings();
  }, [isGuest]);

  // Sync language from context
  useEffect(() => {
    setSettings(prev => ({ ...prev, language: currentLanguage }));
  }, [currentLanguage]);

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSettings(prev => ({ ...prev, language: newLanguage }));
    await changeLanguage(newLanguage);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditingProfile(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!isGuest) {
        await settingsService.updateSettings({
          email_notifications: settings.emailNotifications,
          daily_verse_reminder: settings.dailyVerseReminder,
        });
      }
      showToast.success(t("settings.saved", "Settings saved"));
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast.error(t("settings.saveFailed", "Failed to save settings"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-primary-600 dark:text-primary-400 mb-6 title-glow-hover">
        {t("settings.title", "Settings")}
      </h1>

      {/* Section quick-jump pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {visibleSections.map(section => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-accent hover:text-white hover:border-accent transition-all duration-150"
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="space-y-10">

        {/* ── Profile section ── */}
        {!isGuest && (
          <section ref={sectionRefs.profile} id="section-profile">
            <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
              {t("settings.tabs.profile", "Profile")}
            </h2>
            <Card>
              {isLoadingProfile ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-primary-400">{t("common.loading", "Loading…")}</div>
                </div>
              ) : profileError ? (
                <div className="text-red-600 dark:text-red-400 py-4">Error: {profileError}</div>
              ) : profile ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold text-primary-700 dark:text-primary-300">
                      {t("profile.information", "Profile Information")}
                    </h3>
                    <Button onClick={() => setIsEditingProfile(!isEditingProfile)} variant="secondary">
                      {isEditingProfile ? t("common.cancel", "Cancel") : t("profile.editProfile", "Edit")}
                    </Button>
                  </div>

                  {isEditingProfile ? (
                    <ProfileEditForm initialProfile={profile} onUpdate={handleProfileUpdate} />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-primary-400 dark:text-primary-500">{t("profile.username", "Username")}</p>
                        <p className="text-base text-primary-800 dark:text-primary-100">{profile.username}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary-400 dark:text-primary-500">{t("profile.email", "Email")}</p>
                        <p className="text-base text-primary-800 dark:text-primary-100">{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-primary-400 dark:text-primary-500">{t("profile.memberSince", "Member since")}</p>
                        <p className="text-base text-primary-800 dark:text-primary-100">
                          {formatDate(profile.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </Card>
          </section>
        )}

        {/* ── Your Practice section ── */}
        {!isGuest && (
          <section ref={sectionRefs.practice} id="section-practice">
            <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
              Your Practice
            </h2>
            <Card>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
                Revisit your onboarding to update your traditions, goals, and notification preferences.
              </p>
              <Button
                onClick={handleRevisitOnboarding}
                disabled={isResettingOnboarding}
                variant="secondary"
              >
                {isResettingOnboarding ? "Loading…" : "Revisit Onboarding"}
              </Button>
            </Card>
          </section>
        )}

        {/* ── Appearance section ── */}
        <section ref={sectionRefs.appearance} id="section-appearance">
          <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
            {t("settings.appearance.title", "Appearance")}
          </h2>
          <Card>
            <SettingsToggle
              label={t("settings.appearance.darkMode", "Dark Mode")}
              description={t("settings.appearance.darkModeDescription", "Switch between light and dark parchment themes")}
              checked={isDarkMode}
              onChange={() => toggleTheme()}
            />
          </Card>
        </section>

        {/* ── Notifications section ── */}
        <section ref={sectionRefs.notifications} id="section-notifications">
          <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
            {t("settings.notifications.title", "Notifications")}
          </h2>
          <Card>
            <SettingsToggle
              label={t("settings.notifications.emailNotifications", "Email Notifications")}
              description={t("settings.notifications.emailDescription", "Receive occasional updates about your practice")}
              checked={settings.emailNotifications}
              onChange={val => setSettings(prev => ({ ...prev, emailNotifications: val }))}
              disabled={isGuest}
            />
            <SettingsToggle
              label={t("settings.notifications.dailyReminder", "Daily Reminder")}
              description={t("settings.notifications.reminderDescription", "Get a daily reminder to read your meditation")}
              checked={settings.dailyVerseReminder}
              onChange={val => setSettings(prev => ({ ...prev, dailyVerseReminder: val }))}
              disabled={isGuest}
            />
            {!isGuest && (
              <div className="pt-3 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? t("settings.saving", "Saving…") : t("settings.save", "Save")}
                </Button>
              </div>
            )}
          </Card>
        </section>

        {/* ── Language section ── */}
        <section ref={sectionRefs.language} id="section-language">
          <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
            {t("settings.language.title", "Language")}
          </h2>
          <Card>
            <label className="block text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
              {t("settings.language.preferredLanguage", "Preferred Language")}
            </label>
            <select
              value={settings.language}
              onChange={handleLanguageChange}
              className="block w-full border border-primary-200 dark:border-primary-600 rounded-md p-2 bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-primary-100 focus:ring-2 focus:ring-accent focus:outline-none"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(`settings.language.languages.${lang.code}`, lang.code)}
                </option>
              ))}
            </select>
          </Card>
        </section>

        {/* ── Account section ── */}
        <section ref={sectionRefs.account} id="section-account">
          <h2 className="text-lg font-display font-semibold text-primary-700 dark:text-primary-300 mb-4 scroll-mt-20">
            {t("settings.tabs.account", "Account")}
          </h2>
          {isGuest ? <GuestAccountManagement /> : <AccountManagement />}
        </section>

      </div>
    </div>
  );
};

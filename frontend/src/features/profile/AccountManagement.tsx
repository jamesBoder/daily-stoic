import React, { useState } from "react";
import { formatDate } from "../../utils/date";
import { useTranslation } from "react-i18next";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { oauthService } from "../../services/api/oauth";
import { profileService } from "../../services/api/profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { historyService } from "../../services/api/history";
import { showToast } from "../../utils/toast";

export const AccountManagement: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Set password state (for OAuth users)
  const [showSetPasswordForm, setShowSetPasswordForm] = useState(false);
  const [newPasswordData, setNewPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [newPasswordSuccess, setNewPasswordSuccess] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Export data state
  const [isExporting, setIsExporting] = useState(false);

  // Clear history state
  const [confirmingClearHistory, setConfirmingClearHistory] = useState(false);
  const queryClient = useQueryClient();
  const clearHistoryMutation = useMutation({
    mutationFn: () => historyService.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      setConfirmingClearHistory(false);
    },
    onError: () => {
      showToast.error(t("history.clearFailed"));
    },
  });

  // Google account linking state
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);
  const [isUnlinkingGoogle, setIsUnlinkingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  // Set password handlers (for OAuth users)
  const handleSetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setNewPasswordError(null);
  };

  const handleSetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordError(null);
    setNewPasswordSuccess(false);

    // Validation
    if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
      setNewPasswordError(t('account.passwordsDoNotMatch'));
      return;
    }

    if (newPasswordData.newPassword.length < 8) {
      setNewPasswordError(t('account.passwordTooShort'));
      return;
    }

    try {
      // Call the set password API
      await profileService.setPassword(
        newPasswordData.newPassword,
        newPasswordData.confirmPassword
      );

      // Show success message
      setNewPasswordSuccess(true);
      
      // Reset form
      setNewPasswordData({
        newPassword: "",
        confirmPassword: "",
      });

      // Refresh user data to update state
      await refreshUser();

      // Close form after delay
      setTimeout(() => {
        setNewPasswordSuccess(false);
        setShowSetPasswordForm(false);
      }, 2000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.details || t('account.failedToSetPassword');
      setNewPasswordError(errorMsg);
    }
  };

  // Password change handlers
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPasswordError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('account.newPasswordsDoNotMatch'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('account.passwordTooShort'));
      return;
    }

    if (!passwordData.currentPassword) {
      setPasswordError(t('account.currentPasswordRequired'));
      return;
    }

    try {
      // Call the password change API
      await profileService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Show success message
      setPasswordSuccess(true);
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Close form after delay
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 2000);
    } catch (error: any) {
      // Error handling is done in the service with toast notifications
      // Set a generic error message for the form
      const errorMsg = error.response?.data?.error || error.response?.data?.details || t('account.failedToChangePassword');
      setPasswordError(errorMsg);
    }
  };

  // Delete account handlers
  const handleDeleteAccount = async () => {
    setDeleteError(null);

    if (hasPassword && !deletePassword) {
      setDeleteError(t('account.enterPasswordConfirm'));
      return;
    }

    try {
      await profileService.deleteAccount(deletePassword || undefined);
      await logout();
      navigate("/signup");
    } catch (error: any) {
      const msg = error.response?.data?.error || error.message || t('account.failedToDeleteAccount');
      setDeleteError(msg);
    }
  };

  // Export data handler
  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const [profile, stats] = await Promise.all([
        profileService.getProfile(),
        profileService.getStats(),
      ]);

      const data = {
        exported_at: new Date().toISOString(),
        profile: {
          username: profile.username,
          email: profile.email,
          created_at: profile.created_at,
        },
        stats,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `daily-stoic-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showToast.error(t('account.exportFailed', 'Failed to export data'));
    } finally {
      setIsExporting(false);
    }
  };

  // Google OAuth handlers
  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    setGoogleError(null);

    try {
      window.location.href = oauthService.getGoogleLoginUrl();
    } catch (error: any) {
      setGoogleError(error.message || t('account.failedToLinkGoogle'));
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setGoogleError(null);

    setIsUnlinkingGoogle(true);

    try {
      // Call API to unlink Google account
      await oauthService.unlinkGoogle();

      // Refresh user data to show updated state
      await refreshUser();

      // Reset state
      setShowUnlinkConfirm(false);
    } catch (error: any) {
      // Check if error is about missing password
      const errorMsg = error.response?.data?.error || error.message || "Failed to unlink Google account";
      
      if (errorMsg.includes("no password set") || errorMsg.includes("password")) {
        setGoogleError(t('account.unlinkGooglePasswordRequired'));
      } else {
        setGoogleError(errorMsg);
      }
    } finally {
      setIsUnlinkingGoogle(false);
    }
  };

  // Determine if user likely has a password set
  // If user signed up with Google and email matches google_email, they likely don't have a password
  const hasPassword = user?.email !== user?.google_email || !user?.is_google_linked;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Clear History */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          {t("history.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          {t("history.clearDesc")}
        </p>
        {confirmingClearHistory ? (
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("history.clearConfirm")}
            </span>
            <div className="flex gap-2">
              <Button
                onClick={() => clearHistoryMutation.mutate()}
                variant="danger"
                isLoading={clearHistoryMutation.isPending}
                className="text-sm"
              >
                {t("common.confirm")}
              </Button>
              <Button
                onClick={() => setConfirmingClearHistory(false)}
                variant="secondary"
                className="text-sm"
              >
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={() => setConfirmingClearHistory(true)}
              variant="danger"
            >
              {t("history.clear")}
            </Button>
          </div>
        )}
      </Card>

      {/* Set/Change Password */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          {hasPassword ? t('settings.account.changePassword') : t('account.setPassword')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          {hasPassword ? t('account.changePasswordDesc') : t('account.setPasswordDesc')}
        </p>

        {/* Set Password Form (for OAuth users without password) */}
        {!hasPassword && !showSetPasswordForm && (
          <span className="flex items-center justify-center">
            <Button onClick={() => setShowSetPasswordForm(true)}>
              {t('account.setPassword')}
            </Button>
          </span>
        )}

        {!hasPassword && showSetPasswordForm && (
          <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
            {newPasswordError && <div className="text-red-500 text-sm">{newPasswordError}</div>}
            {newPasswordSuccess && (
              <div className="text-green-500 dark:text-green-400 text-sm">
                {t('account.passwordSetSuccess')}
              </div>
            )}
            <Input type="password" name="newPassword" label={t('settings.account.newPassword')} value={newPasswordData.newPassword} onChange={handleSetPasswordChange} required />
            <Input type="password" name="confirmPassword" label={t('settings.account.confirmPassword')} value={newPasswordData.confirmPassword} onChange={handleSetPasswordChange} required />
            <div className="flex gap-2">
              <Button type="submit">{t('account.setPassword')}</Button>
              <Button type="button" onClick={() => { setShowSetPasswordForm(false); setNewPasswordData({ newPassword: "", confirmPassword: "" }); setNewPasswordError(null); }}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        )}

        {/* Change Password Form (for users with password) */}
        {hasPassword && !showPasswordForm && (
          <span className="flex items-center justify-center">
            <Button onClick={() => setShowPasswordForm(true)}>
              {t('settings.account.changePassword')}
            </Button>
          </span>
        )}

        {hasPassword && showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordError && <div className="text-red-500 dark:text-gray-400 text-sm">{passwordError}</div>}
            {passwordSuccess && (
              <div className="text-green-500 dark:text-green-400 text-sm">
                {t('account.passwordChangedSuccess')}
              </div>
            )}
            <Input type="password" name="currentPassword" label={t('settings.account.currentPassword')} value={passwordData.currentPassword} onChange={handlePasswordChange} required />
            <Input type="password" name="newPassword" label={t('settings.account.newPassword')} value={passwordData.newPassword} onChange={handlePasswordChange} required />
            <Input type="password" name="confirmPassword" label={t('account.confirmNewPassword')} value={passwordData.confirmPassword} onChange={handlePasswordChange} required />
            <div className="flex gap-2">
              <Button type="submit">{t('account.savePassword')}</Button>
              <Button type="button" onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPasswordError(null); }}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Connected Accounts */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          {t('account.connectedAccounts')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          {t('account.connectedAccountsDesc')}
        </p>

        {/* Error message */}
        {googleError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {googleError}
          </div>
        )}

        {/* Google Account - LINKED */}
        {user?.is_google_linked ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                {/* Google Logo */}
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </div>

                {/* Account Info */}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {t('account.googleAccount')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.google_email || user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {t('account.connectedOn')} {formatDate(user.created_at) || t('account.recently')}
                  </p>
                </div>
              </div>

              {/* Profile Picture (if available) */}
              {user.google_picture && (
                <img
                  src={user.google_picture}
                  alt="Google Profile"
                  className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                />
              )}

              {/* Unlink Button */}
              {!showUnlinkConfirm ? (
                <Button onClick={() => setShowUnlinkConfirm(true)} variant="secondary" className="text-sm">
                  {t('settings.account.unlinkGoogle')}
                </Button>
              ) : (
                <div className="w-full p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3 text-center">
                    {t('account.unlinkConfirm')}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleUnlinkGoogle} isLoading={isUnlinkingGoogle} className="bg-yellow-600 hover:bg-yellow-700 text-sm">
                      {t('account.yesUnlink')}
                    </Button>
                    <Button onClick={() => setShowUnlinkConfirm(false)} variant="secondary" className="text-sm">
                      {t('common.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Google Account - NOT LINKED */
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('account.noGoogleConnected')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('account.noGoogleDesc')}
            </p>
            <Button onClick={handleLinkGoogle} isLoading={isLinkingGoogle}>
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </span>
              {t('settings.account.linkGoogle')}
            </Button>
          </div>
        )}
      </Card>

      {/* Export Data */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-gray-600 dark:text-gray-300 text-center">
          {t('account.exportData')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          {t('account.exportDataDesc')}
        </p>
        <div className="flex justify-center">
          <Button onClick={handleExportData} disabled={isExporting}>
            {isExporting ? t('account.exporting') : t('account.exportDataBtn')}
          </Button>
        </div>
      </Card>

      {/* Delete Account */}
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400 text-center">
          {t('account.dangerZone')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
          <strong>⚠️</strong> {t('account.dangerZoneDesc')}
        </p>

        {!showDeleteConfirm ? (
          <div className="flex justify-center">
            <Button onClick={() => setShowDeleteConfirm(true)} className="bg-red-500 hover:bg-red-600">
              {t('settings.account.deleteAccount')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deleteError && <div className="text-red-500 dark:text-gray-400 text-sm">{deleteError}</div>}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4">
              <p className="font-semibold text-red-800 dark:text-red-300 mb-2">
                {t('account.areYouSure')}
              </p>
              <p className="text-sm text-red-700 mb-4">
                {t('account.deleteConfirmDesc')}
              </p>
              <Input
                type="password"
                label={t('account.enterPasswordConfirm')}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Password"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                {t('account.yesDeleteAccount')}
              </Button>
              <Button onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteError(null); }}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { PasswordInput } from "../../components/common/PasswordInput";
import { showToast } from "../../utils/toast";
import apiClient from "../../services/api/api";
import { API_ENDPOINTS } from "../../utils/constants";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // No token in URL — show invalid link state
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Invalid Link
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                This password reset link is invalid or missing.
              </p>
              <Link
                to="/forgot-password"
                className="block text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Request a new reset link
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        new_password: newPassword,
      });
      setSuccess(true);
      showToast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        "Failed to reset password. The link may have expired.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Password Reset!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Your password has been updated. Redirecting to login...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Reset Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your new password below.
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              showRequirements={true}
              required
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Reset Password
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

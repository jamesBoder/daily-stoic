import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import apiClient from "../../services/api/api";
import { showToast } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/constants";

export const VerifyEmailPending: React.FC = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || "";
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      await apiClient.post(API_ENDPOINTS.RESEND_VERIFICATION, { email });
      setResent(true);
      showToast.success("Verification email resent!");
    } catch {
      showToast.error("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-6xl">📧</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Check your email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We sent a verification link to{" "}
              {email ? (
                <strong className="text-gray-900 dark:text-gray-100">
                  {email}
                </strong>
              ) : (
                "your email address"
              )}
              . Click the link to activate your account.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              The link expires in 24 hours.
            </p>

            {!resent ? (
              <div className="pt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Didn't receive it?
                </p>
                <Button
                  variant="secondary"
                  onClick={handleResend}
                  isLoading={isResending}
                  disabled={!email || isResending}
                  className="w-full"
                >
                  Resend verification email
                </Button>
              </div>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Verification email resent!
              </p>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/login"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

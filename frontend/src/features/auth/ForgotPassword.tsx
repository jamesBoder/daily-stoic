import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/common/Card";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import apiClient from "../../services/api/api";
import { API_ENDPOINTS } from "../../utils/constants";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      // Backend always returns 200 (prevents user enumeration)
      setSubmitted(true);
    } catch {
      // Only show error for network/server failures
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">📬</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Check your email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                If an account with{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {email}
                </strong>{" "}
                exists, we've sent a password reset link. The link expires in 1
                hour.
              </p>
              <Link
                to="/login"
                className="block text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Back to login
              </Link>
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
            Forgot Password
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link.
          </p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              Send Reset Link
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

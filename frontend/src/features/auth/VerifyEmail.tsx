import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loading } from "../../components/common/Loading";
import apiClient from "../../services/api/api";
import { showToast } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/constants";

type VerifyStatus = "verifying" | "success" | "expired" | "error";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found in the link.");
      return;
    }
    verifyToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await apiClient.post<{ message: string; token: string }>(
        API_ENDPOINTS.VERIFY_EMAIL,
        { token }
      );
      // Auto-login with the returned JWT
      await loginWithToken(response.data.token);
      setStatus("success");
      showToast.success("Email verified! Welcome to DailyXam 🎉");
      setTimeout(() => navigate("/onboarding"), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Verification failed.";
      if (msg.toLowerCase().includes("expired")) {
        setStatus("expired");
      } else {
        setStatus("error");
      }
      setErrorMessage(msg);
    }
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4 py-4">
              <Loading />
              <p className="text-fg-muted">
                Verifying your email...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">✅</div>
              <h2 className="text-2xl font-bold text-fg">
                Email Verified!
              </h2>
              <p className="text-fg-muted">
                Your account is now active. Redirecting you to the app...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center space-y-4">
              <div className="text-6xl">⏰</div>
              <h2 className="text-2xl font-bold text-fg">
                Link Expired
              </h2>
              <p className="text-fg-muted">{errorMessage}</p>
              <p className="text-sm text-fg-subtle">
                Verification links expire after 24 hours.
              </p>
              <Button onClick={() => navigate("/login")} className="w-full">
                Go to Login to Resend
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // status === "error"
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-fg">
              Verification Failed
            </h2>
            <p className="text-fg-muted">{errorMessage}</p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Back to Login
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

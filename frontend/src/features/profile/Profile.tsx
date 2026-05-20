import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/api/profile";
import { UserProfile } from "../../types/profile";
import { StatsCard } from "./StatsCard";
import { ProfileEditForm } from "./ProfileEditForm";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { VerseCardSkeleton } from "../../components/common/Skeleton";
import { formatDate } from "../../utils/date";
import JourneyStats from "./JourneyStats";
import NextMilestoneBar from "./NextMilestoneBar";
import { useStreak } from "../../hooks/useStreak";

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); // ✅ Get from auth context
  const { data: streak } = useStreak();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await profileService.getProfile(); // ✅ No userId
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("profile.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      await profileService.resendVerification();
      // toast shown inside resendVerification()
    } catch {
      // toast shown inside resendVerification()
    } finally {
      setIsResendingVerification(false);
    }
  };

  if (isLoading) {
      return <VerseCardSkeleton />;
    }
    
  if (error)
    return (
      <Card>
        <div className="text-danger">Error: {error}</div>
      </Card>
    );
  if (!profile)
    return (
      <Card>
        <div>{t("profile.noData")}</div>
      </Card>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Journey Stats + Milestone Bar */}
      {streak && (
        <Card>
          <JourneyStats
            currentStreak={streak.current_streak}
            longestStreak={streak.longest_streak}
            totalReads={streak.total_reads}
          />
          <div className="mt-4">
            <NextMilestoneBar currentStreak={streak.current_streak} />
          </div>
        </Card>
      )}

      {/* Email verification banner */}
      {profile.email_verified === false && (
        <div className="bg-warning/10 dark:bg-warning/15 border border-warning/40 dark:border-warning/30 rounded-card px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-warning mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <div>
              <p className="font-display text-sm tracking-wide text-accent">
                Email not verified
              </p>
              <p className="font-sans text-sm text-fg-muted">
                Please verify your email address. Check your inbox for a verification link.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
            className="font-display text-xs tracking-wider uppercase text-accent underline hover:no-underline disabled:opacity-50 whitespace-nowrap transition-opacity"
          >
            {isResendingVerification ? "Sending..." : "Resend email"}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl text-fg title-glow-hover">{t("profile.title")}</h1>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? t("common.cancel") : t("profile.editProfile")}
        </Button>
      </div>

      {isEditing ? (
        <Card>
          <ProfileEditForm initialProfile={profile} onUpdate={handleUpdate} />
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-fg-muted">{t("profile.username")}</p>
              <p className="font-sans text-base text-fg mt-0.5">{profile.username}</p>
            </div>
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-fg-muted">{t("profile.email")}</p>
              <p className="font-sans text-base text-fg mt-0.5">{profile.email}</p>
            </div>
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-fg-muted">
                {t("profile.memberSince")}
              </p>
              <p className="font-sans text-base text-fg mt-0.5">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {user && <StatsCard />}
    </div>
  );
};

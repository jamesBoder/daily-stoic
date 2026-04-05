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
    } catch (err: any) {
      setError(err.message || t("profile.failedToLoad"));
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
        <div className="text-red-500">Error: {error}</div>
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
            <svg className="w-5 h-5 text-warning dark:text-[#c49840] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <div>
              <p className="font-display text-sm tracking-wide text-warning-dark dark:text-[#d4a853]">
                Email not verified
              </p>
              <p className="font-sans text-sm text-primary-600 dark:text-[#b0a898]">
                Please verify your email address. Check your inbox for a verification link.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResendingVerification}
            className="font-display text-xs tracking-wider uppercase text-warning dark:text-[#d4a853] underline hover:no-underline disabled:opacity-50 whitespace-nowrap transition-opacity"
          >
            {isResendingVerification ? "Sending..." : "Resend email"}
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="font-display text-3xl text-primary-800 dark:text-[#e8e0cc]">{t("profile.title")}</h1>
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
              <p className="font-display text-xs tracking-widest uppercase text-primary-500 dark:text-[#8892b8]">{t("profile.username")}</p>
              <p className="font-sans text-base text-primary-800 dark:text-[#e0ddd4] mt-0.5">{profile.username}</p>
            </div>
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-primary-500 dark:text-[#8892b8]">{t("profile.email")}</p>
              <p className="font-sans text-base text-primary-800 dark:text-[#e0ddd4] mt-0.5">{profile.email}</p>
            </div>
            <div>
              <p className="font-display text-xs tracking-widest uppercase text-primary-500 dark:text-[#8892b8]">
                {t("profile.memberSince")}
              </p>
              <p className="font-sans text-base text-primary-800 dark:text-[#e0ddd4] mt-0.5">
                {new Date(profile.created_at).toLocaleDateString(i18n.language, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </Card>
      )}

      {user && <StatsCard />}
    </div>
  );
};

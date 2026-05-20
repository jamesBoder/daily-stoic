// form for editing user profile information

// imports
import React, { useState } from "react";
import { UserProfile } from "../../types/profile";
import { profileService } from "../../services/api/profile";
import { Button } from "../../components/common/Button";
import { showToast } from "../../utils/toast";

interface ProfileEditFormProps {
  initialProfile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
}

// ProfileEditForm component
//- Username field
//- Email field (with verification)
//- Password change section
//- Form validation
//- Save/Cancel buttons

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  initialProfile,
  onUpdate,
}) => {
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    username: initialProfile.username,
    email: initialProfile.email,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const emailChanged = profileData.email !== initialProfile.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const updatedProfile = await profileService.updateProfile(profileData);
      if (emailChanged) {
        showToast.success(
          "Profile updated. A verification email has been sent to your new address."
        );
      }
      onUpdate(updatedProfile);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Failed to update profile";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-danger">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-fg-muted">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={profileData.username || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-border bg-surface-input text-fg rounded-md p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-fg-muted">Email</label>
        <input
          type="email"
          name="email"
          value={profileData.email || ""}
          onChange={handleChange}
          className="mt-1 block w-full border border-border bg-surface-input text-fg rounded-md p-2"
          required
        />
        {emailChanged && (
          <p className="mt-1 text-xs text-warning">
            ⚠ Changing your email will require re-verification. A new verification email will be sent.
          </p>
        )}
      </div>

      <div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

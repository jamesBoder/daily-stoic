// init interfaces for user profile 

export interface UserProfile {
    userId: number;
    username: string;
    email: string;
    email_verified?: boolean;
    created_at: string;
    updated_at: string;
    bio?: string;
    avatar_url?: string;
}

export interface UpdateUserProfileRequest {
    username?: string;
    email?: string;
    password?: string;
    bio?: string;
    avatar_url?: string;
}

export interface UpdateUserProfileResponse {
    message: string;
    profile: UserProfile;
}

export interface UserProfileResponse {
    profile: UserProfile;
}

export interface UserStats {
    favorite_count: number;
    history_count: number;
    comment_count: number;
    account_age_days: number;
}

export interface UserStatsResponse {
    stats: UserStats;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ChangePasswordResponse {
    message: string;
}

export interface EmailVerificationRequest {
    email: string;
}

export interface EmailVerificationResponse {
    message: string;
}

export interface VerifyEmailRequest {
    token: string;
}

export interface VerifyEmailResponse {
    message: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetResponse {
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface DeleteAccountResponse {
    message: string;
}

export interface DeleteAccountRequest {
    password: string;
}

export interface AccountDeletionResponse {
    message: string;
}

export interface AccountDeletionRequest {
    reason?: string;
}

export interface UserActivity {
    date: string;
    versesRead: number;
    notesAdded: number;
    favoritesAdded: number;
}
export interface UserActivityResponse {
    activities: UserActivity[];
}

export interface UpdateUserSettingsRequest {
    darkMode?: boolean;
    notificationsEnabled?: boolean;
}

export interface UpdateUserSettingsResponse {
    message: string;
    settings: {
        darkMode: boolean;
        notificationsEnabled: boolean;
    };
}

export interface UserSettingsResponse {
    settings: {
        darkMode: boolean;
        notificationsEnabled: boolean;
    };
}

export interface UserNotification {
    id: number;
    type: string;
    message: string;
    isRead: boolean;
    created_at: string;
}

export interface UserNotificationsResponse {
    notifications: UserNotification[];
    pagination: {
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
    };
}

export interface MarkNotificationReadRequest {
    notificationId: number;
}

export interface MarkNotificationReadResponse {
    message: string;
}

export interface MarkAllNotificationsReadResponse {
    message: string;
}

export interface DeleteNotificationRequest {
    notificationId: number;
}

export interface DeleteNotificationResponse {
    message: string;
}

export interface DeleteAllNotificationsResponse {
    message: string;
}

export interface UserPreferences {

};
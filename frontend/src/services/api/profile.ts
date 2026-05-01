// Profile Service 

// imports 
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { UpdateUserSettingsRequest, UserProfile, UserSettingsResponse, UserStats, ChangePasswordRequest, ChangePasswordResponse } from '../../types/profile';
import { Streak, Achievement } from '../../types/quote';
import { showToast } from '../../utils/toast';

// init GetUserProfileParams interface
export interface GetUserProfileParams {
    userId: string;

}

// service object wit getProfile, updateProfile and getStats methods
export const profileService = {
    // Remove userId parameter - use JWT token
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await apiClient.get<UserProfile>(
                API_ENDPOINTS.PROFILE
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load profile');
            throw error;
        }
    },

    // Remove userId parameter - use JWT token
    updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            const response = await apiClient.put<UserProfile>(
                API_ENDPOINTS.PROFILE,
                profileData
            );
            showToast.success('Profile updated successfully!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('Invalid profile data');
            } else if (error.response?.status === 409) {
                showToast.error('Username or email already taken');
            } else {
                showToast.error('Failed to update profile');
            }
            throw error;
        }
    },

    // Remove userId parameter - use JWT token
    getStats: async (): Promise<UserStats> => {
        try {
            const response = await apiClient.get<UserStats>(
                `${API_ENDPOINTS.PROFILE}/stats`
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load statistics');
            throw error;
        }
    },

    // getUserSettings method
    getUserSettings: async (): Promise<UserSettingsResponse> => {
        try {
            const response = await apiClient.get<UserSettingsResponse>(
                `${API_ENDPOINTS.PROFILE}/settings`
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load settings');
            throw error;
        }
    },

    // updateUserSettings method
    updateUserSettings: async (settings: UpdateUserSettingsRequest): Promise<UserSettingsResponse> => {
        try {
            const response = await apiClient.put<UserSettingsResponse>(
                `${API_ENDPOINTS.PROFILE}/settings`,
                settings
            );
            showToast.success('Settings saved!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('Invalid settings data');
            } else {
                showToast.error('Failed to save settings');
            }
            throw error;
        }
    },

    // setPassword method - for OAuth users to set their first password
    setPassword: async (newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                `${API_ENDPOINTS.PROFILE}/password/set`,
                { newPassword, confirmPassword }
            );
            showToast.success('Password set successfully!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Invalid password data';
                showToast.error(errorMsg);
            } else if (error.response?.status === 401) {
                showToast.error('Authentication required. Please login again.');
            } else {
                showToast.error('Failed to set password');
            }
            throw error;
        }
    },

    // changePassword method
    changePassword: async (data: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
        try {
            const response = await apiClient.put<ChangePasswordResponse>(
                `${API_ENDPOINTS.PROFILE}/password`,
                data
            );
            showToast.success('Password updated successfully!');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                const errorMsg = error.response?.data?.details || error.response?.data?.error || 'Invalid password data';
                showToast.error(errorMsg);
            } else if (error.response?.status === 401) {
                showToast.error('Authentication required. Please login again.');
            } else {
                showToast.error('Failed to update password');
            }
            throw error;
        }
    },

    deleteAccount: async (password?: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(
            `${API_ENDPOINTS.PROFILE}`,
            { data: password ? { password } : {} }
        );
        return response.data;
    },

    // resendVerification — protected route (requires JWT); for already-logged-in unverified users
    resendVerification: async (): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                API_ENDPOINTS.PROFILE_RESEND_VERIFICATION
            );
            showToast.success('Verification email sent! Check your inbox.');
            return response.data;
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Failed to resend verification email';
            showToast.error(errorMsg);
            throw error;
        }
    },

    // forgotPassword — public; no toast (ForgotPassword.tsx shows its own success state)
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                API_ENDPOINTS.FORGOT_PASSWORD,
                { email }
            );
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },

    // resetPassword — public; no toast (ResetPassword.tsx handles error display)
    resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
        try {
            const response = await apiClient.post<{ message: string }>(
                API_ENDPOINTS.RESET_PASSWORD,
                { token, new_password: newPassword }
            );
            return response.data;
        } catch (error: any) {
            throw error;
        }
    },

    // getStreak - get user's reading streak
    getStreak: async (): Promise<Streak> => {
        try {
            const response = await apiClient.get<Streak>(
                API_ENDPOINTS.STREAK
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load streak');
            throw error;
        }
    },

    // getAchievements - get user's achievements
    getAchievements: async (): Promise<Achievement[]> => {
        try {
            const response = await apiClient.get<Achievement[]>(
                `${API_ENDPOINTS.PROFILE}/achievements`
            );
            return response.data;
        } catch (error: any) {
            showToast.error('Failed to load achievements');
            throw error;
        }
    },
};


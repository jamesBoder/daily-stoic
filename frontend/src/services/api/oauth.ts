// outh api service 

// imports 

import apiClient from './client';
import { API_ENDPOINTS, API_BASE_URL } from '../../utils/constants';
import { showToast } from '../../utils/toast';

// export GoogleAuthResponse interface
export interface GoogleAuthResponse {
    user: {
        id: number;
        email: string;
        username: string;
        google_id?: string;
        google_picture?: string;
        is_google_linked: boolean;
    };
    token: string;
}

// init oauthService function
export const oauthService = {
    // get Google OAuth login URL
    getGoogleLoginUrl: (): string => {
        // google oauth login
        return `${API_BASE_URL}${API_ENDPOINTS.AUTH}/google/login`;
    },

    // link Google account
    linkGoogle: async (code: string): Promise<void> => {
        try {
            await apiClient.post(`${API_ENDPOINTS.AUTH}/google/link`, { code });
            showToast.success('Google account linked successfully!');
        } catch (error: any) {
            if (error.response?.status === 409) {
                showToast.error('This Google account is already linked to another user');
            } else if (error.response?.status === 400) {
                showToast.error('Invalid authorization code');
            } else {
                showToast.error('Failed to link Google account');
            }
            throw error;
        }
    },

    // unlink Google account
    unlinkGoogle: async (): Promise<void> => {
        try {
            await apiClient.post(`${API_ENDPOINTS.AUTH}/google/unlink`);
            showToast.success('Google account unlinked');
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('No Google account is linked');
            } else {
                showToast.error('Failed to unlink Google account');
            }
            throw error;
        }
    },

    // exchange Google authorization code for token
    exchangeGoogleCode: async (code: string, state: string): Promise<GoogleAuthResponse> => {
        try {
            const response = await apiClient.post<GoogleAuthResponse>(`${API_ENDPOINTS.AUTH}/google/callback`, { code, state });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 400) {
                showToast.error('Invalid authorization code');
            } else if (error.response?.status === 401) {
                showToast.error('Google authentication failed');
            } else {
                showToast.error('Authentication failed. Please try again.');
            }
            throw error;
        }
    },

    loginWithToken: async (token: string): Promise<GoogleAuthResponse> => {
        try {
            const response = await apiClient.post<GoogleAuthResponse>(`${API_ENDPOINTS.AUTH}/token-login`, { token });
            return response.data;
        } catch (error: any) {
            showToast.error('Authentication failed. Please try again.');
            throw error;
        }
    },
}

// history service

// correct imports
import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { HistoryResponse } from '../../types/history';
import { showToast } from '../../utils/toast';


// init GetHistoryParams interface
export interface GetHistoryParams {
    page: number;
    pageSize: number;
    search?: string;
}

// service object
export const historyService = {
    // fetch user's history with pagination and optional search
    getHistory: async (page = 1, pageSize = 20, search?: string, lang?: string) => {
        try {
            // calculate offset
            const params: Record<string, any> = { page, page_size: pageSize };
            if (search) params.search = search;
            if (lang && lang !== 'en') params.lang = lang;

            // API call with correct response type
            const response = await apiClient.get<HistoryResponse>(
                API_ENDPOINTS.HISTORY,
                { params }
            );

            // return unwrapped data
            return response.data;

        } catch (error: any) {
            // log the error for debugging
            console.error('Error fetching history:', error);

            // network error (no response)
            if (!error.response) {
                showToast.error('Network error. Please check your connection.');
                throw new Error('Network error. Please check your connection.');
            }

            // handle 404 separately if needed
            if (error.response?.status === 404) {
                return {
                    history: [],
                    pagination: { total: 0, page, page_size: pageSize, total_pages: 0 }
                };
            }
            
            // Server error
            if (error.response?.status === 500) {
                showToast.error('Server error. Please try again later.');
            } else {
                showToast.error('Failed to load history');
            }
            throw error;
        }
    },

    // clearHistory method
    clearHistory: async (): Promise<void> => {
        try {
            await apiClient.delete(API_ENDPOINTS.HISTORY);
            showToast.success('History cleared!');
        } catch (error: any) {
            console.error('Error clearing history:', error);
            showToast.error('Failed to clear history');
            throw error;
        }
    }
};

    

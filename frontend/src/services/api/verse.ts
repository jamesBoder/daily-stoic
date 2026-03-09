import apiClient from './client';
import { API_ENDPOINTS } from '../../utils/constants';
import { Verse, DailyVerseResponse } from '../../types/verse';
import { showToast } from '../../utils/toast';

export const verseService = {
  // Get daily verse
  getDailyVerse: async (language?: string): Promise<Verse> => {
    try {
      const params = language ? { lang: language } : {};
      const response = await apiClient.get<DailyVerseResponse>(
        API_ENDPOINTS.DAILY_VERSE,
        { params }
      );
      return response.data.verse;
    } catch (error: any) {
      showToast.error('Failed to load daily verse. Please refresh the page.');
      throw error;
    }
  },

  // Get verse by reference
  getVerseByReference: async (reference: string, language?: string): Promise<Verse> => {
    try {
      const params = language ? { lang: language } : {};
      const response = await apiClient.get<{ verse: Verse }>(
        `${API_ENDPOINTS.VERSE_BY_REFERENCE}/${reference}`,
        { params }
      );
      return response.data.verse;
    } catch (error: any) {
      if (error.response?.status === 404) {
        showToast.error('Verse not found');
      } else {
        showToast.error('Failed to load verse');
      }
      throw error;
    }
  },

  // Search verses
  searchVerses: async (query: string, language?: string): Promise<Verse[]> => {
    try {
      const params: any = { q: query };
      if (language) {
        params.lang = language;
      }
      const response = await apiClient.get<{ verses: Verse[] }>(
        API_ENDPOINTS.SEARCH_VERSES,
        { params }
      );
      return response.data.verses;
    } catch (error: any) {
      showToast.error('Search failed. Please try again.');
      throw error;
    }
  },
};

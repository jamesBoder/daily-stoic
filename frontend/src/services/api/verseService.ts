import apiClient from './api';

export interface Verse {
  id: number;
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number;
  version: string;
  translation?: string;
}

export interface DailyVerseResponse {
  verse: Verse;
}

export const verseService = {
  // Get daily verse
  getDailyVerse: async (): Promise<Verse> => {
    const response = await apiClient.get<DailyVerseResponse>('/api/verses/daily');
    return response.data.verse;
  },

  // Get verse by reference
  getVerseByReference: async (reference: string): Promise<Verse> => {
    const response = await apiClient.get<{ verse: Verse }>(
      `/api/verses/${reference}`
    );
    return response.data.verse;
  },

  // Search verses
  searchVerses: async (query: string): Promise<Verse[]> => {
    const response = await apiClient.get<{ verses: Verse[] }>(
      '/api/verses/search',
      { params: { q: query } }
    );
    return response.data.verses;
  },
};

import { useQuery } from '@tanstack/react-query';
import { verseService } from '../services/api/verse';

export const useVerse = (language: string = 'en') => {
  // Include today's date and language in the query key so cache invalidates daily and per language
  // This ensures when the verse updates or language changes, React Query fetches the new one
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dailyVerse', today, language],
    queryFn: () => verseService.getDailyVerse(language),
    staleTime: 60 * 60 * 1000, // 1 hour - verse won't change within a day
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep yesterday's verse in cache
  });

  return {
    verse: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refetch,
  };
};

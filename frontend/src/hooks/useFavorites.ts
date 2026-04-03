import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { favoriteService } from '../services/api/favorite';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { isGuest, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites', lang],
    queryFn: () => favoriteService.getFavorites(1, 100, undefined, lang),
    enabled: isAuthenticated && !isGuest, // skip for guests and unauthenticated users (prevents 401)
    select: (response) => response.favorites,
  });

  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (verseId: number) => {
      // Pitfall 14: guard mutations — guests should never reach here, but safety net
      if (isGuest) return Promise.resolve(null as any);
      return favoriteService.addFavorite(verseId);
    },
    onSuccess: () => {
      if (!isGuest) queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (favoriteId: number) => {
      // Pitfall 14: guard mutations — guests should never reach here, but safety net
      if (isGuest) return Promise.resolve(null as any);
      return favoriteService.removeFavorite(favoriteId);
    },
    onSuccess: () => {
      if (!isGuest) queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });



  const isFavorited = (quoteId: number): boolean => {
    return (data ?? []).some(fav => fav.quote_id === quoteId);
  };


  const getFavoriteId = (quoteId: number): number | null => {
    const favorite = (data ?? []).find(fav => fav.quote_id === quoteId);
    return favorite ? favorite.id : null;
  };
  
  const toggleFavorite = async (quoteId: number) => {
    if (isFavorited(quoteId)) {
      const favoriteId = getFavoriteId(quoteId);
      if (favoriteId) {
        await removeMutation.mutateAsync(favoriteId);
      }
    } else {
      await addMutation.mutateAsync(quoteId);
    }
  };



  return {
    favorites: data ?? [],
    isLoading,
    error: error?.message ?? null,
    addFavorite: (quoteId: number) => addMutation.mutateAsync(quoteId),
    removeFavorite: (favoriteId: number) => removeMutation.mutateAsync(favoriteId),
    isFavorited,
    toggleFavorite,
    getFavoriteId,
    refetch,
    // Bonus: individual loading states
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
};
};






import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { favoriteService } from '../services/api/favorite';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { isGuest } = useAuth();
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['favorites', lang],
    queryFn: () => favoriteService.getFavorites(1, 100, undefined, lang),
    enabled: !isGuest, // Pitfall 1: skip API call entirely for guests (prevents 401)
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



  const isFavorited = (verseId: number): boolean => {
    return (data ?? []).some(fav => fav.verse_id === verseId);
  };


  const getFavoriteId = (verseId: number): number | null => {
    const favorite = (data ?? []).find(fav => fav.verse_id === verseId);
    return favorite ? favorite.id : null;
  };



  return {
    favorites: data ?? [],
    isLoading,
    error: error?.message ?? null,
    addFavorite: (verseId: number) => addMutation.mutateAsync(verseId),
    removeFavorite: (favoriteId: number) => removeMutation.mutateAsync(favoriteId),
    isFavorited,
    getFavoriteId,
    refetch,
    // Bonus: individual loading states
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
};
};






// Custom hook for history management with React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { historyService } from '../services/api/history';


export const useHistory = (enabled = true) => {
    const { i18n } = useTranslation();
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['history', i18n.language],
        queryFn: () => historyService.getHistory(1, 30, undefined, i18n.language),
        staleTime: 5 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled,
    });

    const clearMutation = useMutation({
        mutationFn: () => historyService.clearHistory(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] });
        },
    });

    return {
        history: data?.history ?? [],
        isLoading,
        error: error?.message ?? null,
        refetch,
        clearHistory: () => clearMutation.mutateAsync(),
        isClearing: clearMutation.isPending,
    };
};

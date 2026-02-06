import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

/**
 * Hook for search with React Query caching
 * Automatically caches search results for 2 minutes
 */
export function useSearchQuery(query: string, searchMode: 'keywords' | 'username' = 'keywords') {
  return useQuery({
    queryKey: ['search', query, searchMode],
    queryFn: async () => {
      const response = await apiClient.post('/trends/search', { query, mode: searchMode });
      return response.data;
    },
    enabled: !!query && query.length > 0, // Только если есть query
    staleTime: 2 * 60 * 1000, // 2 минуты - данные свежие
    gcTime: 5 * 60 * 1000, // 5 минут - хранить в памяти
    retry: 1,
  });
}

/**
 * Hook for getting saved/favorite videos with caching
 */
export function useFavoritesQuery() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await apiClient.get('/favorites');
      return response.data;
    },
    staleTime: 1 * 60 * 1000, // 1 минута
    gcTime: 10 * 60 * 1000, // 10 минут
  });
}

/**
 * Hook for adding to favorites with cache update
 */
export function useAddFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trendId: string) => {
      const response = await apiClient.post('/favorites', { trend_id: trendId });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate favorites query to refetch
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

/**
 * Hook for removing from favorites with cache update
 */
export function useRemoveFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: number) => {
      const response = await apiClient.delete(`/favorites/${favoriteId}`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate favorites query to refetch
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

/**
 * Hook for getting competitors with caching
 */
export function useCompetitorsQuery() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: async () => {
      const response = await apiClient.get('/competitors');
      return response.data;
    },
    staleTime: 3 * 60 * 1000, // 3 минуты
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for getting AI scripts with caching
 */
export function useAIScriptsQuery() {
  return useQuery({
    queryKey: ['ai-scripts'],
    queryFn: async () => {
      const response = await apiClient.get('/ai-scripts/my-scripts');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 минут - скрипты меняются редко
    gcTime: 15 * 60 * 1000,
  });
}

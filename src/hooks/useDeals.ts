/**
 * useDeals Hook
 * Custom hook for managing deals with React Query
 * Provides caching and automatic refetching
 */

import { useQuery } from './useReactQuery';
import { fetchDeals } from '../services/deals';
import type { Deal } from '../types/deals';

/**
 * Query key for deals - used for caching and invalidation
 */
const DEALS_QUERY_KEY = ['deals'] as const;

type UseDealsReturn = {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

/**
 * Custom hook for managing deals with React Query
 * Handles fetching deals data with caching
 */
export const useDeals = (): UseDealsReturn => {
  /**
   * Fetch deals query
   */
  const {
    data: deals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: DEALS_QUERY_KEY,
    queryFn: fetchDeals,
  });

  /**
   * Return the hook API
   */
  return {
    deals,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

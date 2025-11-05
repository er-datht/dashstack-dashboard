/**
 * useBanners Hook
 * Custom hook for managing promotional banners with React Query
 * Provides caching and automatic refetching
 */

import { useQuery } from "./useReactQuery";
import { getPromotionalBanners } from "../services/products";
import type { PromotionalBanner } from "../types/product";

/**
 * Query key for promotional banners - used for caching and invalidation
 */
const BANNERS_QUERY_KEY = ["promotional-banners"] as const;

type UseBannersReturn = {
  banners: PromotionalBanner[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

/**
 * Custom hook for managing promotional banners with React Query
 * Handles fetching banners with caching and error handling
 */
export const useBanners = (): UseBannersReturn => {
  /**
   * Fetch promotional banners query
   */
  const {
    data: banners = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: BANNERS_QUERY_KEY,
    queryFn: getPromotionalBanners,
  });

  /**
   * Return the hook API
   */
  return {
    banners,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

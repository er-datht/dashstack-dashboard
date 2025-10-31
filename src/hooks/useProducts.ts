/**
 * useProducts Hook
 * Custom hook for managing products with React Query
 * Provides caching and automatic refetching
 */

import { useQuery } from "./useReactQuery";
import { getProducts } from "../services/products";
import type { Product } from "../types/product";

/**
 * Query key for products - used for caching and invalidation
 */
const PRODUCTS_QUERY_KEY = ["products"] as const;

type UseProductsReturn = {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

/**
 * Custom hook for managing products with React Query
 * Handles fetching products with caching and error handling
 */
export const useProducts = (): UseProductsReturn => {
  /**
   * Fetch products query
   */
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: getProducts,
  });

  /**
   * Return the hook API
   */
  return {
    products,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

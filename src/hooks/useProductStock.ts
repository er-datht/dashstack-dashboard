/**
 * useProductStock Hook
 * Custom hook for managing ProductStock data with React Query.
 * Provides optimistic delete + update mutations with rollback,
 * modeled on `useTodos`. Persistence (localStorage) lives inside
 * `productStockService` per design.md D4.
 */

import { useQuery, useMutation, useQueryClient } from "./useReactQuery";
import { productStockService } from "../services/productStock";
import type { ProductStock } from "../types/productStock";

/**
 * Query key for product stock — used for caching and invalidation.
 */
const PRODUCT_STOCK_QUERY_KEY = ["productStock"] as const;

type UseProductStockReturn = {
  products: ProductStock[];
  isLoading: boolean;
  error: string | null;
  deleteProduct: (id: string) => Promise<void>;
  updateProduct: (
    id: string,
    patch: Partial<ProductStock>,
  ) => Promise<ProductStock>;
  refetch: () => Promise<unknown>;
  isDeletingProduct: boolean;
  isUpdatingProduct: boolean;
};

/**
 * Custom hook for managing ProductStock data with React Query.
 * Handles fetching, deleting, and updating with optimistic updates.
 */
export const useProductStock = (): UseProductStockReturn => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PRODUCT_STOCK_QUERY_KEY,
    queryFn: productStockService.getProductStock,
  });

  /**
   * Delete mutation with optimistic update + rollback.
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await productStockService.deleteProduct(id);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: PRODUCT_STOCK_QUERY_KEY });

      const previousProducts = queryClient.getQueryData<ProductStock[]>(
        PRODUCT_STOCK_QUERY_KEY,
      );

      queryClient.setQueryData<ProductStock[]>(
        PRODUCT_STOCK_QUERY_KEY,
        (old = []) => old.filter((product) => product.id !== id),
      );

      return { previousProducts };
    },
    onError: (error, _variables, context) => {
      console.error("Error deleting product:", error);
      if (context?.previousProducts) {
        queryClient.setQueryData<ProductStock[]>(
          PRODUCT_STOCK_QUERY_KEY,
          context.previousProducts,
        );
      }
    },
  });

  /**
   * Update mutation with optimistic merge + rollback. On success the
   * optimistic entry is replaced with the server-returned merged record.
   */
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<ProductStock>;
    }) => {
      return await productStockService.updateProduct(id, patch);
    },
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: PRODUCT_STOCK_QUERY_KEY });

      const previousProducts = queryClient.getQueryData<ProductStock[]>(
        PRODUCT_STOCK_QUERY_KEY,
      );

      queryClient.setQueryData<ProductStock[]>(
        PRODUCT_STOCK_QUERY_KEY,
        (old = []) =>
          old.map((product) =>
            product.id === id ? { ...product, ...patch } : product,
          ),
      );

      return { previousProducts };
    },
    onSuccess: (updatedProduct) => {
      queryClient.setQueryData<ProductStock[]>(
        PRODUCT_STOCK_QUERY_KEY,
        (old = []) =>
          old.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
      );
    },
    onError: (error, _variables, context) => {
      console.error("Error updating product:", error);
      if (context?.previousProducts) {
        queryClient.setQueryData<ProductStock[]>(
          PRODUCT_STOCK_QUERY_KEY,
          context.previousProducts,
        );
      }
    },
  });

  return {
    products,
    isLoading,
    error: error ? (error as Error).message : null,
    deleteProduct: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    updateProduct: (id: string, patch: Partial<ProductStock>) =>
      updateMutation.mutateAsync({ id, patch }),
    refetch,
    isDeletingProduct: deleteMutation.isPending,
    isUpdatingProduct: updateMutation.isPending,
  };
};

import { useQuery } from "./useReactQuery";
import { getProductById } from "../services/products";
import type { Product } from "../types/product";

type UseProductReturn = {
  product: Product | undefined;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

export const useProduct = (id?: string): UseProductReturn => {
  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    // Disabled when id is falsy so callers can pass route params directly
    // (useParams returns undefined before the route matches).
    enabled: !!id,
  });

  return {
    product,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

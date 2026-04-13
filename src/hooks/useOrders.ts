/**
 * useOrders Hook
 * Custom hook for managing orders with React Query
 */

import { useQuery } from "./useReactQuery";
import { getOrders } from "../services/orders";
import type { OrderListItem } from "../types/orders";

const ORDERS_QUERY_KEY = ["orders"] as const;

type UseOrdersReturn = {
  orders: OrderListItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

export const useOrders = (): UseOrdersReturn => {
  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: getOrders,
  });

  return {
    orders,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

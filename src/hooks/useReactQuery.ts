/**
 * React Query Configuration
 * Provides a configured QueryClient and custom hooks for the application
 */

import {
  QueryClient,
  useQuery as useReactQueryBase,
  useMutation as useReactQueryMutationBase,
  useQueryClient as useReactQueryClientBase,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

/**
 * Configured QueryClient instance with default options
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for this duration
      gcTime: 10 * 60 * 1000, // 10 minutes - unused data is garbage collected after this time (formerly cacheTime)
    },
    mutations: {
      retry: 1, // Retry failed mutations once
    },
  },
});

/**
 * Custom useQuery hook that uses the configured QueryClient
 * Drop-in replacement for @tanstack/react-query's useQuery
 */
export const useQuery = <
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  return useReactQueryBase(options);
};

/**
 * Custom useMutation hook that uses the configured QueryClient
 * Drop-in replacement for @tanstack/react-query's useMutation
 */
export const useMutation = <
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) => {
  return useReactQueryMutationBase(options);
};

/**
 * Custom hook to access the configured QueryClient instance
 * Drop-in replacement for @tanstack/react-query's useQueryClient
 * @returns The configured QueryClient instance
 */
export const useQueryClient = () => {
  return useReactQueryClientBase();
};

/**
 * Export the configured QueryClient for use in non-hook contexts
 * (e.g., setting up QueryClientProvider)
 */
export { queryClient };

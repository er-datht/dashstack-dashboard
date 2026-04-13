## 1. Verify API Clients

- [ ] 1.1 Confirm `apiService` in `src/services/api.ts` exports get/post/put/patch/delete with generic typing
- [ ] 1.2 Confirm `apiClient` in `src/configs/api.ts` has request interceptor for Bearer token injection
- [ ] 1.3 Confirm `apiClient` has response interceptor for 401 redirect to login
- [ ] 1.4 Confirm `appConfig` centralizes API, auth, pagination, and feature flag settings

## 2. Verify React Query Configuration

- [ ] 2.1 Confirm QueryClient in `useReactQuery.ts` has staleTime:5min, gcTime:10min, retry:1, refetchOnWindowFocus:false
- [ ] 2.2 Confirm queryClient is a singleton export
- [ ] 2.3 Confirm QueryClientProvider wraps the app in `src/App.tsx`

## 3. Verify Domain Services

- [ ] 3.1 Confirm products.ts provides mock data with simulated delays
- [ ] 3.2 Confirm todos.ts transforms ApiTodo → TodoItem via the fetch-based apiService
- [ ] 3.3 Confirm deals.ts transforms AlbumResponse → Deal from /albums endpoint
- [ ] 3.4 Confirm productStock.ts provides mock product stock data

## 4. Verify Domain Hooks

- [ ] 4.1 Confirm useProducts returns { products, isLoading, error, refetch }
- [ ] 4.2 Confirm useTodos provides addTodo, updateTodo, deleteTodo with optimistic updates
- [ ] 4.3 Confirm useDeals and useBanners follow the standard query hook pattern

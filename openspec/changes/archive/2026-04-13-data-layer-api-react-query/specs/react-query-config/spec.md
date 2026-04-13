## ADDED Requirements

### Requirement: Configured QueryClient singleton
The application SHALL export a configured `queryClient` singleton from `src/hooks/useReactQuery.ts` with staleTime of 5 minutes, gcTime of 10 minutes, retry count of 1, and refetchOnWindowFocus disabled.

#### Scenario: Query staleness
- **WHEN** a query result is less than 5 minutes old
- **THEN** React Query considers it fresh and does not refetch on mount

#### Scenario: Garbage collection
- **WHEN** a query has no active observers for 10 minutes
- **THEN** React Query garbage-collects the cached data

#### Scenario: Retry on failure
- **WHEN** a query fails
- **THEN** React Query retries the request exactly once before reporting the error

#### Scenario: No refetch on window focus
- **WHEN** the user returns to the browser tab
- **THEN** React Query does NOT automatically refetch active queries

### Requirement: Domain query hooks
The application SHALL provide domain-specific query hooks (`useProducts`, `useDeals`, `useBanners`) that wrap `useQuery` and return `{ data, isLoading, error, refetch }` with domain-appropriate naming (e.g., `products` instead of `data`).

#### Scenario: Products query hook
- **WHEN** a component calls `useProducts()`
- **THEN** it receives `{ products, isLoading, error, refetch }` backed by React Query

### Requirement: Mutation hooks with optimistic updates
The `useTodos` hook SHALL provide mutation functions (`addTodo`, `updateTodo`, `deleteTodo`) with optimistic updates that immediately reflect changes in the UI and rollback on error.

#### Scenario: Optimistic todo addition
- **WHEN** `addTodo()` is called with new todo data
- **THEN** the todo appears in the UI immediately AND if the API call fails, the optimistic update is rolled back

#### Scenario: Mutation loading states
- **WHEN** a mutation is in progress
- **THEN** the hook exposes loading booleans (`isAddingTodo`, `isUpdatingTodo`, `isDeletingTodo`)

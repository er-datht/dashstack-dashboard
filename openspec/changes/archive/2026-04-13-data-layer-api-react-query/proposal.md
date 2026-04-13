## Why

Document the data layer architecture of DashStack, including the dual API client system, React Query configuration, domain services, and domain hooks. The application uses two parallel API clients (fetch-based and Axios) with different use cases, centralized server state management via TanStack React Query, and a service-hook pattern for data fetching. This spec captures the existing data architecture to guide consistent API integration and prevent misuse of the two clients.

## What Changes

- Document the two API clients and their distinct use cases (fetch-based for services, Axios for authenticated calls)
- Document React Query configuration (stale/gc times, retry, refetch behavior)
- Document domain services pattern (API DTOs → internal types transformation)
- Document domain hooks with optimistic updates and rollback pattern
- Document centralized app configuration (API, auth, pagination, feature flags)

## Capabilities

### New Capabilities
- `api-clients`: Dual API client architecture — fetch-based `apiService` and Axios `apiClient` with interceptors, token injection, and 401 handling
- `react-query-config`: TanStack React Query setup with configured defaults, domain query hooks, and mutation hooks with optimistic updates
- `domain-services`: Service layer pattern for API calls, DTO transformation, and mock data for development

### Modified Capabilities

## Impact

- **Files**: `src/services/api.ts`, `src/configs/api.ts`, `src/configs/app-config.ts`, `src/hooks/useReactQuery.ts`, `src/hooks/use*.ts`, `src/services/*.ts`
- **Convention**: Most services use the fetch-based client; Axios is for authenticated calls with interceptors
- **Convention**: Domain hooks wrap React Query and expose a clean API to components
